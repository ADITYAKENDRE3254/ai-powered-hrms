import React from 'react';
import { AttritionPrediction } from '../../types';
import { ShieldAlert, ShieldCheck, HeartHandshake, AlertTriangle, Info } from 'lucide-react';
import { Badge } from '../common/Badge';

export const AttritionRiskCard: React.FC<{ prediction: AttritionPrediction }> = ({ prediction }) => {
  const getRiskBadge = () => {
    switch (prediction.risk_level) {
      case 'HIGH':
        return <Badge variant="danger">Elevated Risk (Action Recommended)</Badge>;
      case 'MEDIUM':
        return <Badge variant="warning">Moderate Risk</Badge>;
      case 'LOW':
        return <Badge variant="success">Low Retention Risk</Badge>;
      default:
        return <Badge variant="neutral">Insufficient Data</Badge>;
    }
  };

  const getRiskBarColor = () => {
    if (prediction.risk_score >= 60) return 'bg-rose-500';
    if (prediction.risk_score >= 35) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 border border-slate-200/80 dark:border-navy-800 shadow-apple flex flex-col justify-between transition-all hover:shadow-apple-md">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Attrition Risk Advisory
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 font-semibold border border-rose-200 dark:border-rose-800">
                {prediction.model_version}
              </span>
            </div>
            {prediction.employee_name && (
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{prediction.employee_name}</h3>
            )}
            {prediction.designation && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {prediction.designation} • {prediction.department_name}
              </p>
            )}
          </div>
          {getRiskBadge()}
        </div>

        {/* Risk Level Bar */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-100 dark:border-navy-800 mb-5">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Predicted Risk Score</span>
            <span className="text-sm font-bold text-slate-900 dark:text-white">{prediction.risk_score}/100</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-navy-800 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${getRiskBarColor()}`}
              style={{ width: `${Math.min(100, Math.max(5, prediction.risk_score))}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-2 text-[10px] text-slate-500 dark:text-slate-400 font-medium">
            <span>Low (0-34)</span>
            <span>Moderate (35-59)</span>
            <span>High (60-100)</span>
          </div>
        </div>

        {/* Factors */}
        <div className="space-y-4 text-xs">
          {/* Main Contributing Factors */}
          {prediction.main_factors && prediction.main_factors.length > 0 && (
            <div>
              <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                <span>Contributing Retention Drivers</span>
              </span>
              <ul className="space-y-1 pl-5 list-disc text-slate-600 dark:text-slate-400">
                {prediction.main_factors.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Protective Factors */}
          {prediction.protective_factors && prediction.protective_factors.length > 0 && (
            <div>
              <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Protective Retention Factors</span>
              </span>
              <ul className="space-y-1 pl-5 list-disc text-slate-600 dark:text-slate-400">
                {prediction.protective_factors.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommended Interventions */}
          {prediction.recommended_interventions && prediction.recommended_interventions.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
              <span className="font-bold text-amber-900 dark:text-amber-300 block mb-1 flex items-center gap-1.5">
                <HeartHandshake className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Recommended Retention Interventions</span>
              </span>
              <ul className="space-y-0.5 text-amber-800 dark:text-slate-300 text-[11px] list-disc pl-4">
                {prediction.recommended_interventions.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Ethical Guardrail Disclaimer */}
      <div className="mt-5 pt-3 border-t border-slate-100 dark:border-navy-800 flex items-start gap-1.5 text-[10px] text-slate-400 dark:text-slate-500">
        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
        <p>
          Advisory estimate based on historical job data. Never used for automated termination or disciplinary actions.
        </p>
      </div>
    </div>
  );
};
