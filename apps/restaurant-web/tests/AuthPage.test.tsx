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
  it('renders login form by default', () => {
    renderWithRouter(<AuthPage isLogin={true} />);
    expect(screen.getByText('دخول المدراء')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('name@restaurant.com')).toBeInTheDocument();
  });

  it('switches to employee login mode', () => {
    renderWithRouter(<AuthPage isLogin={true} />);
    const employeeButton = screen.getByText('الموظفين');
    fireEvent.click(employeeButton);
    expect(screen.getByText('تأكيد الرمز والدخول')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('مثال: AB12C3D4EF')).toBeInTheDocument();
  });

  it('switches to register mode', () => {
    renderWithRouter(<AuthPage isLogin={true} />);
    const registerButton = screen.getByText('حساب جديد');
    fireEvent.click(registerButton);
    expect(screen.getByText('إنشاء حساب جديد')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('مثال: مطعم السحاب السعيد')).toBeInTheDocument();
  });
});
