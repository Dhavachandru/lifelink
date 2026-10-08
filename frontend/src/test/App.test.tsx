import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { UrgencyBadge, IncidentStatusBadge } from '../components/StatusBadge';
import { LandingPage } from '../pages/LandingPage';
import { EmergencyDisclaimerBanner } from '../components/EmergencyDisclaimerBanner';
import { ConfirmationModal } from '../components/ConfirmationModal';

describe('LIFELINK OS Frontend Component Tests', () => {
  it('renders UrgencyBadge with correct priority styling', () => {
    render(<UrgencyBadge urgency="CRITICAL" />);
    expect(screen.getByText(/CRITICAL PRIORITY/i)).toBeInTheDocument();

    render(<UrgencyBadge urgency="HIGH" />);
    expect(screen.getByText(/HIGH URGENCY/i)).toBeInTheDocument();
  });

  it('renders IncidentStatusBadge correctly', () => {
    render(<IncidentStatusBadge status="REPORTED" />);
    expect(screen.getByText(/Reported/i)).toBeInTheDocument();

    render(<IncidentStatusBadge status="DISPATCHED" />);
    expect(screen.getByText(/Assistance Dispatched/i)).toBeInTheDocument();
  });

  it('renders LandingPage with core promise and emergency report CTA', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <LandingPage />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByText(/When something goes wrong/i)).toBeInTheDocument();
    expect(screen.getByText(/know what to do next/i)).toBeInTheDocument();
    expect(screen.getByText(/Report an Incident Now/i)).toBeInTheDocument();
    expect(screen.getByText(/Demo Quick-Login/i)).toBeInTheDocument();
  });

  it('renders EmergencyDisclaimerBanner with emergency notice and direct call link', () => {
    render(<EmergencyDisclaimerBanner dismissible={true} />);
    expect(screen.getByText(/EMERGENCY NOTICE:/i)).toBeInTheDocument();
    expect(screen.getByText(/Call 911 \/ 112/i)).toBeInTheDocument();
  });

  it('handles ConfirmationModal confirm and cancel callbacks', () => {
    const handleConfirm = vi.fn();
    const handleCancel = vi.fn();

    const { rerender } = render(
      <ConfirmationModal
        isOpen={true}
        title="Confirm Dispatch"
        message="Please confirm the dispatch to Metro Towing."
        confirmLabel="Authorize Dispatch"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    );

    expect(screen.getByText(/Confirm Dispatch/i)).toBeInTheDocument();
    expect(screen.getByText(/Please confirm the dispatch to Metro Towing\./i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Authorize Dispatch/i }));
    expect(handleConfirm).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    expect(handleCancel).toHaveBeenCalledTimes(1);

    // Modal closed
    rerender(
      <ConfirmationModal
        isOpen={false}
        title="Confirm Dispatch"
        message="Please confirm the dispatch to Metro Towing."
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    );
    expect(screen.queryByText(/Confirm Dispatch/i)).not.toBeInTheDocument();
  });
});

