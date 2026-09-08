import React from 'react';
import {
  MessageSquare,
  Star,
  Sparkles,
  ExternalLink,
  Percent,
  TrendingUp,
  Award,
} from 'lucide-react';
import { DashboardCard } from '../ui/DashboardCard';
import { FeedbackStats } from '../../types';

interface DashboardMetricsGridProps {
  stats: FeedbackStats;
  loading: boolean;
}

export const DashboardMetricsGrid: React.FC<DashboardMetricsGridProps> = ({
  stats,
  loading,
}) => {
  // Conversion Metric: Google Review Click Rate = Google Review Clicks ÷ 5-Star Feedback * 100
  // Division by zero protected
  const googleClickRate = stats.fiveStarCount > 0
    ? Number(((stats.googleClicks / stats.fiveStarCount) * 100).toFixed(1))
    : 0;

  return (
    <div className="space-y-4" id="dashboard-metrics-section">
      {/* Top Row: 4 Primary Overview KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Total Feedback */}
        <DashboardCard
          id="stat-total-feedback"
          title="Total Submissions"
          value={loading ? '...' : stats.totalFeedback}
          change={stats.totalFeedback > 0 ? `${stats.totalFeedback} verified` : 'No responses yet'}
          changeType="positive"
          subtitle="All ratings captured"
          icon={<MessageSquare className="w-5 h-5" />}
          iconBgColor="bg-indigo-50 text-indigo-600"
        />

        {/* Average Rating */}
        <DashboardCard
          id="stat-average-rating"
          title="Average Rating"
          value={loading ? '...' : `${stats.averageRating} ★`}
          change={stats.averageRating >= 4.5 ? 'Excellent' : stats.averageRating >= 4.0 ? 'Great' : 'Attention needed'}
          changeType={stats.averageRating >= 4 ? 'positive' : 'neutral'}
          subtitle="Out of 5.0 maximum"
          icon={<Star className="w-5 h-5 fill-amber-400 text-amber-400" />}
          iconBgColor="bg-amber-50 text-amber-600"
        />

        {/* Google Review Clicks */}
        <DashboardCard
          id="stat-google-clicks"
          title="Google Review Clicks"
          value={loading ? '...' : stats.googleClicks}
          change={`${stats.googleClicks} redirected`}
          changeType="positive"
          subtitle="Routed to Google"
          icon={<ExternalLink className="w-5 h-5" />}
          iconBgColor="bg-emerald-50 text-emerald-600"
        />

        {/* Google Click Rate */}
        <DashboardCard
          id="stat-google-click-rate"
          title="Conversion to Google"
          value={loading ? '...' : `${googleClickRate}%`}
          change={stats.fiveStarCount > 0 ? `From ${stats.fiveStarCount} promoters` : 'Awaiting reviews'}
          changeType="positive"
          subtitle="Clicks ÷ Eligible Reviews"
          icon={<Percent className="w-5 h-5" />}
          iconBgColor="bg-sky-50 text-sky-600"
        />
      </div>

      {/* Second Row: Star Breakdown Metrics */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4" id="star-breakdown-metrics-bar">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Rating Distribution
            </h4>
            <p className="text-xs text-slate-400">
              Breakdown of verified customer sentiment across star levels
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
              5★ Promoters: {stats.fiveStarCount}
            </span>
            <span className="font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
              1–4★ Private: {stats.totalFeedback - stats.fiveStarCount}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {/* 5-Star Feedback */}
          <div
            id="stat-5-star-feedback"
            className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-100 text-center transition-all hover:bg-emerald-50/80"
          >
            <div className="flex items-center justify-center gap-1 text-emerald-800 text-xs font-semibold">
              <span>5 Stars</span>
              <Star className="w-3 h-3 fill-emerald-500 text-emerald-500" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-emerald-950 mt-1">
              {loading ? '...' : stats.fiveStarCount}
            </div>
            <p className="text-[10px] text-emerald-700 font-medium mt-0.5">
              {stats.totalFeedback > 0 ? `${Math.round((stats.fiveStarCount / stats.totalFeedback) * 100)}% of total` : '0%'}
            </p>
          </div>

          {/* 4-Star Feedback */}
          <div
            id="stat-4-star-feedback"
            className="p-3.5 rounded-xl bg-teal-50/50 border border-teal-100 text-center transition-all hover:bg-teal-50/80"
          >
            <div className="flex items-center justify-center gap-1 text-teal-800 text-xs font-semibold">
              <span>4 Stars</span>
              <Star className="w-3 h-3 fill-teal-500 text-teal-500" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-teal-950 mt-1">
              {loading ? '...' : stats.fourStarCount}
            </div>
            <p className="text-[10px] text-teal-700 font-medium mt-0.5">
              {stats.totalFeedback > 0 ? `${Math.round((stats.fourStarCount / stats.totalFeedback) * 100)}% of total` : '0%'}
            </p>
          </div>

          {/* 3-Star Feedback */}
          <div
            id="stat-3-star-feedback"
            className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-100 text-center transition-all hover:bg-amber-50/80"
          >
            <div className="flex items-center justify-center gap-1 text-amber-800 text-xs font-semibold">
              <span>3 Stars</span>
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-amber-950 mt-1">
              {loading ? '...' : stats.threeStarCount}
            </div>
            <p className="text-[10px] text-amber-700 font-medium mt-0.5">
              {stats.totalFeedback > 0 ? `${Math.round((stats.threeStarCount / stats.totalFeedback) * 100)}% of total` : '0%'}
            </p>
          </div>

          {/* 2-Star Feedback */}
          <div
            id="stat-2-star-feedback"
            className="p-3.5 rounded-xl bg-orange-50/50 border border-orange-100 text-center transition-all hover:bg-orange-50/80"
          >
            <div className="flex items-center justify-center gap-1 text-orange-800 text-xs font-semibold">
              <span>2 Stars</span>
              <Star className="w-3 h-3 fill-orange-500 text-orange-500" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-orange-950 mt-1">
              {loading ? '...' : stats.twoStarCount}
            </div>
            <p className="text-[10px] text-orange-700 font-medium mt-0.5">
              {stats.totalFeedback > 0 ? `${Math.round((stats.twoStarCount / stats.totalFeedback) * 100)}% of total` : '0%'}
            </p>
          </div>

          {/* 1-Star Feedback */}
          <div
            id="stat-1-star-feedback"
            className="p-3.5 rounded-xl bg-rose-50/50 border border-rose-100 text-center transition-all hover:bg-rose-50/80 col-span-2 sm:col-span-1"
          >
            <div className="flex items-center justify-center gap-1 text-rose-800 text-xs font-semibold">
              <span>1 Star</span>
              <Star className="w-3 h-3 fill-rose-500 text-rose-500" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-rose-950 mt-1">
              {loading ? '...' : stats.oneStarCount}
            </div>
            <p className="text-[10px] text-rose-700 font-medium mt-0.5">
              {stats.totalFeedback > 0 ? `${Math.round((stats.oneStarCount / stats.totalFeedback) * 100)}% of total` : '0%'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
