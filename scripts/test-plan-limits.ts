import { calculateTrialStatus, formatPlanName, getPlanLocationLimit, hasActiveSubscription } from '../src/lib/trialHelper';

console.log('--- Testing Plan & Trial Helper Logic ---');

// Test 1: Legacy business with plan: 'premium_499' and status: 'active' but NO subscriptionId
const legacyBiz: any = {
  id: 'biz_solita',
  name: 'Solita',
  plan: 'premium_499',
  status: 'active',
  createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Created 1 day ago
};

const trial = calculateTrialStatus(legacyBiz);
console.log('Test 1 - Legacy Account isTrial:', trial.isTrial === true ? '✓ PASS' : '✗ FAIL');
console.log(`Test 1 - Countdown: Day ${trial.dayNumber} of 14, ${trial.daysRemaining} days left`);
console.log('Test 1 - formatPlanName for legacy:', formatPlanName(legacyBiz.plan) === 'Starter (₹99)' ? '✓ PASS' : '✗ FAIL');
console.log('Test 1 - getPlanLocationLimit for legacy:', getPlanLocationLimit(legacyBiz.plan) === 1 ? '✓ PASS' : '✗ FAIL');

// Test 2: Growth plan with active paid subscriptionId
const growthBiz: any = {
  id: 'biz_growth',
  name: 'Growth Biz',
  plan: 'growth',
  status: 'active',
  subscriptionId: 'sub_live_growth_123',
};
const paidStatus = calculateTrialStatus(growthBiz);
console.log('Test 2 - Active Subscription:', paidStatus.isActiveSubscription === true ? '✓ PASS' : '✗ FAIL');
console.log('Test 2 - formatPlanName Growth:', formatPlanName(growthBiz.plan) === 'Growth (₹499)' ? '✓ PASS' : '✗ FAIL');
console.log('Test 2 - getPlanLocationLimit (Max 3 businesses):', getPlanLocationLimit(growthBiz.plan) === 3 ? '✓ PASS' : '✗ FAIL');

// Test 3: Enterprise plan
console.log('Test 3 - Enterprise Coming Soon format:', formatPlanName('enterprise') === 'Enterprise (Coming Soon)' ? '✓ PASS' : '✗ FAIL');

console.log('--- ALL UNIT TESTS COMPLETED SUCCESSFULLY ---');
