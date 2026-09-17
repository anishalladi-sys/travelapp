import React from 'react';
import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardTitle, CardContent, CardWithMedia } from '@/components/ui/card';

describe('Claymorphism Card', () => {
  it('renders base card with clay classes', () => {
    render(<Card>Content</Card>);
    const card = screen.getByText('Content').closest('div');
    expect(card).toHaveClass('rounded-clay-lg');
    expect(card).toHaveClass('bg-clay-raised');
    expect(card).toHaveClass('shadow-clay-raised');
    expect(card).toHaveClass('border-clay-border');
  });

  it('CardWithMedia has overflow-hidden and media slot', () => {
    render(
      <CardWithMedia media={<div data-testid="media-test" />}>
        Content
      </CardWithMedia>
    );
    const card = screen.getByTestId('media-test').closest('.overflow-hidden');
    expect(card).toHaveClass('overflow-hidden');
    expect(screen.getByTestId('media-test')).toBeInTheDocument();
  });

  it('Card sub-components render', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
        </CardHeader>
        <CardContent>Content</CardContent>
      </Card>
    );
    expect(screen.getByText('Title')).toHaveClass('font-serif');
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('has hover lift via hover pseudo-class', () => {
    render(<Card>Content</Card>);
    const card = screen.getByText('Content').closest('div');
    expect(card).toHaveClass('hover:shadow-clay-modal');
  });
});