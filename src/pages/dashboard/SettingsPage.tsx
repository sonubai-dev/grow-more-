import React, { useState } from 'react';
import {
  Bell,
  Users,
  CreditCard,
  Key,
  ShieldCheck,
  CheckCircle2,
  Save,
  Plus,
  Mail,
  Smartphone,
  Check,
  Sparkles
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { sendNegativeReviewAlert } from '../../services/emailService';

export const SettingsPage: React.FC = () => {
  const { currentBusiness } = useAuth();
  const { addToast } = useToast();

  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [alertPhone, setAlertPhone] = useState('(555) 234-8901');
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Staff Manager');

  // Plan state
  const [currentPlan, setCurrentPlan] = useState<'starter' | 'growth' | 'enterprise'>('growth');
  const [planModalOpen, setPlanModalOpen] = useState(false);

  const planDetails = {
    starter: { name: 'ZellonAI Starter', price: '₹99 / month', locations: '1 Location' },
    growth: { name: 'ZellonAI Growth', price: '₹499 / month', locations: 'Up to 3 Locations' },
    enterprise: { name: 'ZellonAI Enterprise', price: '₹1,499 / month', locations: 'Unlimited Locations' },
  };

  const [teamMembers, setTeamMembers] = useState([
    { name: 'Dr. Sarah Jenkins', email: 'owner@apexdental.com', role: 'Owner', status: 'Active' },
    { name: 'Michael Chang', email: 'm.chang@apexdental.com', role: 'Office Manager', status: 'Active' },
    { name: 'Jessica Miller', email: 'jessica@apexdental.com', role: 'Reception Lead', status: 'Invited' },
  ]);

  const [testingEmail, setTestingEmail] = useState(false);

  const handleTestEmail = async () => {
    const targetEmail = currentBusiness?.email || 'delivered@resend.dev';
    setTestingEmail(true);
    try {
      const res = await sendNegativeReviewAlert({
        to: targetEmail,
        businessName: currentBusiness?.businessName || currentBusiness?.name || 'My Local Business',
        customerName: 'Alex Customer (Sample)',
        customerEmail: 'alex.sample@gmail.com',
        customerPhone: '+1 (555) 019-2831',
        rating: 2,
        comment: 'This is a test negative review alert to verify your Resend email integration is working!',
        businessId: currentBusiness?.id,
      });

      if (res.success) {
        addToast('success', `Test email dispatched to ${targetEmail}! Check your inbox.`, 'Email Delivered');
      } else {
        addToast('error', res.error || 'Failed to send test email', 'Email Notice');
      }
    } catch (err: any) {
      addToast('error', err.message || 'Error triggering test email', 'Email Error');
    } finally {
      setTestingEmail(false);
    }
  };

  const handleSaveNotifications = (e: React.FormEvent) => {
    e.preventDefault();
    addToast('success', 'Notification preferences saved!', 'Preferences Saved');
  };

  const handleInviteTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setTeamMembers((prev) => [
      ...prev,
      { name: inviteEmail.split('@')[0], email: inviteEmail, role: inviteRole, status: 'Invited' },
    ]);
    setInviteEmail('');
    setInviteModalOpen(false);
    addToast('success', `Invitation sent to ${inviteEmail}`, 'Invite Sent');
  };

  const handleSelectPlan = (plan: 'starter' | 'growth' | 'enterprise') => {
    setCurrentPlan(plan);
    setPlanModalOpen(false);
    addToast('success', `Plan successfully updated to ${planDetails[plan].name} (${planDetails[plan].price})!`, 'Subscription Updated');
  };

  return (
    <div id="settings-page-root" className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Account & System Settings
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Configure notification thresholds, team members, and billing subscription.
        </p>
      </div>

      {/* Notifications Card */}
      <form onSubmit={handleSaveNotifications}>
        <Card className="p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Urgent Complaint & Review Alerts</h3>
              <p className="text-xs text-slate-500">Decide when your management team is notified</p>
            </div>
          </div>

          <div className="space-y-4">
            <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="mt-1 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <div className="text-sm">
                <span className="font-bold text-slate-900 block">Instant Email on Negative (1–3 Stars) Feedback</span>
                <span className="text-xs text-slate-500">Sends the customer comment and contact information immediately to your inbox.</span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={smsAlerts}
                onChange={(e) => setSmsAlerts(e.target.checked)}
                className="mt-1 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <div className="text-sm">
                <span className="font-bold text-slate-900 block">Instant SMS Text Alert</span>
                <span className="text-xs text-slate-500">Sends text ping to on-duty manager for immediate resolution.</span>
              </div>
            </label>

            {smsAlerts && (
              <div className="pl-8">
                <Input
                  label="SMS Alert Phone Number"
                  value={alertPhone}
                  onChange={(e) => setAlertPhone(e.target.value)}
                  leftIcon={<Smartphone className="w-4 h-4" />}
                />
              </div>
            )}

            <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={weeklyDigest}
                onChange={(e) => setWeeklyDigest(e.target.checked)}
                className="mt-1 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <div className="text-sm">
                <span className="font-bold text-slate-900 block">Weekly Reputation & Google Growth Digest</span>
                <span className="text-xs text-slate-500">Summary of total ratings, click conversions, and response times every Monday.</span>
              </div>
            </label>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              loading={testingEmail}
              onClick={handleTestEmail}
              leftIcon={<Mail className="w-4 h-4" />}
            >
              Send Test Alert Email (Resend)
            </Button>
            <Button type="submit" variant="primary" size="sm" leftIcon={<Save className="w-4 h-4" />}>
              Save Notification Preferences
            </Button>
          </div>
        </Card>
      </form>

      {/* Team Members Card */}
      <Card className="p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Team & Staff Access</h3>
              <p className="text-xs text-slate-500">Invite receptionists or managers to view feedback</p>
            </div>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setInviteModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Invite Member
          </Button>
        </div>

        <div className="divide-y divide-slate-100">
          {teamMembers.map((member, i) => (
            <div key={i} className="py-3 flex items-center justify-between text-sm">
              <div>
                <div className="font-semibold text-slate-900">{member.name}</div>
                <div className="text-xs text-slate-500">{member.email}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-slate-600">{member.role}</span>
                <Badge variant={member.status === 'Active' ? 'success' : 'default'} size="sm">
                  {member.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Current Plan Card */}
      <Card className="p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Current Subscription</h3>
              <p className="text-xs text-slate-500">{planDetails[currentPlan].name}</p>
            </div>
          </div>
          <Badge variant="success" size="md">Active</Badge>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          <div>
            <span className="text-2xl font-extrabold text-slate-900">{planDetails[currentPlan].price}</span>
            <p className="text-xs text-slate-500 mt-0.5">{planDetails[currentPlan].locations} • Next billing date: September 15, 2026</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => addToast('info', 'Your payment method is active.', 'Billing Info')}
            >
              Manage Billing
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPlanModalOpen(true)}
            >
              Change Plan
            </Button>
          </div>
        </div>
      </Card>

      {/* Change Plan Modal */}
      <Modal
        isOpen={planModalOpen}
        onClose={() => setPlanModalOpen(false)}
        title="Select Subscription Plan"
        description="Choose the right plan for your business footprint and location needs."
      >
        <div className="space-y-3 pt-2">
          {[
            {
              id: 'starter' as const,
              name: 'Starter',
              price: '₹99',
              desc: '1 Business Location, standard review routing & QR generator.',
            },
            {
              id: 'growth' as const,
              name: 'Growth (Recommended)',
              price: '₹499',
              desc: 'Up to 3 Locations, instant SMS/Email alerts & custom branding.',
            },
            {
              id: 'enterprise' as const,
              name: 'Enterprise',
              price: '₹1,499',
              desc: 'Unlimited Locations, multi-tenant portal, webhooks & priority SLA.',
            },
          ].map((plan) => {
            const isSelected = currentPlan === plan.id;
            return (
              <div
                key={plan.id}
                onClick={() => handleSelectPlan(plan.id)}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/50 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{plan.name}</span>
                    {isSelected && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600 text-white">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">{plan.desc}</p>
                </div>
                <div className="text-right shrink-0 pl-3">
                  <span className="text-lg font-black text-slate-900">{plan.price}</span>
                  <span className="text-xs text-slate-400">/mo</span>
                </div>
              </div>
            );
          })}
          <div className="pt-3 flex justify-end">
            <Button variant="outline" size="sm" onClick={() => setPlanModalOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* Invite Member Modal */}
      <Modal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        title="Invite Team Member"
        description="Grant a staff member access to view and resolve incoming reviews."
      >
        <form onSubmit={handleInviteTeam} className="space-y-4">
          <Input
            label="Staff Email"
            type="email"
            placeholder="colleague@yourclinic.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            required
            leftIcon={<Mail className="w-4 h-4" />}
          />

          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1.5">
              Role & Permissions
            </label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none"
            >
              <option value="Office Manager">Office Manager (Full Feedback & Settings)</option>
              <option value="Staff Lead">Staff Lead (View & Resolve Tickets)</option>
              <option value="Viewer">Viewer (Read-Only Analytics)</option>
            </select>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setInviteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Send Invitation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
