import { render, screen, fireEvent } from '@testing-library/react';
import AuthPage from '../src/views/AuthPage';
import { vi, describe, it, expect } from 'vitest';

// Mock the API
vi.mock('../src/utils/api', () => ({
  authApi: {
    login: vi.fn(),
    loginEmployee: vi.fn(),
    register: vi.fn(),
    resetPassword: vi.fn(),
  }
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: vi.fn(),
      replace: vi.fn(),
    };
  }
}));

const renderWithRouter = (ui: React.ReactElement) => {
  return render(ui);
};

describe('AuthPage', () => {
  it('renders employee TOTP login form by default', () => {
    renderWithRouter(<AuthPage isLogin={true} />);
    expect(screen.getByText('تأكيد الرمز والدخول')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('مثال: AB12C3D4EF')).toBeInTheDocument();
  });
});
