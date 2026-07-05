import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import { EmployeeQrModal } from '../src/components/EmployeeQrModal';

describe('EmployeeQrModal', () => {
  it('renders employee name and QR code', () => {
    const mockOnClose = vi.fn();
    const mockUri = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

    render(
      <EmployeeQrModal 
        employeeName="John Doe" 
        qrCodeDataUri={mockUri} 
        onClose={mockOnClose} 
      />
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute('src', mockUri);
  });

  it('calls onClose when close button is clicked', () => {
    const mockOnClose = vi.fn();
    render(
      <EmployeeQrModal 
        employeeName="John" 
        qrCodeDataUri="data:image/png;base64,test" 
        onClose={mockOnClose} 
      />
    );

    const closeButtons = screen.getAllByRole('button');
    // Click the "Done" button at the bottom
    fireEvent.click(closeButtons[1]);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
