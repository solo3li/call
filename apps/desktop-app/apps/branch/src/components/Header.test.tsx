import { render, screen, fireEvent } from '@testing-library/react';
import Header from './Header';
import { vi, describe, it, expect } from 'vitest';

// Mock the context hook
vi.mock('../context/DashboardContext', () => ({
  useDashboard: vi.fn(() => ({
    stats: {
      notifications: [
        { id: 1, text: 'New order', unread: true, time: '2m ago' },
        { id: 2, text: 'Low stock', unread: false, time: '1h ago' },
      ]
    }
  }))
}));

describe('Header Component', () => {
  const defaultProps = {
    sidebarCollapsed: false,
    onToggleMobile: vi.fn(),
  };

  it('calls onToggleMobile when mobile menu button is clicked', () => {
    render(<Header {...defaultProps} />);
    const menuIcon = document.querySelector('.lucide-menu');
    const mobileToggle = menuIcon?.closest('button');
    
    if (!mobileToggle) throw new Error('Mobile toggle button not found');
    
    fireEvent.click(mobileToggle);
    expect(defaultProps.onToggleMobile).toHaveBeenCalled();
  });
});
