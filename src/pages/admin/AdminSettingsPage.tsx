import React, { useState, useEffect } from 'react';
import {
  Settings,
  ShieldAlert,
  Server,
  Zap,
  Lock,
  Save,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sliders,
  Mail,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { PlatformSettings } from '../../types';
import {
  fetchPlatformSettings,
  updatePlatformSettings,
  DEFAULT_PLATFORM_SETTINGS,
} from '../../services/adminService';
import { useToast } from '../../context/ToastContext';

export const AdminSettingsPage: React.FC = () => {
  const { addToast } = useToast();
  const [settings, setSettings] = useState<PlatformSettings>(DEFAULT_PLATFORM_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await fetchPlatformSettings();
      setSettings(data);
    } catch (err) {
      console.error('Error fetching platform settings:', err);
      addToast('error', 'Failed to load system settings', 'Error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await updatePlatformSettings(settings);
      addToast('success', 'Platform settings saved to Firestore /system/settings.', 'Settings Updated');
    } catch (err) {
      console.error('Error saving settings:', err);
      addToast('error', 'Failed to save settings. Check admin permissions.', 'Save Error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div id="admin-settings-root" className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Platform Settings & System Controls
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Authoritative platform-wide parameters, self-service registration gates, and default routing rules.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadSettings}
          isLoading={loading}
          leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
        >
          Reload
        </Button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* System Gates Card */}
        <Card className="p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">System Availability Gates</h3>
              <p className="text-xs text-slate-500">Platform-wide operational controls stored in Firestore</p>
            </div>
          </div>

          <div className="space-y-4">
            <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
              <input
                id="admin-allow-signups-toggle"
                type="checkbox"
                checked={settings.allowSignups}
                onChange={(e) => setSettings({ ...settings, allowSignups: e.target.checked })}
                className="mt-1 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
              />
              <div className="text-sm">
                <span className="font-bold text-slate-900 block">Allow New Business Registrations</span>
                <span className="text-xs text-slate-500">
                  When enabled, new organizations can create accounts and configure review links.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-4 rounded-xl border border-amber-200 bg-amber-50/40 cursor-pointer transition-colors">
              <input
                id="admin-maintenance-mode-toggle"
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                className="mt-1 rounded border-slate-300 text-amber-600 focus:ring-amber-500 w-4 h-4"
              />
              <div className="text-sm">
                <span className="font-bold text-amber-900 block flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" /> Platform Maintenance Mode
                </span>
                <span className="text-xs text-amber-800">
                  Public customer feedback links (/r/:slug) remain online, but dashboards display a maintenance warning.
                </span>
              </div>
            </label>
          </div>
        </Card>

        {/* Global Operational Defaults */}
        <Card className="p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Platform Defaults & Parameters</h3>
              <p className="text-xs text-slate-500">Default thresholds, trial duration, and support contact</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="admin-platform-name"
              label="Platform Branding Name"
              value={settings.platformName}
              onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
              required
            />
            <Input
              id="admin-support-email"
              label="Global Support Email"
              type="email"
              value={settings.supportEmail}
              onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
              required
            />
            <Input
              id="admin-default-trial-days"
              label="Default Trial Period (Days)"
              type="number"
              value={settings.defaultTrialDays}
              onChange={(e) => setSettings({ ...settings, defaultTrialDays: Number(e.target.value) })}
              required
            />
            <Input
              id="admin-sync-interval"
              label="Google Sync Polling Interval (Minutes)"
              type="number"
              value={settings.googleSyncInterval}
              onChange={(e) => setSettings({ ...settings, googleSyncInterval: Number(e.target.value) })}
              required
            />
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Default Google Routing Star Threshold (1-5)
              </label>
              <select
                id="admin-default-threshold"
                value={settings.defaultThresholdRating}
                onChange={(e) => setSettings({ ...settings, defaultThresholdRating: Number(e.target.value) })}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none"
              >
                <option value={5}>5 Stars only (1-4 kept private, 5 routed to Google)</option>
                <option value={4}>4 Stars and above (1-3 kept private, 4-5 routed to Google)</option>
              </select>
              <p className="text-xs text-slate-500 mt-1">
                New businesses default to this threshold unless overridden in their business settings.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              {settings.updatedAt ? `Last saved: ${new Date(settings.updatedAt).toLocaleString()}` : ''}
            </span>
            <Button
              id="admin-save-settings-btn"
              type="submit"
              variant="primary"
              size="md"
              isLoading={saving}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Platform Settings
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
};
