import { render } from '@testing-library/react-native';

import { NotionStatusBadge } from '../components/NotionStatusBadge';

describe('NotionStatusBadge', () => {
  it('renders synced label', () => {
    const { getByText } = render(<NotionStatusBadge status="synced" />);
    expect(getByText('Synced')).toBeTruthy();
  });

  it('shows syncing label when status is syncing', () => {
    const { getByText } = render(<NotionStatusBadge status="syncing" />);
    expect(getByText('Syncing to Notion…')).toBeTruthy();
  });

  it('changes style for error state', () => {
    const { getByText } = render(<NotionStatusBadge status="error" />);
    expect(getByText('Sync failed')).toHaveStyle({ color: '#FCA5A5' });
  });
});
