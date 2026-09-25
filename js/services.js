// Backend boundary. Every function returns mock data so the UI runs standalone —
// replace the bodies with real API calls when wiring into the live site.

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const mockUser = {
  name: 'Alex Rivera',
  email: 'alex.rivera@example.com',
  plan: 'standard', // 'standard' | 'pro' (config.js: plans)
  renewsOn: null, // ISO date the paid plan next renews; null on Standard
  credits: 240,
  avatarUrl: null, // null → initials fallback
};

export async function getCurrentUser() {
  return { ...mockUser };
}

/** Uploads a new avatar and resolves with its URL. */
export async function updateAvatar(file) {
  await wait(300);
  mockUser.avatarUrl = URL.createObjectURL(file);
  return mockUser.avatarUrl;
}

/**
 * Moves the user to another plan and resolves with { plan, renewsOn }.
 * Live site: upgrading goes through checkout; downgrading cancels the paid
 * plan (usually at the end of the period, so renewsOn becomes an end date).
 */
export async function changePlan(plan) {
  await wait(500);
  mockUser.plan = plan;
  const renews = new Date();
  renews.setMonth(renews.getMonth() + 1);
  mockUser.renewsOn = plan === 'pro' ? renews.toISOString().slice(0, 10) : null;
  return { plan: mockUser.plan, renewsOn: mockUser.renewsOn };
}

/** Live site: redirect to the billing portal (e.g. Stripe customer portal). */
export async function openSubscriptionPortal() {
  await wait(200);
}

/** Live site: clear the session, then redirect to the sign-in page. */
export async function logOut() {
  await wait(200);
}

export async function deleteAccount() {
  await wait(400);
}
