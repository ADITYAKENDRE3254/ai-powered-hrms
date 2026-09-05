import React from 'react';
import { TrainingRecommendation } from '../../types';
import { GraduationCap, ArrowRight, Zap, CheckCircle } from 'lucide-react';
import { Badge } from '../common/Badge';

export const TrainingRecommendationCard: React.FC<{
  recommendation: TrainingRecommendation;
  onEnroll?: () => void;
}> = ({ recommendation, onEnroll }) => {
  const getPriorityBadge = () => {
    switch (recommendation.priority) {
      case 'HIGH':
        return <Badge variant="danger">High Priority (Skill Gap)</Badge>;
      case 'MEDIUM':
        return <Badge variant="warning">Medium Priority (Career Growth)</Badge>;
      default:
        return <Badge variant="neutral">Low Priority</Badge>;
    }
  };

  return (
    <div className="p-5 rounded-3xl bg-slate-50 dark:bg-navy-950 border border-slate-200/80 dark:border-navy-800 hover:border-brand-300 dark:hover:border-cyan-500/40 transition-all flex flex-col justify-between shadow-apple hover:shadow-apple-md">
      <div>
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-600 text-white flex items-center justify-center shrink-0 shadow-apple">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                {recommendation.training_name}
              </h4>
              <span className="text-[10px] font-semibold text-brand-600 dark:text-cyan-400">
                Focus: {recommendation.skill_name}
              </span>
            </div>
          </div>
          {getPriorityBadge()}
        </div>

        <div className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300 my-3 leading-relaxed">
          <p><strong className="text-slate-800 dark:text-slate-200">Reason:</strong> {recommendation.reason}</p>
          <p><strong className="text-slate-800 dark:text-slate-200">Expected Benefit:</strong> {recommendation.expected_benefit}</p>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-200/60 dark:border-navy-800 flex items-center justify-between">
        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
          {recommendation.confidence}% Match Confidence
        </span>
        {onEnroll && (
          <button
            onClick={onEnroll}
            className="text-xs font-bold text-brand-600 dark:text-cyan-400 hover:text-brand-700 dark:hover:text-cyan-300 flex items-center gap-1 transition-colors"
          >
            <span>Enroll / Assign</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
