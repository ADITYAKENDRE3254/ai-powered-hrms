import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { employeeService } from '../services/employee.service';
import { departmentService } from '../services/department.service';
import { Employee, Department, Team, EmploymentStatus, UserRole } from '../types';
import { Modal } from '../components/common/Modal';
import { Badge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { TableRowSkeleton, CardSkeleton } from '../components/common/LoadingSkeleton';
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
  AlertCircle,
  Eye,
  LayoutGrid,
  List,
  Sparkles,
  Brain,
  GraduationCap,
  Shield,
  ArrowRight
} from 'lucide-react';

export const EmployeesPage: React.FC = () => {
  const { hasRole } = useAuth();
  const isHRAdmin = hasRole('SUPER_ADMIN', 'HR_MANAGER');
  const navigate = useNavigate();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState<number | undefined>();
  const [selectedStatus, setSelectedStatus] = useState<EmploymentStatus | undefined>();
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [isLoading, setIsLoading] = useState(true);

  // Profile 360 View Modal
  const [viewingEmp, setViewingEmp] = useState<Employee | null>(null);

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
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Employee Directory
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-400 font-bold border border-slate-200 dark:border-navy-700">
              {totalCount} Total
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage organization staff, job titles, department allocations, and compensation records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-navy-800 rounded-xl border border-slate-200/80 dark:border-navy-700">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-navy-900 text-brand-600 dark:text-brand-400 shadow-2xs'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-navy-900 text-brand-600 dark:text-brand-400 shadow-2xs'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
              title="Grid Cards View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          {isHRAdmin && (
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-brand-600/20 transition-all flex items-center gap-1.5 shrink-0 hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Employee</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-navy-900 p-4 rounded-2xl border border-slate-200/80 dark:border-navy-800 shadow-apple flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, code, designation, or email..."
            className="w-full text-xs pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedDept || ''}
            onChange={(e) => setSelectedDept(e.target.value ? Number(e.target.value) : undefined)}
            className="text-xs px-3 py-2.5 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-2xs"
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
            className="text-xs px-3 py-2.5 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-2xs"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="PROBATION">Probation</option>
            <option value="INACTIVE">Inactive</option>
            <option value="TERMINATED">Terminated</option>
          </select>
        </div>
      </div>

      {/* Employees Display: Table or Grid View */}
      {viewMode === 'table' ? (
        <div className="bg-white dark:bg-navy-900 rounded-2xl border border-slate-200/80 dark:border-navy-800 shadow-apple overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-navy-800/60 text-slate-600 dark:text-slate-400 font-bold border-b border-slate-200/80 dark:border-navy-700">
                <tr>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Department & Team</th>
                  <th className="py-3 px-4">Designation</th>
                  <th className="py-3 px-4">Monthly Salary</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
                {isLoading ? (
                  <>
                    <TableRowSkeleton cols={7} />
                    <TableRowSkeleton cols={7} />
                    <TableRowSkeleton cols={7} />
                    <TableRowSkeleton cols={7} />
                  </>
                ) : employees.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 dark:text-slate-500">
                      No employees matching search criteria.
                    </td>
                  </tr>
                ) : (
                  employees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-50/60 dark:hover:bg-navy-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div
                          onClick={() => setViewingEmp(emp)}
                          className="flex items-center gap-3 cursor-pointer group"
                        >
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-600 to-purple-600 text-white font-bold flex items-center justify-center text-xs shadow-xs shrink-0">
                            {emp.first_name[0]}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                              {emp.first_name} {emp.last_name}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">{emp.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-700 dark:text-slate-300">
                        {emp.employee_code}
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-900 dark:text-white">{emp.department_name || 'Unassigned'}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{emp.team_name || 'No team'}</p>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-200">{emp.designation}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                        ${emp.monthly_salary.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge status={emp.employment_status} showDot />
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-1">
                        <button
                          onClick={() => setViewingEmp(emp)}
                          className="p-1.5 text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-navy-800 rounded-lg transition-colors"
                          title="View 360 Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {isHRAdmin && (
                          <>
                            <button
                              onClick={() => handleOpenEdit(emp)}
                              className="p-1.5 text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-navy-800 rounded-lg transition-colors"
                              title="Edit Employee"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(emp.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-navy-800 rounded-lg transition-colors"
                              title="Deactivate Employee"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid Card View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            <>
              <CardSkeleton height="h-56" />
              <CardSkeleton height="h-56" />
              <CardSkeleton height="h-56" />
            </>
          ) : employees.length === 0 ? (
            <div className="col-span-full">
              <EmptyState
                title="No employees found"
                description="Try changing your search keywords or filter selections."
                aiSuggested={false}
              />
            </div>
          ) : (
            employees.map((emp) => (
              <div
                key={emp.id}
                className="bg-white dark:bg-navy-900 rounded-2xl border border-slate-200/80 dark:border-navy-800 p-5 shadow-apple flex flex-col justify-between hover:border-brand-500/40 transition-all group"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-600 to-purple-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                        {emp.first_name[0]}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                          {emp.first_name} {emp.last_name}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{emp.designation}</p>
                      </div>
                    </div>
                    <Badge status={emp.employment_status} showDot />
                  </div>

                  <div className="mt-4 space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{emp.department_name || 'Unassigned'} &bull; {emp.team_name || 'No team'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{emp.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <DollarSign className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-bold text-slate-900 dark:text-white">${emp.monthly_salary.toLocaleString()} / mo</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-navy-800 flex items-center justify-between">
                  <span className="font-mono text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                    {emp.employee_code}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setViewingEmp(emp)}
                      className="px-2.5 py-1 text-xs font-semibold bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-200 rounded-lg transition-colors"
                    >
                      360 Profile
                    </button>
                    {isHRAdmin && (
                      <button
                        onClick={() => handleOpenEdit(emp)}
                        className="p-1 text-slate-400 hover:text-brand-600 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Employee 360 Profile Modal */}
      {viewingEmp && (
        <Modal
          isOpen={!!viewingEmp}
          onClose={() => setViewingEmp(null)}
          title={`Employee 360: ${viewingEmp.first_name} ${viewingEmp.last_name}`}
          subtitle={`Staff Code: ${viewingEmp.employee_code} • ${viewingEmp.designation}`}
          maxWidth="2xl"
        >
          <div className="space-y-6">
            {/* Top Identity Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950/60 border border-slate-200/80 dark:border-navy-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-600 via-cyan-500 to-purple-600 text-white font-bold text-xl flex items-center justify-center shadow-md">
                  {viewingEmp.first_name[0]}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {viewingEmp.first_name} {viewingEmp.last_name}
                  </h3>
                  <p className="text-xs text-brand-600 dark:text-brand-400 font-semibold">{viewingEmp.designation}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{viewingEmp.department_name || 'Engineering'} &bull; {viewingEmp.team_name || 'General Team'}</p>
                </div>
              </div>
              <Badge status={viewingEmp.employment_status} showDot />
            </div>

            {/* Information Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Email Address</span>
                <p className="font-semibold text-slate-900 dark:text-white">{viewingEmp.email}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Phone Number</span>
                <p className="font-semibold text-slate-900 dark:text-white">{viewingEmp.phone || 'Not provided'}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Monthly Compensation</span>
                <p className="font-bold text-slate-900 dark:text-white">${viewingEmp.monthly_salary.toLocaleString()} + ${viewingEmp.allowances.toLocaleString()} allowances</p>
              </div>
              <div className="p-3.5 rounded-xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Joining Date</span>
                <p className="font-semibold text-slate-900 dark:text-white">{viewingEmp.joining_date}</p>
              </div>
            </div>

            {/* AI Workforce Intelligence Jump */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-brand-50 via-cyan-50 to-purple-50 dark:from-brand-950/40 dark:via-cyan-950/40 dark:to-purple-950/40 border border-brand-200 dark:border-brand-800/60 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-brand-700 dark:text-brand-300">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>✦ AI Workforce Profile</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                  View performance forecasts, skill gap radar, and training roadmap for this employee.
                </p>
              </div>
              <button
                onClick={() => {
                  setViewingEmp(null);
                  navigate('/workforce-intelligence');
                }}
                className="px-3.5 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1 shrink-0"
              >
                <span>View AI Suite</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </Modal>
      )}

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
              <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{modalError}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">First Name</label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  required
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-2xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Last Name</label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  required
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-2xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  disabled={!!editingEmp}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-2xs disabled:opacity-60"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Phone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-2xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Designation</label>
                <input
                  type="text"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  required
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-2xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Department</label>
                <select
                  value={formData.department_id}
                  onChange={(e) => setFormData({ ...formData, department_id: Number(e.target.value) })}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-2xs"
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
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Monthly Salary ($)</label>
                <input
                  type="number"
                  value={formData.monthly_salary}
                  onChange={(e) => setFormData({ ...formData, monthly_salary: Number(e.target.value) })}
                  required
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-2xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Allowances ($)</label>
                <input
                  type="number"
                  value={formData.allowances}
                  onChange={(e) => setFormData({ ...formData, allowances: Number(e.target.value) })}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-2xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Status</label>
                <select
                  value={formData.employment_status}
                  onChange={(e) => setFormData({ ...formData, employment_status: e.target.value as EmploymentStatus })}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-2xs"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="PROBATION">Probation</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-navy-800">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white shadow-sm shadow-brand-600/20 transition-all hover:scale-[1.02]"
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

