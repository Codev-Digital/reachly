// Single source of truth for "where should this account be right now".
// Used by middleware, login and /welcome so they never disagree.
export interface RouteState {
  isAdmin?: boolean;
  approvalStatus?: string;
  onboardingStep?: number;
  hasSeenWelcome?: boolean;
  hasCreatorProfile?: boolean;
}

export function postAuthRoute(s: RouteState): string {
  const status = s.approvalStatus || 'none';
  if (s.isAdmin) return '/admin/dashboard';
  if (status === 'rejected') return '/rejected';
  if (status === 'suspended') return '/suspended';
  if (status === 'deleted') return '/account-deleted';
  if (status === 'approved' || status === 'active') {
    return s.hasCreatorProfile ? '/creators/dashboard' : '/user/dashboard';
  }
  if (status === 'pending') {
    return s.hasCreatorProfile ? '/creators/pending-approval' : '/user/pending-approval';
  }
  const step = s.onboardingStep || 0;
  if (step > 0) return `/creator-onboarding/step-${Math.min(step, 7)}`;
  if (s.hasSeenWelcome) return '/user-onboarding';
  return '/welcome';
}
