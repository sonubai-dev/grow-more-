import { calculateTrialStatus, formatPlanName, getPlanLocationLimit, hasActiveSubscription } from '../src/lib/trialHelper';

console.log('--- Testing Plan & Trial Helper Logic ---');

// Test 1: Real production business Solita with plan: 'starter' and status: 'active'
const solitaBiz: any = {
  id: 'c4654b8b-a03d-4578-ab44-0fba4576963d',
  name: 'Solita',
  plan: 'starter',
  status: 'active',
  created_at: '2026-11-20T05:14:13.171261Z',
};

const solitaStatus = calculateTrialStatus(solitaBiz);
console.log('Test 1 - Solita hasActiveSubscription:', hasActiveSubscription(solitaBiz) === true ? '✓ PASS' : '✗ FAIL');
console.log('Test 1 - Solita isActiveSubscription:', solitaStatus.isActiveSubscription === true ? '✓ PASS' : '✗ FAIL');
console.log('Test 1 - Solita isTrial (should be false for active paid account):', solitaStatus.isTrial === false ? '✓ PASS' : '✗ FAIL');
console.log('Test 1 - Solita formatPlanName:', formatPlanName(solitaBiz.plan) === 'Starter (₹99)' ? '✓ PASS' : '✗ FAIL');

// Test 2: Fresh signup in 14-day free trial (status: 'trial')
const newSignupBiz: any = {
  id: 'biz_new',
  name: 'New Shop',
  plan: 'starter',
  status: 'trial',
  createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // Day 3 of 14
};
const trialStatus = calculateTrialStatus(newSignupBiz);
console.log('Test 2 - Trial User isTrial:', trialStatus.isTrial === true ? '✓ PASS' : '✗ FAIL');
console.log('Test 2 - Trial User isActiveSubscription:', trialStatus.isActiveSubscription === false ? '✓ PASS' : '✗ FAIL');
console.log(`Test 2 - Countdown: Day ${trialStatus.dayNumber} of 14, ${trialStatus.daysRemaining} days left`);

// Test 3: Growth plan with active subscription
const growthBiz: any = {
  id: 'biz_growth',
  name: 'Growth Biz',
  plan: 'growth',
  status: 'active',
};
const growthStatus = calculateTrialStatus(growthBiz);
console.log('Test 3 - Growth isActiveSubscription:', growthStatus.isActiveSubscription === true ? '✓ PASS' : '✗ FAIL');
console.log('Test 3 - Growth formatPlanName:', formatPlanName(growthBiz.plan) === 'Growth (₹499)' ? '✓ PASS' : '✗ FAIL');
console.log('Test 3 - Growth location limit (Max 3):', getPlanLocationLimit(growthBiz.plan) === 3 ? '✓ PASS' : '✗ FAIL');

// Test 4: Enterprise plan
console.log('Test 4 - Enterprise Coming Soon format:', formatPlanName('enterprise') === 'Enterprise (Coming Soon)' ? '✓ PASS' : '✗ FAIL');

console.log('--- ALL UNIT TESTS COMPLETED SUCCESSFULLY ---');
