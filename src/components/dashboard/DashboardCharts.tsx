import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import { Star, TrendingUp, Sparkles } from 'lucide-react';
import { Card } from '../ui/Card';
import { FeedbackStats } from '../../types';

interface DashboardChartsProps {
  stats: FeedbackStats;
  trendTimelineData: {
    date: string;
    fullDate: string;
    feedback: number;
    googleClicks: number;
  }[];
}

const STAR_COLORS: Record<string, string> = {
  '5 Stars': '#10b981', // emerald-500
  '4 Stars': '#14b8a6', // teal-500
  '3 Stars': '#f59e0b', // amber-500
  '2 Stars': '#f97316', // orange-500
  '1 Star': '#ef4444',  // red-500
};

const PIE_COLORS = ['#10b981', '#14b8a6', '#f59e0b', '#f97316', '#ef4444'];

export const DashboardCharts: React.FC<DashboardChartsProps> = ({
  stats,
  trendTimelineData,
}) => {
  const ratingDistributionData = [
    { stars: '5 Stars', count: stats.fiveStarCount, color: STAR_COLORS['5 Stars'] },
    { stars: '4 Stars', count: stats.fourStarCount, color: STAR_COLORS['4 Stars'] },
    { stars: '3 Stars', count: stats.threeStarCount, color: STAR_COLORS['3 Stars'] },
    { stars: '2 Stars', count: stats.twoStarCount, color: STAR_COLORS['2 Stars'] },
    { stars: '1 Star', count: stats.oneStarCount, color: STAR_COLORS['1 Star'] },
  ];

  const ratingPercentageData = [
    { name: '5 Stars', value: stats.fiveStarCount, color: '#10b981' },
    { name: '4 Stars', value: stats.fourStarCount, color: '#14b8a6' },
    { name: '3 Stars', value: stats.threeStarCount, color: '#f59e0b' },
    { name: '2 Stars', value: stats.twoStarCount, color: '#f97316' },
    { name: '1 Star', value: stats.oneStarCount, color: '#ef4444' },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-6" id="dashboard-charts-container">
      {/* Top 2 charts: Feedback volume over time + Google click trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Feedback volume over time */}
        <Card className="p-5 sm:p-6 flex flex-col justify-between" id="chart-feedback-volume-time">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">Feedback Volume</h3>
                <p className="text-xs text-slate-500 mt-0.5">Timeline of incoming customer submissions</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                {stats.totalFeedback} Total
              </span>
            </div>

            <div className="h-60 sm:h-64 w-full pt-3">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendTimelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: 'rgba(79, 70, 229, 0.05)' }}
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white px-3 py-2 rounded-xl text-xs shadow-xl space-y-1">
                            <p className="font-bold border-b border-slate-700 pb-1">{item.fullDate || label}</p>
                            <p className="text-indigo-300 font-semibold">{item.feedback} feedback submissions</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="feedback" name="Feedback Submissions" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium text-slate-500">Dynamic date range aggregation</span>
            <span className="font-semibold text-indigo-600">Avg Rating: {stats.averageRating} ★</span>
          </div>
        </Card>

        {/* Chart 2: Google Click Trend */}
        <Card className="p-5 sm:p-6 flex flex-col justify-between" id="chart-google-click-trend">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">Google Review Clicks</h3>
                <p className="text-xs text-slate-500 mt-0.5">Customers redirected to Google review page</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                {stats.googleClicks} Clicks
              </span>
            </div>

            <div className="h-60 sm:h-64 w-full pt-3">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendTimelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white px-3 py-2 rounded-xl text-xs shadow-xl space-y-1">
                            <p className="font-bold border-b border-slate-700 pb-1">{item.fullDate || label}</p>
                            <p className="text-emerald-300 font-semibold">{item.googleClicks} Google Review clicks</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="googleClicks"
                    name="Google Clicks"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#ffffff' }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium text-slate-600">High-intent Google Promoters</span>
            <span className="font-bold text-emerald-600">{stats.googleClickRate}% Google Click Rate</span>
          </div>
        </Card>
      </div>

      {/* Bottom 2 charts: Rating distribution + Rating percentage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 3: Rating Distribution (Bar) */}
        <Card className="p-5 sm:p-6 flex flex-col justify-between" id="chart-rating-distribution">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">Rating Distribution</h3>
                <p className="text-xs text-slate-500 mt-0.5">Absolute count breakdown from 1 to 5 stars</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                1–5 Star Scale
              </span>
            </div>

            <div className="h-60 sm:h-64 w-full pt-3">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ratingDistributionData} layout="vertical" margin={{ top: 10, right: 20, left: 15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="stars" type="category" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        const pct = stats.totalFeedback > 0 ? Math.round((data.count / stats.totalFeedback) * 100) : 0;
                        return (
                          <div className="bg-slate-900 text-white px-3 py-2 rounded-xl text-xs shadow-xl space-y-1">
                            <p className="font-bold">{data.stars}</p>
                            <p className="text-slate-300">Count: {data.count} submissions</p>
                            <p className="text-amber-400 font-semibold">{pct}% of filtered feedback</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                    {ratingDistributionData.map((entry, index) => (
                      <Cell key={`dist-cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium text-slate-500">5-Star Promoters: {stats.fiveStarCount}</span>
            <span className="font-medium text-slate-500">1-4 Star Private: {stats.totalFeedback - stats.fiveStarCount}</span>
          </div>
        </Card>

        {/* Chart 4: Rating Percentage (Donut / Pie) */}
        <Card className="p-5 sm:p-6 flex flex-col justify-between" id="chart-rating-percentage">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">Sentiment Share</h3>
                <p className="text-xs text-slate-500 mt-0.5">Sentiment share of customer feedback</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200/80">
                {stats.totalFeedback > 0 ? `${Math.round(((stats.fiveStarCount + stats.fourStarCount) / stats.totalFeedback) * 100)}% Positive` : '100%'}
              </span>
            </div>

            <div className="h-60 sm:h-64 w-full pt-1 flex flex-col sm:flex-row items-center justify-center gap-4">
              {stats.totalFeedback === 0 ? (
                <div className="text-center text-xs text-slate-400 py-12">
                  No feedback in selected period to compute percentages.
                </div>
              ) : (
                <>
                  <div className="h-48 w-48 shrink-0 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={ratingPercentageData}
                          innerRadius={50}
                          outerRadius={75}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {ratingPercentageData.map((entry, index) => (
                            <Cell key={`pie-cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              const pct = Math.round((data.value / stats.totalFeedback) * 100);
                              return (
                                <div className="bg-slate-900 text-white px-3 py-1.5 rounded-xl text-xs shadow-xl">
                                  <span className="font-bold">{data.name}:</span> {data.value} ({pct}%)
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-xl font-black text-slate-900">{stats.averageRating}</span>
                      <span className="text-[10px] text-slate-400 font-bold">AVG ★</span>
                    </div>
                  </div>

                  {/* Legend breakdown list */}
                  <div className="flex-1 w-full space-y-1.5 text-xs">
                    {ratingDistributionData.map((item) => {
                      const pct = stats.totalFeedback > 0 ? Math.round((item.count / stats.totalFeedback) * 100) : 0;
                      return (
                        <div key={item.stars} className="flex items-center justify-between py-1 border-b border-slate-50 last:border-0">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                            <span className="font-semibold text-slate-700">{item.stars}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400">{item.count}</span>
                            <span className="font-mono font-bold text-slate-900 w-10 text-right">{pct}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold text-emerald-600 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> 5-Star Share: {stats.totalFeedback > 0 ? `${Math.round((stats.fiveStarCount / stats.totalFeedback) * 100)}%` : '0%'}
            </span>
            <span className="text-slate-500">All 5 rating categories</span>
          </div>
        </Card>
      </div>
    </div>
  );
};
