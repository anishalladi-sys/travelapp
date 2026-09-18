import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Claymorphism Button', () => {
  it('renders with clay base classes', () => {
    render(<Button>Test</Button>);
    const btn = screen.getByRole('button', { name: /test/i });
    expect(btn).toHaveClass('rounded-clay');
    expect(btn).toHaveClass('shadow-clay');
    expect(btn).toHaveClass('bg-clay-raised');
    expect(btn).toHaveClass('focus-clay');
  });

  it('applies primary variant with clay shadows', () => {
    render(<Button variant="primary">Primary</Button>);
    const btn = screen.getByRole('button', { name: /primary/i });
    expect(btn).toHaveClass('bg-primary');
    expect(btn).toHaveClass('text-primary-foreground');
    expect(btn).toHaveClass('shadow-clay');
  });

  it('applies outline variant with clay border', () => {
    render(<Button variant="outline">Outline</Button>);
    const btn = screen.getByRole('button', { name: /outline/i });
    expect(btn).toHaveClass('border-clay-border');
    expect(btn).toHaveClass('bg-transparent');
  });

  it('shows pressed state (inset shadow) on mousedown via active pseudo-class', () => {
    render(<Button>Press me</Button>);
    const btn = screen.getByRole('button', { name: /press me/i });
    
    // Fire mousedown event
    fireEvent.mouseDown(btn);
    // Active pseudo-class styles are CSS-only, not applied as classes
    // The test verifies the component renders with correct active styles in className
    expect(btn).toHaveClass('active:shadow-clay-inset');
    expect(btn).toHaveClass('active:translate-y-0.5');
    expect(btn).toHaveClass('active:scale-[0.98]');
  });

  it('has hover lift (raised shadow) via hover pseudo-class', () => {
    render(<Button>Hover me</Button>);
    const btn = screen.getByRole('button', { name: /hover me/i });
    
    // Hover pseudo-class styles are CSS-only
    expect(btn).toHaveClass('hover:shadow-clay-raised');
    expect(btn).toHaveClass('hover:-translate-y-0.5');
  });

  it('disables properly with loading state', () => {
    render(<Button loading>Loading</Button>);
    const btn = screen.getByRole('button', { name: /loading/i });
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByText(/loading.../i)).toBeInTheDocument();
  });

  it('has min-h-[44px] touch target class', () => {
    render(<Button>Test</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toHaveClass('min-h-[44px]');
  });
});