import React from 'react';
import { render, screen } from '@testing-library/react';
import { EmptyState } from '@/components/ui/empty-state';
import { SectionHeader } from '@/components/ui/section-header';
import { Timeline } from '@/components/ui/timeline';

describe('Claymorphism EmptyState/SectionHeader/Timeline', () => {
  it('EmptyState renders with clay classes', () => {
    render(
      <EmptyState
        illustration={<div>🧳</div>}
        title="No trips"
        description="Create your first trip"
      />
    );
    const container = screen.getByText('No trips').closest('div');
    expect(container).toHaveClass('rounded-clay-lg');
    expect(container).toHaveClass('border-clay-border');
    expect(container).toHaveClass('bg-clay-surface');
  });

  it('SectionHeader renders with correct structure', () => {
    render(
      <SectionHeader
        title="Your Trips"
        lede="3 trips planned"
      />
    );
    expect(screen.getByText('Your Trips')).toHaveClass('font-serif');
    expect(screen.getByText('3 trips planned')).toHaveClass('section-lede');
  });

  it('Timeline renders with clay dots and connector', () => {
    render(
      <Timeline
        items={[
          { time: '10:00', title: 'Activity 1', location: 'Location 1' },
          { time: '14:00', title: 'Activity 2', location: 'Location 2' },
        ]}
      />
    );
    // Check dots exist (they're divs with rounded-full)
    const dots = document.querySelectorAll('.rounded-full.border-2');
    expect(dots.length).toBeGreaterThanOrEqual(2);
    // Check connector exists
    const connector = document.querySelector('[data-testid="timeline-connector"]');
    expect(connector).toBeInTheDocument();
  });
});