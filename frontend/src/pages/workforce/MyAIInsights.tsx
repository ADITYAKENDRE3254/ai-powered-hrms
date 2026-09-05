import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { workforceService } from '../../services/workforce.service';
import { EmployeeAIInsights } from '../../types';
import { PerformanceCard } from '../../components/workforce/PerformanceCard';
import { SkillProfile } from '../../components/workforce/SkillProfile';
import { SkillGapChart } from '../../components/workforce/SkillGapChart';
import { FutureSkills } from '../../components/workforce/FutureSkills';
import { TrainingRecommendationCard } from '../../components/workforce/TrainingRecommendationCard';
import { EmptyState } from '../../components/common/EmptyState';
import {
  Sparkles,
  TrendingUp,
  Target,
  GraduationCap,
  RefreshCw,
  Award,
  Compass,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export const MyAIInsights: React.FC = () => {
  const navigate = useNavigate();
  const [insights, setInsights] = useState<EmployeeAIInsights | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadInsights = async () => {
    setIsLoading(true);
    try {
      const data = await workforceService.getMyInsights();
      setInsights(data);
    } catch (e) {
      console.error('Failed to load employee AI insights', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInsights();
  }, []);

  return (
    <div className="space-y-7">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-purple-950 to-navy-950 rounded-3xl p-7 sm:p-9 text-white shadow-apple-lg border border-purple-500/20 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-400/30 mb-3 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>AI Career Intelligence & Development</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">My AI Growth Insights</h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1.5 max-w-xl leading-relaxed">
            Personalized performance development signals, competency matrix, benchmark role gaps, and custom training recommendations.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5 relative z-10">
          <button
            onClick={() => navigate('/my-training')}
            className="px-5 py-3 bg-gradient-to-r from-purple-600 to-brand-600 hover:from-purple-700 hover:to-brand-700 text-white rounded-2xl text-xs font-bold shadow-apple-md transition-all flex items-center gap-2 hover:scale-[1.01] active:scale-[0.99]"
          >
            <GraduationCap className="w-4 h-4" />
            <span>My Active Trainings</span>
          </button>
          <button
            onClick={loadInsights}
            className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-xs font-bold border border-white/20 shadow-apple backdrop-blur-md transition-all flex items-center gap-2 hover:scale-[1.01] active:scale-[0.99]"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="p-16 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2 bg-white dark:bg-navy-900 rounded-3xl border border-slate-200/80 dark:border-navy-800 shadow-apple">
          <RefreshCw className="w-6 h-6 animate-spin text-purple-500" />
          <span>Synthesizing your personal career insights & AI recommendations...</span>
        </div>
      ) : insights ? (
        <div className="space-y-6">
          {/* Top Row: Performance Evaluation & Future Skills */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PerformanceCard prediction={insights.performance} />
            <FutureSkills futureSkill={insights.future_skills} />
          </div>

          {/* Target Role Skill Gap */}
          <SkillGapChart skillGap={insights.skill_gaps} />

          {/* Competencies Inventory */}
          <SkillProfile skills={insights.skills} />

          {/* Personalized Training Recommendations */}
          {insights.recommended_trainings && insights.recommended_trainings.length > 0 && (
            <div className="bg-white dark:bg-navy-900 rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-navy-800 shadow-apple">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recommended Courses for Your Next Promotion</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Courses curated to close your missing role skills and strengthen your technical profile
                  </p>
                </div>
                <button
                  onClick={() => navigate('/my-training')}
                  className="text-xs text-purple-600 dark:text-purple-400 hover:underline font-semibold flex items-center gap-1"
                >
                  <span>Go to My Training Portal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {insights.recommended_trainings.map((rec) => (
                  <TrainingRecommendationCard
                    key={rec.id || rec.training_name}
                    recommendation={rec}
                    onEnroll={() => navigate('/my-training')}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <EmptyState
          title="No Personal Insights Available"
          description="Unable to load personal insights. Please check with your HR administrator."
        />
      )}
    </div>
  );
};
