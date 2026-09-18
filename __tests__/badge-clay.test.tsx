import React from 'react';
import { render, screen } from '@testing-library/react';
import { Badge } from '@/components/ui/badge';

describe('Claymorphism Badge', () => {
  it('renders with clay base classes', () => {
    render(<Badge>Default</Badge>);
    const badge = screen.getByText('Default');
    expect(badge).toHaveClass('rounded-clay-full');
    expect(badge).toHaveClass('shadow-clay');
    expect(badge).toHaveClass('bg-clay-raised');
  });

  it('outline variant has border', () => {
    render(<Badge variant="outline">Outline</Badge>);
    expect(screen.getByText('Outline')).toHaveClass('border-clay-border');
  });

  it('accent variant uses terracotta', () => {
    render(<Badge variant="accent">Accent</Badge>);
    expect(screen.getByText('Accent')).toHaveClass('bg-primary');
    expect(screen.getByText('Accent')).toHaveClass('text-primary-foreground');
  });

  it('success variant uses green', () => {
    render(<Badge variant="success">Success</Badge>);
    expect(screen.getByText('Success')).toHaveClass('bg-green-500');
    expect(screen.getByText('Success')).toHaveClass('text-white');
  });

  it('warning variant uses yellow', () => {
    render(<Badge variant="warning">Warning</Badge>);
    expect(screen.getByText('Warning')).toHaveClass('bg-yellow-500');
    expect(screen.getByText('Warning')).toHaveClass('text-white');
  });

  it('destructive variant uses red', () => {
    render(<Badge variant="destructive">Destructive</Badge>);
    expect(screen.getByText('Destructive')).toHaveClass('bg-red-500');
    expect(screen.getByText('Destructive')).toHaveClass('text-white');
  });
});