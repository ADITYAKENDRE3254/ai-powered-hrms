import React, { useState, useEffect } from 'react';
import { employeeService } from '../services/employee.service';
import { departmentService } from '../services/department.service';
import { Employee, Department, Team, EmploymentStatus, UserRole } from '../types';
import { Modal } from '../components/common/Modal';
import { Badge } from '../components/common/Badge';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  Filter,
  Building2,
  DollarSign,
  Mail,
  Phone,
  Calendar,
  AlertCircle
} from 'lucide-react';

export const EmployeesPage: React.FC = () => {
  const { hasRole } = useAuth();
  const isHRAdmin = hasRole('SUPER_ADMIN', 'HR_MANAGER');

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState<number | undefined>();
  const [selectedStatus, setSelectedStatus] = useState<EmploymentStatus | undefined>();
  const [isLoading, setIsLoading] = useState(true);

  // Add / Edit Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingEmp, setEditingEmp] = useState<Employee | null>(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    designation: '',
    department_id: 1,
    team_id: undefined as number | undefined,
    monthly_salary: 60000,
    allowances: 4000,
    tax_percentage: 10,
    pf_percentage: 12,
    joining_date: new Date().toISOString().split('T')[0],
    employment_status: 'ACTIVE' as EmploymentStatus,
    role: 'EMPLOYEE' as UserRole,
    password: 'Employee@123',
  });
  const [modalError, setModalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [empData, deptData, teamData] = await Promise.all([
        employeeService.getEmployees({
          search: search || undefined,
          department_id: selectedDept,
          status: selectedStatus,
        }),
        departmentService.getDepartments(),
        departmentService.getTeams(),
      ]);
      setEmployees(empData.items);
      setTotalCount(empData.total);
      setDepartments(deptData);
      setTeams(teamData);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, selectedDept, selectedStatus]);

  const handleOpenAdd = () => {
    setEditingEmp(null);
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone: '+91 9876543210',
      designation: 'Software Engineer',
      department_id: departments[0]?.id || 1,
      team_id: undefined,
      monthly_salary: 60000,
      allowances: 4000,
      tax_percentage: 10,
      pf_percentage: 12,
      joining_date: new Date().toISOString().split('T')[0],
      employment_status: 'ACTIVE',
      role: 'EMPLOYEE',
      password: 'Employee@123',
    });
    setModalError(null);
    setShowModal(true);
  };

  const handleOpenEdit = (emp: Employee) => {
    setEditingEmp(emp);
    setFormData({
      first_name: emp.first_name,
      last_name: emp.last_name,
      email: emp.email,
      phone: emp.phone || '',
      designation: emp.designation,
      department_id: emp.department_id || departments[0]?.id || 1,
      team_id: emp.team_id || undefined,
      monthly_salary: emp.monthly_salary,
      allowances: emp.allowances,
      tax_percentage: emp.tax_percentage,
      pf_percentage: emp.pf_percentage,
      joining_date: emp.joining_date,
      employment_status: emp.employment_status,
      role: emp.user_role || 'EMPLOYEE',
      password: '',
    });
    setModalError(null);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setModalError(null);
    try {
      if (editingEmp) {
        await employeeService.updateEmployee(editingEmp.id, {
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone,
          designation: formData.designation,
          department_id: formData.department_id,
          team_id: formData.team_id,
          monthly_salary: Number(formData.monthly_salary),
          allowances: Number(formData.allowances),
          tax_percentage: Number(formData.tax_percentage),
          pf_percentage: Number(formData.pf_percentage),
          employment_status: formData.employment_status,
        });
      } else {
        await employeeService.createEmployee({
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          phone: formData.phone,
          designation: formData.designation,
          department_id: formData.department_id,
          team_id: formData.team_id,
          monthly_salary: Number(formData.monthly_salary),
          allowances: Number(formData.allowances),
          tax_percentage: Number(formData.tax_percentage),
          pf_percentage: Number(formData.pf_percentage),
          joining_date: formData.joining_date,
          employment_status: formData.employment_status,
          password: formData.password,
        });
      }
      setShowModal(false);
      loadData();
    } catch (err: any) {
      setModalError(err.response?.data?.detail || 'Failed to save employee record');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to deactivate this employee?')) {
      try {
        await employeeService.deleteEmployee(id);
        loadData();
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Employee Directory</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage organization members, assignments, designations, and compensation.
          </p>
        </div>

        {isHRAdmin && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-indigo-600/20 transition-all flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Employee</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, code, designation, or email..."
            className="w-full text-xs pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedDept || ''}
            onChange={(e) => setSelectedDept(e.target.value ? Number(e.target.value) : undefined)}
            className="text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus || ''}
            onChange={(e) => setSelectedStatus(e.target.value ? (e.target.value as EmploymentStatus) : undefined)}
            className="text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="PROBATION">Probation</option>
            <option value="INACTIVE">Inactive</option>
            <option value="TERMINATED">Terminated</option>
          </select>
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Department & Team</th>
                <th className="py-3 px-4">Designation</th>
                <th className="py-3 px-4">Salary</th>
                <th className="py-3 px-4">Status</th>
                {isHRAdmin && <th className="py-3 px-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {employees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No employees matching search criteria.
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs shrink-0">
                          {emp.first_name[0]}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{emp.first_name} {emp.last_name}</p>
                          <p className="text-[11px] text-slate-500">{emp.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-700">{emp.employee_code}</td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-900">{emp.department_name || 'Unassigned'}</p>
                      <p className="text-[11px] text-slate-500">{emp.team_name || 'No team'}</p>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">{emp.designation}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">${emp.monthly_salary.toLocaleString()}</td>
                    <td className="py-3.5 px-4">
                      <Badge status={emp.employment_status} />
                    </td>
                    {isHRAdmin && (
                      <td className="py-3.5 px-4 text-right space-x-1">
                        <button
                          onClick={() => handleOpenEdit(emp)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit Employee"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(emp.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Deactivate Employee"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Employee Modal */}
      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editingEmp ? 'Edit Employee Profile' : 'Add New Employee'}
          subtitle="Configure profile details, department assignments, and compensation."
          maxWidth="2xl"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {modalError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">First Name</label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  required
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name</label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  required
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  disabled={!!editingEmp}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:opacity-60"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Designation</label>
                <input
                  type="text"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  required
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                <select
                  value={formData.department_id}
                  onChange={(e) => setFormData({ ...formData, department_id: Number(e.target.value) })}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Monthly Salary ($)</label>
                <input
                  type="number"
                  value={formData.monthly_salary}
                  onChange={(e) => setFormData({ ...formData, monthly_salary: Number(e.target.value) })}
                  required
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Allowances ($)</label>
                <input
                  type="number"
                  value={formData.allowances}
                  onChange={(e) => setFormData({ ...formData, allowances: Number(e.target.value) })}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                <select
                  value={formData.employment_status}
                  onChange={(e) => setFormData({ ...formData, employment_status: e.target.value as EmploymentStatus })}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="PROBATION">Probation</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white shadow-xs transition-all"
              >
                {isSubmitting ? 'Saving...' : editingEmp ? 'Update Employee' : 'Create Employee'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
