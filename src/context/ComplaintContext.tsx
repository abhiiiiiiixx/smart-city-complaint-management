import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Complaint,
  ComplaintCategory,
  Department,
  Officer,
  ComplaintUpdate,
  Feedback,
  Notification,
  ComplaintPriority,
  ComplaintStatus,
} from '../types/database';
import {
  DEMO_COMPLAINTS,
  DEMO_DEPARTMENTS,
  DEMO_CATEGORIES,
  DEMO_OFFICERS,
  DEMO_UPDATES,
  DEMO_FEEDBACK,
  DEMO_NOTIFICATIONS,
  DEMO_PROFILES,
} from '../lib/mockData';
import { generateComplaintId } from '../lib/utils';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface SubmitComplaintData {
  citizenId: string;
  categoryId: string;
  title: string;
  description: string;
  priority: ComplaintPriority;
  address: string;
  wardOrArea: string;
  latitude: number;
  longitude: number;
  imageUrls: string[];
}

interface ComplaintContextType {
  complaints: Complaint[];
  departments: Department[];
  categories: ComplaintCategory[];
  officers: Officer[];
  updates: ComplaintUpdate[];
  feedbackList: Feedback[];
  notifications: Notification[];
  unreadNotificationCount: number;
  isLoading: boolean;
  submitComplaint: (data: SubmitComplaintData) => Promise<{ success: boolean; complaint?: Complaint; error?: string }>;
  assignComplaint: (
    complaintId: string,
    departmentId: string,
    officerId?: string,
    notes?: string,
    assignedBy?: string
  ) => Promise<{ success: boolean }>;
  updateComplaintStatus: (
    complaintId: string,
    newStatus: ComplaintStatus,
    remarks: string,
    proofImages?: string[],
    updatedBy?: string,
    updatedByName?: string
  ) => Promise<{ success: boolean }>;
  rateComplaint: (
    complaintId: string,
    citizenId: string,
    rating: number,
    comments: string
  ) => Promise<{ success: boolean }>;
  reopenComplaint: (
    complaintId: string,
    citizenId: string,
    reason: string
  ) => Promise<{ success: boolean }>;
  changePriority: (
    complaintId: string,
    priority: ComplaintPriority,
    changedBy?: string,
    changedByName?: string
  ) => Promise<{ success: boolean }>;
  markNotificationRead: (notificationId: string) => void;
  markAllNotificationsRead: () => void;
  addDepartment: (dept: Omit<Department, 'id' | 'created_at'>) => void;
  addCategory: (cat: Omit<ComplaintCategory, 'id'>) => void;
  getComplaintById: (id: string) => Complaint | undefined;
  getComplaintByNumber: (num: string) => Complaint | undefined;
  deleteComplaint: (complaintId: string) => Promise<{ success: boolean }>;
  resetComplaints: () => void;
}

const ComplaintContext = createContext<ComplaintContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_PREFIX = 'smart_city_';

export const ComplaintProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [complaints, setComplaints] = useState<Complaint[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}complaints`);
    return saved ? JSON.parse(saved) : DEMO_COMPLAINTS;
  });

  const [departments, setDepartments] = useState<Department[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}departments`);
    return saved ? JSON.parse(saved) : DEMO_DEPARTMENTS;
  });

  const [categories, setCategories] = useState<ComplaintCategory[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}categories`);
    return saved ? JSON.parse(saved) : DEMO_CATEGORIES;
  });

  const [officers, setOfficers] = useState<Officer[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}officers`);
    return saved ? JSON.parse(saved) : DEMO_OFFICERS;
  });

  const [updates, setUpdates] = useState<ComplaintUpdate[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}updates`);
    return saved ? JSON.parse(saved) : DEMO_UPDATES;
  });

  const [feedbackList, setFeedbackList] = useState<Feedback[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}feedback`);
    return saved ? JSON.parse(saved) : DEMO_FEEDBACK;
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}notifications`);
    return saved ? JSON.parse(saved) : DEMO_NOTIFICATIONS;
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Sync to local storage for persistence across reloads
  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}complaints`, JSON.stringify(complaints));
  }, [complaints]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}updates`, JSON.stringify(updates));
  }, [updates]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}feedback`, JSON.stringify(feedbackList));
  }, [feedbackList]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}notifications`, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}departments`, JSON.stringify(departments));
  }, [departments]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}categories`, JSON.stringify(categories));
  }, [categories]);

  // Load from Supabase if live credentials configured
  useEffect(() => {
    if (isSupabaseConfigured()) {
      const fetchLiveData = async () => {
        setIsLoading(true);
        try {
          const { data: catData } = await supabase.from('complaint_categories').select('*');
          if (catData && catData.length > 0) setCategories(catData);

          const { data: deptData } = await supabase.from('departments').select('*');
          if (deptData && deptData.length > 0) setDepartments(deptData);

          const { data: compData } = await supabase.from('complaints').select('*').order('created_at', { ascending: false });
          if (compData && compData.length > 0) setComplaints(compData);
        } catch (err) {
          console.error('Error fetching Supabase data:', err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchLiveData();
    }
  }, []);

  // Helper to attach joined objects to complaints
  const enrichedComplaints = complaints.map((c) => {
    const category = categories.find((cat) => cat.id === c.category_id);
    const department = departments.find((d) => d.id === c.assigned_department_id);
    const officer = officers.find((o) => o.id === c.assigned_officer_id);
    const feedback = feedbackList.find((f) => f.complaint_id === c.id);
    let citizen = DEMO_PROFILES.find((p) => p.id === c.citizen_id);
    if (!citizen) {
      try {
        const savedUsers = localStorage.getItem('smart_city_all_users');
        if (savedUsers) {
          const parsed = JSON.parse(savedUsers);
          citizen = parsed.find((p: any) => p.id === c.citizen_id);
        }
      } catch (e) {}
    }

    return {
      ...c,
      category,
      department,
      officer,
      feedback,
      citizen,
    };
  });

  const unreadNotificationCount = notifications.filter((n) => !n.is_read).length;

  const getComplaintById = (id: string) => {
    return enrichedComplaints.find((c) => c.id === id);
  };

  const getComplaintByNumber = (num: string) => {
    const cleanNum = num.trim().toUpperCase();
    return enrichedComplaints.find(
      (c) => c.complaint_number.toUpperCase() === cleanNum
    );
  };

  const submitComplaint = async (
    data: SubmitComplaintData
  ): Promise<{ success: boolean; complaint?: Complaint; error?: string }> => {
    setIsLoading(true);
    try {
      const nextSequence = complaints.length + 1;
      const complaintNumber = generateComplaintId(nextSequence);

      // Auto-suggest department based on category
      const cat = categories.find((c) => c.id === data.categoryId);
      const suggestedDeptId = cat ? cat.default_department_id : departments[0]?.id;

      const newComplaint: Complaint = {
        id: `comp-${Date.now()}`,
        complaint_number: complaintNumber,
        citizen_id: data.citizenId,
        category_id: data.categoryId,
        assigned_department_id: suggestedDeptId,
        title: data.title,
        description: data.description,
        priority: data.priority,
        status: 'Submitted',
        address: data.address,
        ward_or_area: data.wardOrArea,
        latitude: data.latitude,
        longitude: data.longitude,
        image_urls: data.imageUrls,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (isSupabaseConfigured()) {
        const { error } = await supabase.from('complaints').insert([newComplaint]);
        if (error) {
          console.warn('Supabase insert failed, saving to local state:', error);
        }
      }

      setComplaints((prev) => [newComplaint, ...prev]);

      // Create initial update log
      const initialUpdate: ComplaintUpdate = {
        id: `upd-${Date.now()}`,
        complaint_id: newComplaint.id,
        updated_by: data.citizenId,
        updated_by_name: 'Citizen (Submission)',
        from_status: 'Submitted',
        to_status: 'Submitted',
        remarks: `Grievance submitted by citizen with priority ${data.priority}.`,
        created_at: new Date().toISOString(),
      };
      setUpdates((prev) => [initialUpdate, ...prev]);

      // Create Citizen Confirmation Notification
      const citizenNotif: Notification = {
        id: `notif-${Date.now()}-cit`,
        user_id: data.citizenId,
        complaint_id: newComplaint.id,
        complaint_number: complaintNumber,
        title: `Grievance Registered: ${complaintNumber}`,
        message: `Your civic grievance has been officially registered with Jabalpur Municipal Corporation under ${data.priority} priority (${data.wardOrArea}). Assigned Department: ${
          departments.find((d) => d.id === suggestedDeptId)?.name || 'Central Command'
        }. SLA tracking active.`,
        type: 'system',
        is_read: false,
        created_at: new Date().toISOString(),
      };

      // Create Admin Notification
      const adminNotif: Notification = {
        id: `notif-${Date.now()}-adm`,
        user_id: 'usr-admin-01',
        complaint_id: newComplaint.id,
        complaint_number: complaintNumber,
        title: `New Grievance Submitted: ${complaintNumber}`,
        message: `New complaint filed in ${data.wardOrArea} (${cat?.name || 'Civic'}). Priority: ${data.priority}`,
        type: 'status_change',
        is_read: false,
        created_at: new Date().toISOString(),
      };

      setNotifications((prev) => [citizenNotif, adminNotif, ...prev]);

      setIsLoading(false);
      return { success: true, complaint: newComplaint };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err.message || 'Failed to submit complaint' };
    }
  };

  const assignComplaint = async (
    complaintId: string,
    departmentId: string,
    officerId?: string,
    notes?: string,
    assignedBy = 'usr-admin-01'
  ): Promise<{ success: boolean }> => {
    const comp = complaints.find((c) => c.id === complaintId);
    if (!comp) return { success: false };

    const dept = departments.find((d) => d.id === departmentId);
    const off = officers.find((o) => o.id === officerId);

    const oldStatus = comp.status;
    const newStatus: ComplaintStatus = 'Assigned';

    setComplaints((prev) =>
      prev.map((c) =>
        c.id === complaintId
          ? {
              ...c,
              assigned_department_id: departmentId,
              assigned_officer_id: officerId || c.assigned_officer_id,
              status: newStatus,
              updated_at: new Date().toISOString(),
            }
          : c
      )
    );

    // Add update entry
    const assignmentUpdate: ComplaintUpdate = {
      id: `upd-${Date.now()}`,
      complaint_id: complaintId,
      updated_by: assignedBy,
      updated_by_name: 'Municipal Administrator',
      from_status: oldStatus,
      to_status: newStatus,
      remarks: `Assigned to ${dept?.name || 'Department'}${
        off ? ` (Officer: ${off.designation} - ${off.badge_number})` : ''
      }. Notes: ${notes || 'Assigned for immediate resolution.'}`,
      created_at: new Date().toISOString(),
    };
    setUpdates((prev) => [assignmentUpdate, ...prev]);

    // Send notifications
    const citizenNotif: Notification = {
      id: `notif-${Date.now()}-c`,
      user_id: comp.citizen_id,
      complaint_id: comp.id,
      complaint_number: comp.complaint_number,
      title: `Authority Assigned: ${comp.complaint_number}`,
      message: `Your grievance has been officially routed to ${dept?.name || 'Department'}.${
        off ? ` Designated Authority: ${off.designation} (${off.badge_number}).` : ''
      } Field inspection team has been scheduled in ${comp.ward_or_area}.`,
      type: 'assignment',
      is_read: false,
      created_at: new Date().toISOString(),
    };

    const newNotifs = [citizenNotif];

    if (off) {
      const officerNotif: Notification = {
        id: `notif-${Date.now()}-o`,
        user_id: off.profile_id,
        complaint_id: comp.id,
        complaint_number: comp.complaint_number,
        title: `New Assignment: ${comp.complaint_number}`,
        message: `A new ${comp.priority} priority grievance has been assigned to your queue in ${comp.ward_or_area}.`,
        type: 'assignment',
        is_read: false,
        created_at: new Date().toISOString(),
      };
      newNotifs.push(officerNotif);
    }

    setNotifications((prev) => [...newNotifs, ...prev]);
    return { success: true };
  };

  const updateComplaintStatus = async (
    complaintId: string,
    newStatus: ComplaintStatus,
    remarks: string,
    proofImages?: string[],
    updatedBy = 'usr-officer-01',
    updatedByName = 'Field Department Officer'
  ): Promise<{ success: boolean }> => {
    const comp = complaints.find((c) => c.id === complaintId);
    if (!comp) return { success: false };

    const oldStatus = comp.status;
    const resolvedAt = newStatus === 'Resolved' ? new Date().toISOString() : comp.resolved_at;

    setComplaints((prev) =>
      prev.map((c) =>
        c.id === complaintId
          ? {
              ...c,
              status: newStatus,
              resolved_at: resolvedAt,
              updated_at: new Date().toISOString(),
            }
          : c
      )
    );

    const statusUpdate: ComplaintUpdate = {
      id: `upd-${Date.now()}`,
      complaint_id: complaintId,
      updated_by: updatedBy,
      updated_by_name: updatedByName,
      from_status: oldStatus,
      to_status: newStatus,
      remarks,
      proof_images: proofImages,
      created_at: new Date().toISOString(),
    };
    setUpdates((prev) => [statusUpdate, ...prev]);

    // Send notification to citizen with stage-specific clarity
    let notifTitle = `Status Updated to ${newStatus}: ${comp.complaint_number}`;
    let notifMessage = remarks || `Your complaint status has changed to ${newStatus}.`;

    if (newStatus === 'In Progress') {
      notifTitle = `Field Work In Progress: ${comp.complaint_number}`;
      notifMessage = remarks
        ? `Field team active on-site (${comp.ward_or_area}): "${remarks}"`
        : `Municipal inspection team is actively on-site carrying out maintenance in ${comp.ward_or_area}.`;
    } else if (newStatus === 'Resolved') {
      notifTitle = `Grievance Resolved: ${comp.complaint_number}`;
      notifMessage = `Your grievance has been marked as Resolved. ${
        remarks ? `Closure notes: "${remarks}". ` : ''
      }Please review the repair proof and provide your 1-5 star feedback rating!`;
    } else if (newStatus === 'Rejected') {
      notifTitle = `Grievance Review (Rejected): ${comp.complaint_number}`;
      notifMessage = `Your complaint could not be processed. Official reason: "${
        remarks || 'Does not fall within municipal jurisdiction or duplicate record.'
      }".`;
    } else if (newStatus === 'Under Review') {
      notifTitle = `Grievance Under Review: ${comp.complaint_number}`;
      notifMessage = `Municipal administrative team is reviewing site details and category scope in ${comp.ward_or_area}.`;
    }

    const citizenNotif: Notification = {
      id: `notif-${Date.now()}`,
      user_id: comp.citizen_id,
      complaint_id: comp.id,
      complaint_number: comp.complaint_number,
      title: notifTitle,
      message: notifMessage,
      type: newStatus === 'Resolved' ? 'feedback_request' : 'status_change',
      is_read: false,
      created_at: new Date().toISOString(),
    };
    setNotifications((prev) => [citizenNotif, ...prev]);

    return { success: true };
  };

  const rateComplaint = async (
    complaintId: string,
    citizenId: string,
    rating: number,
    comments: string
  ): Promise<{ success: boolean }> => {
    const newFeedback: Feedback = {
      id: `fb-${Date.now()}`,
      complaint_id: complaintId,
      citizen_id: citizenId,
      rating,
      comments,
      created_at: new Date().toISOString(),
    };

    setFeedbackList((prev) => [newFeedback, ...prev]);

    const comp = complaints.find((c) => c.id === complaintId);
    if (comp) {
      const adminNotif: Notification = {
        id: `notif-${Date.now()}`,
        user_id: 'usr-admin-01',
        complaint_id: complaintId,
        complaint_number: comp.complaint_number,
        title: `Citizen Feedback Received: ${comp.complaint_number}`,
        message: `Citizen gave a ${rating}-star rating for resolved complaint ${comp.complaint_number}.`,
        type: 'system',
        is_read: false,
        created_at: new Date().toISOString(),
      };
      setNotifications((prev) => [adminNotif, ...prev]);
    }

    return { success: true };
  };

  const reopenComplaint = async (
    complaintId: string,
    citizenId: string,
    reason: string
  ): Promise<{ success: boolean }> => {
    const comp = complaints.find((c) => c.id === complaintId);
    if (!comp) return { success: false };

    const oldStatus = comp.status;
    const newStatus: ComplaintStatus = 'Reopened';

    setComplaints((prev) =>
      prev.map((c) =>
        c.id === complaintId
          ? {
              ...c,
              status: newStatus,
              resolved_at: undefined,
              updated_at: new Date().toISOString(),
            }
          : c
      )
    );

    const reopenUpdate: ComplaintUpdate = {
      id: `upd-${Date.now()}`,
      complaint_id: complaintId,
      updated_by: citizenId,
      updated_by_name: 'Citizen (Reopened)',
      from_status: oldStatus,
      to_status: newStatus,
      remarks: `Citizen reopened grievance: "${reason}"`,
      created_at: new Date().toISOString(),
    };
    setUpdates((prev) => [reopenUpdate, ...prev]);

    const citizenReopenNotif: Notification = {
      id: `notif-${Date.now()}-reop`,
      user_id: citizenId,
      complaint_id: complaintId,
      complaint_number: comp.complaint_number,
      title: `Grievance Reopened: ${comp.complaint_number}`,
      message: `Your request to reopen grievance ${comp.complaint_number} has been logged. Reason: "${reason}". The case has been re-dispatched to department authorities.`,
      type: 'system',
      is_read: false,
      created_at: new Date().toISOString(),
    };

    const adminNotif: Notification = {
      id: `notif-${Date.now()}-adm`,
      user_id: 'usr-admin-01',
      complaint_id: complaintId,
      complaint_number: comp.complaint_number,
      title: `Complaint Reopened: ${comp.complaint_number}`,
      message: `Citizen unsatisfied with resolution. Reason: ${reason}`,
      type: 'status_change',
      is_read: false,
      created_at: new Date().toISOString(),
    };
    setNotifications((prev) => [citizenReopenNotif, adminNotif, ...prev]);

    return { success: true };
  };

  const changePriority = async (
    complaintId: string,
    priority: ComplaintPriority,
    changedBy = 'usr-admin-01',
    changedByName = 'Municipal Administrator (Abhijeet Shah, IAS)'
  ): Promise<{ success: boolean }> => {
    const comp = complaints.find((c) => c.id === complaintId);
    if (!comp) return { success: false };

    const oldPriority = comp.priority;
    if (oldPriority === priority) return { success: true };

    setComplaints((prev) =>
      prev.map((c) =>
        c.id === complaintId
          ? {
              ...c,
              priority,
              updated_at: new Date().toISOString(),
            }
          : c
      )
    );

    // Audit update
    const prioUpdate: ComplaintUpdate = {
      id: `upd-${Date.now()}`,
      complaint_id: complaintId,
      updated_by: changedBy,
      updated_by_name: changedByName,
      from_status: comp.status,
      to_status: comp.status,
      remarks: `Priority changed from ${oldPriority} to ${priority} by ${changedByName}. Resolution SLA recalculated.`,
      created_at: new Date().toISOString(),
    };
    setUpdates((prev) => [prioUpdate, ...prev]);

    // Send clear notification to Citizen
    const citizenNotif: Notification = {
      id: `notif-${Date.now()}-prio`,
      user_id: comp.citizen_id,
      complaint_id: comp.id,
      complaint_number: comp.complaint_number,
      title: `Priority Escalated (${priority}): ${comp.complaint_number}`,
      message: `Your grievance has been escalated from ${oldPriority} to ${priority} Priority by municipal administration. Resolution timeline is now expedited.`,
      type: 'status_change',
      is_read: false,
      created_at: new Date().toISOString(),
    };
    setNotifications((prev) => [citizenNotif, ...prev]);

    return { success: true };
  };

  const markNotificationRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const addDepartment = (dept: Omit<Department, 'id' | 'created_at'>) => {
    const newDept: Department = {
      ...dept,
      id: `dept-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setDepartments((prev) => [...prev, newDept]);
  };

  const addCategory = (cat: Omit<ComplaintCategory, 'id'>) => {
    const newCat: ComplaintCategory = {
      ...cat,
      id: `cat-${Date.now()}`,
    };
    setCategories((prev) => [...prev, newCat]);
  };

  const deleteComplaint = async (complaintId: string): Promise<{ success: boolean }> => {
    setComplaints((prev) => prev.filter((c) => c.id !== complaintId));
    setUpdates((prev) => prev.filter((u) => u.complaint_id !== complaintId));
    setFeedbackList((prev) => prev.filter((f) => f.complaint_id !== complaintId));
    if (isSupabaseConfigured()) {
      try {
        await supabase.from('complaints').delete().eq('id', complaintId);
      } catch (err) {
        console.warn('Supabase delete complaint error:', err);
      }
    }
    return { success: true };
  };

  const resetComplaints = () => {
    localStorage.removeItem(`${LOCAL_STORAGE_KEY_PREFIX}complaints`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY_PREFIX}updates`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY_PREFIX}feedback`);
    setComplaints(DEMO_COMPLAINTS);
    setUpdates(DEMO_UPDATES);
    setFeedbackList(DEMO_FEEDBACK);
  };

  return (
    <ComplaintContext.Provider
      value={{
        complaints: enrichedComplaints,
        departments,
        categories,
        officers,
        updates,
        feedbackList,
        notifications,
        unreadNotificationCount,
        isLoading,
        submitComplaint,
        assignComplaint,
        updateComplaintStatus,
        rateComplaint,
        reopenComplaint,
        changePriority,
        markNotificationRead,
        markAllNotificationsRead,
        addDepartment,
        addCategory,
        getComplaintById,
        getComplaintByNumber,
        deleteComplaint,
        resetComplaints,
      }}
    >
      {children}
    </ComplaintContext.Provider>
  );
};

export const useComplaints = () => {
  const context = useContext(ComplaintContext);
  if (!context) {
    throw new Error('useComplaints must be used within a ComplaintProvider');
  }
  return context;
};
