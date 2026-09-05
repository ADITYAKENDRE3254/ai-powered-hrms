import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { workforceService } from '../../services/workforce.service';
import { Sparkles, Brain, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

interface RunAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompleted: () => void;
}

export const RunAnalysisModal: React.FC<RunAnalysisModalProps> = ({ isOpen, onClose, onCompleted }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRun = async () => {
    setIsRunning(true);
    setError(null);
    try {
      const res = await workforceService.triggerBatchAnalysis();
      setResult(res);
      onCompleted();
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Failed to trigger batch workforce analysis');
    } finally {
      setIsRunning(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleReset} title="Trigger AI Workforce Intelligence Analysis">
      <div className="space-y-4">
        <div className="p-4 rounded-2xl bg-brand-50/70 dark:bg-brand-950/30 border border-brand-100 dark:border-brand-900 flex items-start gap-3">
          <Brain className="w-5 h-5 text-brand-600 dark:text-cyan-400 shrink-0 mt-0.5" />
          <div className="text-xs text-brand-950 dark:text-brand-300">
            <h4 className="font-bold mb-1">Automated Model Pipeline Execution</h4>
            <p className="text-brand-900 dark:text-slate-300 leading-relaxed">
              Running this batch process evaluates all active staff against:
            </p>
            <ul className="list-disc pl-4 mt-1.5 space-y-1 text-brand-900 dark:text-slate-300">
              <li><strong>Performance Predictor</strong> (Attendance, leave patterns, skills, tenure)</li>
              <li><strong>Attrition Risk Model</strong> (Retention drivers, protective signals)</li>
              <li><strong>Skill Gap & Future Skill Analyzer</strong> (Career growth roadmaps)</li>
              <li><strong>Training Recommendation Engine</strong> (Personalized upskilling)</li>
            </ul>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {result && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-300 text-xs">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold mb-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>Batch Analysis Completed Successfully!</span>
            </div>
            <p className="text-emerald-800 dark:text-slate-300">
              Analyzed <strong>{result.employees_analyzed} employees</strong> in <strong>{result.duration_seconds}s</strong>. All dashboard metrics, heatmaps, and recommendations have been refreshed.
            </p>
          </div>
        )}

        <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-navy-800">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800"
          >
            {result ? 'Close' : 'Cancel'}
          </button>
          {!result && (
            <button
              type="button"
              disabled={isRunning}
              onClick={handleRun}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-cyan-600 hover:from-brand-700 hover:to-cyan-700 text-white text-xs font-bold shadow-apple-md transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Analyzing Workforce...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Run Complete AI Analysis</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};
