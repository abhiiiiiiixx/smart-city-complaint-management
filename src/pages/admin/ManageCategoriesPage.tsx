import React, { useState } from 'react';
import { useComplaints } from '../../context/ComplaintContext';
import { Layers, Clock, Building2, Plus, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { Modal } from '../../components/ui/Modal';
import { ComplaintPriority } from '../../types/database';

export const ManageCategoriesPage: React.FC = () => {
  const { categories, departments, addCategory } = useComplaints();

  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [defaultDeptId, setDefaultDeptId] = useState(departments[0]?.id || '');
  const [defaultPriority, setDefaultPriority] = useState<ComplaintPriority>('Medium');
  const [slaHours, setSlaHours] = useState(24);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    addCategory({
      name: name.trim(),
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      description: description.trim(),
      default_department_id: defaultDeptId,
      default_priority: defaultPriority,
      sla_hours: Number(slaHours),
      is_active: true,
    });
    setShowAddModal(false);
    setName('');
    setDescription('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-950">
            Complaint Categories & Citizen SLA Targets ({categories.length})
          </h1>
          <p className="text-xs text-slate-500">
            Define civic complaint taxonomies, automated department routing rules, and resolution SLA deadlines
          </p>
        </div>

        <Button
          variant="teal"
          size="sm"
          onClick={() => setShowAddModal(true)}
          className="font-bold"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add Category
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((cat) => {
          const dept = departments.find((d) => d.id === cat.default_department_id);

          return (
            <Card key={cat.id} className="civic-card-hover border-t-2 border-t-navy-900">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-navy-950">
                    {cat.name}
                  </h3>
                  <PriorityBadge priority={cat.default_priority} />
                </div>

                <p className="text-xs text-slate-600">
                  {cat.description}
                </p>

                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-teal-600" />
                    <span>Auto-routed to: <strong>{dept?.name || 'Central Pool'}</strong></span>
                  </div>

                  <div className="flex items-center gap-1 font-bold text-navy-900 bg-slate-100 px-2.5 py-0.5 rounded-md">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>{cat.sla_hours} Hours Target SLA</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Add Category Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Civic Complaint Category"
        description="Add a new category with default routing and SLA turnarounds."
      >
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Category Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Park Maintenance & Greenery"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Default Responsible Department *
            </label>
            <select
              value={defaultDeptId}
              onChange={(e) => setDefaultDeptId(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-900 bg-white"
            >
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Default Priority *
              </label>
              <select
                value={defaultPriority}
                onChange={(e) => setDefaultPriority(e.target.value as ComplaintPriority)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-900 bg-white"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Target SLA (Hours) *
              </label>
              <input
                type="number"
                min={1}
                max={168}
                value={slaHours}
                onChange={(e) => setSlaHours(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Description / Examples *
            </label>
            <textarea
              required
              rows={2}
              placeholder="What typical civic issues fall under this category?"
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
              Save Category
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
