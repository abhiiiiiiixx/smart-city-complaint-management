import React, { useState } from 'react';
import { useComplaints } from '../../context/ComplaintContext';
import { Building2, Plus, Mail, Phone, Users, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';

export const ManageDepartmentsPage: React.FC = () => {
  const { departments, complaints, officers, addDepartment } = useComplaints();

  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [headName, setHeadName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code) return;
    addDepartment({
      name,
      code: code.toUpperCase(),
      description,
      head_name: headName,
      contact_email: contactEmail,
      contact_phone: contactPhone,
      is_active: true,
    });
    setShowAddModal(false);
    setName('');
    setCode('');
    setDescription('');
    setHeadName('');
    setContactEmail('');
    setContactPhone('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-950">
            Municipal Departments & Divisions ({departments.length})
          </h1>
          <p className="text-xs text-slate-500">
            Configure civic operational branches, division heads, and contact directories
          </p>
        </div>

        <Button
          variant="teal"
          size="sm"
          onClick={() => setShowAddModal(true)}
          className="font-bold"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add Department
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((dept) => {
          const deptComplaints = complaints.filter(
            (c) => c.assigned_department_id === dept.id
          );
          const activeCount = deptComplaints.filter(
            (c) => c.status !== 'Resolved' && c.status !== 'Rejected'
          ).length;
          const officerCount = officers.filter(
            (o) => o.department_id === dept.id
          ).length;

          return (
            <Card key={dept.id} className="civic-card-hover border-t-2 border-t-navy-900 flex flex-col justify-between">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold px-2 py-0.5 rounded bg-navy-900 text-white tracking-wide">
                    {dept.code}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Active Division
                  </span>
                </div>

                <h3 className="text-base font-bold text-navy-950">
                  {dept.name}
                </h3>

                <p className="text-xs text-slate-600 line-clamp-2">
                  {dept.description}
                </p>

                <div className="pt-2 border-t border-slate-100 text-xs space-y-1 text-slate-600">
                  <p><strong>Division Head:</strong> {dept.head_name}</p>
                  <p className="flex items-center gap-1.5 text-slate-500">
                    <Mail className="w-3.5 h-3.5" /> {dept.contact_email}
                  </p>
                  <p className="flex items-center gap-1.5 text-slate-500">
                    <Phone className="w-3.5 h-3.5" /> {dept.contact_phone}
                  </p>
                </div>
              </CardContent>

              <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-500">
                  {officerCount} Staff Officers
                </span>
                <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  {activeCount} Active Tickets
                </span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Add Department Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Create Municipal Department"
        description="Register a new municipal division for grievance assignment."
      >
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Department Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Horticulture & City Beautification"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Department Code *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. HCB"
                maxLength={5}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-900 uppercase"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Superintending Head *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Er. S.K. Joshi"
                value={headName}
                onChange={(e) => setHeadName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Official Email *
            </label>
            <input
              type="email"
              required
              placeholder="horticulture@smartcity.gov.in"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Contact Helpline Number *
            </label>
            <input
              type="tel"
              required
              placeholder="0731-2534007"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Scope & Responsibilities
            </label>
            <textarea
              rows={2}
              placeholder="Describe civic matters handled by this department..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-900"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowAddModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="teal" size="sm">
              Save Department
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
