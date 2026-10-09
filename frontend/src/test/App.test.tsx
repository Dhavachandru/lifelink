import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastContext';
import { UrgencyBadge, IncidentStatusBadge } from '../components/StatusBadge';
import { LandingPage } from '../pages/LandingPage';
import { EmergencyDisclaimerBanner } from '../components/EmergencyDisclaimerBanner';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { Button } from '../components/design-system/Button';
import { ChecklistRow } from '../components/design-system/ChecklistRow';
import { ProgressIndicator } from '../components/design-system/ProgressIndicator';
import { EmptyState } from '../components/design-system/EmptyState';
import { AlertCircle } from 'lucide-react';

describe('LIFELINK OS Frontend Component & Design System Tests', () => {
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
          <ToastProvider>
            <LandingPage />
          </ToastProvider>
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

  it('renders design system Button with variants and handles clicks', () => {
    const handleClick = vi.fn();
    render(
      <Button variant="emergency" onClick={handleClick}>
        Report Emergency
      </Button>
    );

    const btn = screen.getByRole('button', { name: /Report Emergency/i });
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders ChecklistRow and toggles status', () => {
    const handleToggle = vi.fn();
    render(
      <ChecklistRow
        id="step-1"
        stepOrder={1}
        title="Exit to safe barrier"
        description="Do not stay inside the vehicle if on a highway shoulder."
        category="IMMEDIATE_SAFETY"
        completed={false}
        onToggle={handleToggle}
      />
    );

    expect(screen.getByText(/Exit to safe barrier/i)).toBeInTheDocument();
    expect(screen.getByText(/Immediate Safety/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('checkbox'));
    expect(handleToggle).toHaveBeenCalledWith('step-1');
  });

  it('renders ProgressIndicator with active and completed steps', () => {
    const steps = [
      { id: '1', label: 'Type' },
      { id: '2', label: 'Details' },
      { id: '3', label: 'Review' },
    ];
    render(<ProgressIndicator steps={steps} currentStepIndex={1} />);

    expect(screen.getByText(/Step 2 of 3/i)).toBeInTheDocument();
  });

  it('renders EmptyState with actions', () => {
    render(
      <EmptyState
        icon={<AlertCircle />}
        title="No active incidents"
        description="All vehicles operating normally."
        action={<Button variant="primary">Add Incident</Button>}
      />
    );

    expect(screen.getByText(/No active incidents/i)).toBeInTheDocument();
    expect(screen.getByText(/All vehicles operating normally\./i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Add Incident/i })).toBeInTheDocument();
  });
});
