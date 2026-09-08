import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import {
  Employee,
  EmployeeSalary,
  AISalaryRecommendation,
  SalaryType
} from '../../types';
import {
  Sparkles,
  IndianRupee,
  Calculator,
  ShieldCheck,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  Sliders
} from 'lucide-react';
import compensationService from '../../services/compensation.service';

interface EmployeeSalaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  employee: Employee | null;
}

export const EmployeeSalaryModal: React.FC<EmployeeSalaryModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  employee,
}) => {
  // Form State
  const [grossSalary, setGrossSalary] = useState<string>('60000');
  const [basicSalary, setBasicSalary] = useState<string>('30000');
  const [hra, setHra] = useState<string>('12000');
  const [transportAllowance, setTransportAllowance] = useState<string>('3000');
  const [medicalAllowance, setMedicalAllowance] = useState<string>('2000');
  const [otherAllowances, setOtherAllowances] = useState<string>('13000');
  const [bonus, setBonus] = useState<string>('0');
  
  const [pfDeduction, setPfDeduction] = useState<string>('3600');
  const [taxDeduction, setTaxDeduction] = useState<string>('6000');
  const [professionalTax, setProfessionalTax] = useState<string>('200');
  const [otherDeductions, setOtherDeductions] = useState<string>('0');

  const [effectiveDate, setEffectiveDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [salaryType, setSalaryType] = useState<SalaryType>('MONTHLY');
  const [reason, setReason] = useState<string>('Annual compensation merit review');

  // AI Recommendation State
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiRecommendation, setAiRecommendation] = useState<AISalaryRecommendation | null>(null);
  const [showAiCard, setShowAiCard] = useState<boolean>(false);

  // Benchmarks & Existing Salary
  const [existingSalary, setExistingSalary] = useState<EmployeeSalary | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-calculation helper from Gross
  const autoCalculateComponents = (grossVal: number) => {
    const basic = Math.round(grossVal * 0.50);
    const hraVal = Math.round(basic * 0.40);
    const transport = 3000;
    const medical = 2000;
    const bonusVal = 0;
    const other = Math.max(0, grossVal - (basic + hraVal + transport + medical + bonusVal));

    const pf = Math.round(basic * ((employee?.pf_percentage || 12) / 100));
    const tax = Math.round(grossVal * ((employee?.tax_percentage || 10) / 100));
    const pt = 200;

    setBasicSalary(basic.toString());
    setHra(hraVal.toString());
    setTransportAllowance(transport.toString());
    setMedicalAllowance(medical.toString());
    setOtherAllowances(other.toString());
    setBonus(bonusVal.toString());

    setPfDeduction(pf.toString());
    setTaxDeduction(tax.toString());
    setProfessionalTax(pt.toString());
    setOtherDeductions('0');
  };

  useEffect(() => {
    if (employee && isOpen) {
      setError(null);
      setShowAiCard(false);
      setAiRecommendation(null);
      
      // Fetch current effective salary structure
      compensationService.getEmployeeSalaryDetails(employee.id)
        .then((sal) => {
          setExistingSalary(sal);
          setGrossSalary(sal.gross_salary.toString());
          setBasicSalary(sal.basic_salary.toString());
          setHra(sal.hra.toString());
          setTransportAllowance(sal.transport_allowance.toString());
          setMedicalAllowance(sal.medical_allowance.toString());
          setOtherAllowances(sal.other_allowances.toString());
          setBonus(sal.bonus.toString());
          setPfDeduction(sal.pf_deduction.toString());
          setTaxDeduction(sal.tax_deduction.toString());
          setProfessionalTax(sal.professional_tax.toString());
          setOtherDeductions(sal.other_deductions.toString());
          setSalaryType(sal.salary_type || 'MONTHLY');
          setEffectiveDate(new Date().toISOString().split('T')[0]);
          setReason('Salary structure revision');
        })
        .catch(() => {
          // Fallback to employee base
          const base = employee.monthly_salary || 50000;
          setGrossSalary(base.toString());
          autoCalculateComponents(base);
        });
    }
  }, [employee, isOpen]);

  // Derived Totals
  const numGross = parseFloat(grossSalary) || 0;
  const numBasic = parseFloat(basicSalary) || 0;
  const numHra = parseFloat(hra) || 0;
  const numTransport = parseFloat(transportAllowance) || 0;
  const numMedical = parseFloat(medicalAllowance) || 0;
  const numOther = parseFloat(otherAllowances) || 0;
  const numBonus = parseFloat(bonus) || 0;

  const totalEarningsCalculated = numBasic + numHra + numTransport + numMedical + numOther + numBonus;

  const numPf = parseFloat(pfDeduction) || 0;
  const numTax = parseFloat(taxDeduction) || 0;
  const numPt = parseFloat(professionalTax) || 0;
  const numOtherDed = parseFloat(otherDeductions) || 0;

  const totalDeductionsCalculated = numPf + numTax + numPt + numOtherDed;
  const netTakeHome = Math.max(0, numGross - totalDeductionsCalculated);

  const handleGrossChange = (val: string) => {
    setGrossSalary(val);
    const parsed = parseFloat(val);
    if (!isNaN(parsed) && parsed > 0) {
      autoCalculateComponents(parsed);
    }
  };

  // Trigger AI Salary Advisory
  const handleFetchAiRecommendation = async () => {
    if (!employee) return;
    try {
      setAiLoading(true);
      setError(null);
      const res = await compensationService.getAISalaryRecommendation({
        employee_id: employee.id,
        department_id: employee.department_id,
        position_title: employee.designation,
        experience_years: 3.5,
        skills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Cloud Infrastructure', 'Team Collaboration'],
      });
      setAiRecommendation(res);
      setShowAiCard(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch AI salary recommendation.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleApplyAiRecommendation = () => {
    if (!aiRecommendation || aiRecommendation.is_insufficient_data) return;
    setGrossSalary(aiRecommendation.recommended_salary.toString());
    autoCalculateComponents(aiRecommendation.recommended_salary);
    setReason(`AI Market Recommended Adjustment (₹${aiRecommendation.recommended_salary.toLocaleString('en-IN')})`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee) return;
    setError(null);

    if (numGross <= 0) {
      setError('Gross salary must be greater than zero.');
      return;
    }

    try {
      setLoading(true);
      await compensationService.configureEmployeeSalary(employee.id, {
        employee_id: employee.id,
        gross_salary: numGross,
        basic_salary: numBasic,
        hra: numHra,
        transport_allowance: numTransport,
        medical_allowance: numMedical,
        other_allowances: numOther,
        bonus: numBonus,
        pf_deduction: numPf,
        tax_deduction: numTax,
        professional_tax: numPt,
        other_deductions: numOtherDed,
        salary_type: salaryType,
        effective_date: effectiveDate,
        reason: reason.trim() || 'Merit salary revision',
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update employee salary.');
    } finally {
      setLoading(false);
    }
  };

  if (!employee) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Configure Employee Salary Structure"
      subtitle={`Priority Tier 1 Individual Compensation for ${employee.first_name} ${employee.last_name}`}
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-2xl flex items-center gap-2 text-rose-600 dark:text-rose-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Employee Header & AI Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-gradient-to-r from-brand-50/70 via-cyan-50/50 to-purple-50/40 dark:from-navy-950 dark:via-navy-900 dark:to-navy-950 rounded-2xl border border-brand-100 dark:border-navy-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 dark:text-white text-sm">
                {employee.first_name} {employee.last_name}
              </span>
              <span className="text-xs px-2 py-0.5 bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-cyan-400 rounded-lg font-mono font-bold">
                {employee.employee_code}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {employee.designation} • {employee.department_name || 'General'}
            </p>
          </div>

          <button
            type="button"
            onClick={handleFetchAiRecommendation}
            disabled={aiLoading}
            className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 rounded-xl shadow-md shadow-purple-500/20 transition-all disabled:opacity-50 shrink-0"
          >
            <Sparkles className="w-4 h-4 animate-pulse" />
            {aiLoading ? 'Analyzing Benchmarks...' : '✦ Get AI Salary Recommendation'}
          </button>
        </div>

        {/* AI Recommendation Advisory Card */}
        {showAiCard && aiRecommendation && (
          <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-950/20 via-navy-900/60 to-cyan-950/20 border border-purple-500/30 shadow-lg space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                <Sparkles className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">AI Compensation Advisory</span>
              </div>
              <span className="text-xs font-bold px-2.5 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-full">
                {aiRecommendation.confidence_score}% Confidence
              </span>
            </div>

            {aiRecommendation.is_insufficient_data ? (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                {aiRecommendation.explanation}
              </p>
            ) : (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/60 dark:bg-navy-950/80 p-3 rounded-xl border border-slate-200/50 dark:border-navy-800">
                  <div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Recommended Monthly CTC</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-extrabold text-brand-600 dark:text-cyan-400">
                        ₹{aiRecommendation.recommended_salary.toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs text-slate-500">
                        (Band: ₹{aiRecommendation.recommended_range_min.toLocaleString('en-IN')} – ₹{aiRecommendation.recommended_range_max.toLocaleString('en-IN')})
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleApplyAiRecommendation}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Apply Recommended CTC
                  </button>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">Contributing Factors:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {aiRecommendation.factors.map((f, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <p className="text-[10px] text-slate-400 dark:text-slate-500 italic">
                  {aiRecommendation.notes}
                </p>
              </>
            )}
          </div>
        )}

        {/* Total Gross Salary Control */}
        <div className="p-4 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200/80 dark:border-navy-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-1">
                Total Monthly Gross CTC (₹) <span className="text-rose-500">*</span>
              </label>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Updating gross automatically calculates compliant Basic, HRA, PF, and Tax components
              </p>
            </div>

            <div className="relative w-full sm:w-56">
              <span className="absolute left-3.5 top-2.5 text-slate-400 text-sm font-bold">₹</span>
              <input
                type="number"
                value={grossSalary}
                onChange={(e) => handleGrossChange(e.target.value)}
                placeholder="60000"
                min="0"
                className="w-full bg-white dark:bg-navy-900 border-2 border-brand-500/50 rounded-xl pl-8 pr-3 py-2 text-sm text-slate-900 dark:text-white font-extrabold focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* 2-Column Component Structure Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Earnings Components */}
          <div className="bg-slate-50 dark:bg-navy-950 p-4 rounded-2xl border border-slate-200/70 dark:border-navy-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-navy-800 pb-2">
              <span className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5 text-brand-500" />
                Earnings Breakdown
              </span>
              <span className="text-xs font-bold text-brand-600 dark:text-cyan-400">
                Sum: ₹{totalEarningsCalculated.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-600 dark:text-slate-400">Basic Salary (50%)</span>
                <input
                  type="number"
                  value={basicSalary}
                  onChange={(e) => setBasicSalary(e.target.value)}
                  className="w-28 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-lg px-2.5 py-1.5 font-semibold text-right"
                />
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-600 dark:text-slate-400">HRA (40% of Basic)</span>
                <input
                  type="number"
                  value={hra}
                  onChange={(e) => setHra(e.target.value)}
                  className="w-28 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-lg px-2.5 py-1.5 font-semibold text-right"
                />
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-600 dark:text-slate-400">Transport Allowance</span>
                <input
                  type="number"
                  value={transportAllowance}
                  onChange={(e) => setTransportAllowance(e.target.value)}
                  className="w-28 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-lg px-2.5 py-1.5 font-semibold text-right"
                />
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-600 dark:text-slate-400">Medical Allowance</span>
                <input
                  type="number"
                  value={medicalAllowance}
                  onChange={(e) => setMedicalAllowance(e.target.value)}
                  className="w-28 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-lg px-2.5 py-1.5 font-semibold text-right"
                />
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-600 dark:text-slate-400">Special / Other Allowances</span>
                <input
                  type="number"
                  value={otherAllowances}
                  onChange={(e) => setOtherAllowances(e.target.value)}
                  className="w-28 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-lg px-2.5 py-1.5 font-semibold text-right"
                />
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-600 dark:text-slate-400">Performance Bonus</span>
                <input
                  type="number"
                  value={bonus}
                  onChange={(e) => setBonus(e.target.value)}
                  className="w-28 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-lg px-2.5 py-1.5 font-semibold text-right"
                />
              </div>
            </div>
          </div>

          {/* Deductions Components */}
          <div className="bg-slate-50 dark:bg-navy-950 p-4 rounded-2xl border border-slate-200/70 dark:border-navy-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-navy-800 pb-2">
              <span className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-rose-500" />
                Statutory Deductions
              </span>
              <span className="text-xs font-bold text-rose-500">
                -₹{totalDeductionsCalculated.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-600 dark:text-slate-400">Provident Fund (PF - 12%)</span>
                <input
                  type="number"
                  value={pfDeduction}
                  onChange={(e) => setPfDeduction(e.target.value)}
                  className="w-28 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-lg px-2.5 py-1.5 font-semibold text-right text-rose-500"
                />
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-600 dark:text-slate-400">Income Tax / TDS (10%)</span>
                <input
                  type="number"
                  value={taxDeduction}
                  onChange={(e) => setTaxDeduction(e.target.value)}
                  className="w-28 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-lg px-2.5 py-1.5 font-semibold text-right text-rose-500"
                />
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-600 dark:text-slate-400">Professional Tax</span>
                <input
                  type="number"
                  value={professionalTax}
                  onChange={(e) => setProfessionalTax(e.target.value)}
                  className="w-28 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-lg px-2.5 py-1.5 font-semibold text-right text-rose-500"
                />
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-600 dark:text-slate-400">Other Deductions</span>
                <input
                  type="number"
                  value={otherDeductions}
                  onChange={(e) => setOtherDeductions(e.target.value)}
                  className="w-28 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-lg px-2.5 py-1.5 font-semibold text-right text-rose-500"
                />
              </div>

              {/* Net Take-home pill */}
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl border border-emerald-200 dark:border-emerald-900/60 mt-3 flex items-center justify-between">
                <span className="font-bold text-emerald-800 dark:text-emerald-300">Est. Net Take-Home</span>
                <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                  ₹{netTakeHome.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Effective Date & Reason */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Effective Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={effectiveDate}
              onChange={(e) => setEffectiveDate(e.target.value)}
              className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Adjustment Reason <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Annual merit appraisal, market benchmark adjustment"
              className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-navy-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-brand-600 to-cyan-600 hover:from-brand-500 hover:to-cyan-500 rounded-xl shadow-md shadow-brand-500/20 transition-all disabled:opacity-50"
          >
            {loading ? 'Saving Revision...' : 'Save & Apply Individual Salary'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
