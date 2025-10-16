import { ClusterDecisionStatus, NotionSyncStatus, ProcessingStatus } from '../api/types';

export const formatDateTime = (value?: string): string => {
  if (!value) {
    return 'Unknown';
  }

  try {
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  } catch (error) {
    console.warn('Failed to format date', error);
    return value;
  }
};

export const formatProcessingStatus = (status: ProcessingStatus): string => {
  switch (status) {
    case 'completed':
      return 'Completed';
    case 'processing':
      return 'Processing';
    case 'failed':
      return 'Failed';
    default:
      return 'Pending';
  }
};

export const formatDecisionStatus = (status: ClusterDecisionStatus): string => {
  switch (status) {
    case 'approved':
      return 'Approved';
    case 'rejected':
      return 'Rejected';
    case 'in_review':
      return 'Needs review';
    default:
      return 'New';
  }
};

export const formatNotionStatus = (status: NotionSyncStatus): string => {
  switch (status) {
    case 'synced':
      return 'Synced';
    case 'syncing':
      return 'Syncing';
    case 'error':
      return 'Error';
    default:
      return 'Not synced';
  }
};
