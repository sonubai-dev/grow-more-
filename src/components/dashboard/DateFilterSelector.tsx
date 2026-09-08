import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronDown, Check } from 'lucide-react';
import { DateFilterPreset, DateRangeFilter } from '../../types';

interface DateFilterSelectorProps {
  filter: DateRangeFilter;
  onChange: (newFilter: DateRangeFilter) => void;
  className?: string;
}

const PRESET_OPTIONS: { id: DateFilterPreset; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: '7days', label: 'Last 7 days' },
  { id: '30days', label: 'Last 30 days' },
  { id: '90days', label: 'Last 90 days' },
  { id: 'all', label: 'All time' },
  { id: 'custom', label: 'Custom date range' },
];

export const DateFilterSelector: React.FC<DateFilterSelectorProps> = ({
  filter,
  onChange,
  className = '',
}) => {
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customStart, setCustomStart] = useState(filter.startDate || '');
  const [customEnd, setCustomEnd] = useState(filter.endDate || '');

  const handleSelectPreset = (preset: DateFilterPreset) => {
    if (preset === 'custom') {
      setShowCustomModal(true);
    } else {
      onChange({
        preset,
      });
      setShowCustomModal(false);
    }
  };

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    onChange({
      preset: 'custom',
      startDate: customStart || undefined,
      endDate: customEnd || undefined,
    });
    setShowCustomModal(false);
  };

  const activeLabel =
    PRESET_OPTIONS.find((p) => p.id === filter.preset)?.label || 'All time';

  return (
    <div className={`relative inline-block ${className}`} id="date-filter-selector-root">
      {/* Horizontal pill list on desktop, scrollable on mobile */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-2xl border border-slate-200/80 overflow-x-auto max-w-full">
        {PRESET_OPTIONS.map((option) => {
          const isActive = filter.preset === option.id;
          return (
            <button
              key={option.id}
              id={`date-filter-preset-${option.id}`}
              type="button"
              onClick={() => handleSelectPreset(option.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-white text-indigo-600 font-bold shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              {option.id === 'custom' && filter.preset === 'custom' && (filter.startDate || filter.endDate) ? (
                <span className="flex items-center gap-1">
                  <CalendarIcon className="w-3 h-3 text-indigo-600" />
                  {filter.startDate || 'Start'} → {filter.endDate || 'Now'}
                </span>
              ) : (
                option.label
              )}
            </button>
          );
        })}
      </div>

      {/* Custom Date Range Popover Modal */}
      {showCustomModal && (
        <div
          id="custom-date-modal-overlay"
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setShowCustomModal(false)}
        >
          <div
            id="custom-date-modal-content"
            className="bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 max-w-md w-full animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Custom Date Range</h3>
                <p className="text-xs text-slate-500">Filter metrics between exact start and end dates</p>
              </div>
            </div>

            <form onSubmit={handleApplyCustom} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Start Date
                  </label>
                  <input
                    id="custom-date-start-input"
                    type="date"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    End Date
                  </label>
                  <input
                    id="custom-date-end-input"
                    type="date"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  id="custom-date-cancel-btn"
                  onClick={() => setShowCustomModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="custom-date-apply-btn"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs cursor-pointer"
                >
                  Apply Range
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
