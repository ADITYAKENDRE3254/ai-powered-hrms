import React from 'react';
import { PerformancePrediction } from '../../types';
import { Sparkles, TrendingUp, TrendingDown, Minus, CheckCircle, AlertCircle, Lightbulb } from 'lucide-react';
import { Badge } from '../common/Badge';

export const PerformanceCard: React.FC<{ prediction: PerformancePrediction }> = ({ prediction }) => {
  const getCategoryBadge = () => {
    switch (prediction.prediction_category) {
      case 'HIGH':
        return <Badge variant="success">High Performance Tier</Badge>;
      case 'MEDIUM':
        return <Badge variant="info">Medium / Stable Tier</Badge>;
      case 'NEEDS_ATTENTION':
        return <Badge variant="danger">Needs Support & Coaching</Badge>;
      default:
        return <Badge variant="neutral">Insufficient Data</Badge>;
    }
  };

  const getTrendIcon = () => {
    switch (prediction.trend) {
      case 'IMPROVING':
        return (
          <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="w-3.5 h-3.5" /> Improving
          </span>
        );
      case 'DECLINING':
        return (
          <span className="flex items-center gap-1 text-xs font-bold text-rose-600 dark:text-rose-400">
            <TrendingDown className="w-3.5 h-3.5" /> Declining Trend
          </span>
        );
      case 'STABLE':
        return (
          <span className="flex items-center gap-1 text-xs font-bold text-slate-600 dark:text-slate-300">
            <Minus className="w-3.5 h-3.5" /> Stable
          </span>
        );
      default:
        return <span className="text-xs text-slate-400">Baseline</span>;
    }
  };

  return (
    <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 border border-slate-200/80 dark:border-navy-800 shadow-apple flex flex-col justify-between transition-all hover:shadow-apple-md">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                AI Performance Prediction
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-cyan-400 font-semibold border border-brand-200 dark:border-brand-800">
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
          {getCategoryBadge()}
        </div>

        {/* Score Meter */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-100 dark:border-navy-800 flex items-center justify-between mb-5">
          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Estimated Score</span>
            <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
              {prediction.is_data_sufficient ? `${prediction.score}/100` : 'N/A'}
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Model Confidence</span>
            <div className="text-sm font-bold text-brand-600 dark:text-cyan-400 mt-0.5">{prediction.confidence}%</div>
            <div className="mt-1">{getTrendIcon()}</div>
          </div>
        </div>

        {/* Factors Breakdown */}
        <div className="space-y-4 text-xs">
          {/* Positive Factors */}
          {prediction.positive_factors && prediction.positive_factors.length > 0 && (
            <div>
              <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                <span>Positive Indicators</span>
              </span>
              <ul className="space-y-1 pl-5 list-disc text-slate-600 dark:text-slate-400">
                {prediction.positive_factors.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Attention Factors */}
          {prediction.attention_factors && prediction.attention_factors.length > 0 && (
            <div>
              <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                <span>Areas for Growth & Attention</span>
              </span>
              <ul className="space-y-1 pl-5 list-disc text-slate-600 dark:text-slate-400">
                {prediction.attention_factors.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommended Actions */}
          {prediction.recommended_actions && prediction.recommended_actions.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-brand-50/70 dark:bg-brand-950/30 border border-brand-100 dark:border-brand-900">
              <span className="font-bold text-brand-900 dark:text-cyan-300 block mb-1 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-brand-600 dark:text-cyan-400" />
                <span>Recommended Human Actions</span>
              </span>
              <ul className="space-y-0.5 text-brand-900 dark:text-slate-300 text-[11px] list-disc pl-4">
                {prediction.recommended_actions.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Footer Note */}
      <div className="mt-5 pt-3 border-t border-slate-100 dark:border-navy-800 text-[10px] text-slate-400 dark:text-slate-500 flex items-center justify-between">
        <span>Evaluated for {prediction.period}</span>
        <span>Advisory decision support</span>
      </div>
    </div>
  );
};
