import { formatDateTime, formatDecisionStatus, formatProcessingStatus } from '../utils/format';

describe('format utilities', () => {
  it('formats dates in a user-friendly way', () => {
    const formatted = formatDateTime('2025-01-15T12:30:00Z');
    expect(formatted).toContain('2025');
  });

  it('returns fallback when date is missing', () => {
    expect(formatDateTime(undefined)).toEqual('Unknown');
  });

  it('maps processing statuses to readable labels', () => {
    expect(formatProcessingStatus('completed')).toEqual('Completed');
    expect(formatProcessingStatus('pending')).toEqual('Pending');
  });

  it('maps decision statuses to readable labels', () => {
    expect(formatDecisionStatus('approved')).toEqual('Approved');
    expect(formatDecisionStatus('in_review')).toEqual('Needs review');
  });
});
