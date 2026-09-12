// Section 5.3 of the contract: 20 calendar days for reviewer feedback at
// either level, after which the document is automatically "accepted" if no
// feedback was given. Hardcoded reviewer names match Section 5.1/5.2 until
// a real user/role directory exists.
export const SLA_DAYS = 20;
export const LEVEL1_REVIEWER = 'Abhishek Bhadra';
export const LEVEL2_REVIEWER = 'EWM Experts / Trainers';

export function daysRemaining(deadline) {
  if (!deadline) return null;
  const ms = new Date(deadline).getTime() - Date.now();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

export function isOverdue(deadline) {
  if (!deadline) return false;
  return new Date(deadline).getTime() < Date.now();
}