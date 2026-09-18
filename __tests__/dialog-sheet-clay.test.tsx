import React from 'react';
import { render, screen } from '@testing-library/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, Sheet, SheetContent } from '@/components/ui/dialog';

describe('Claymorphism Dialog/Sheet', () => {
  it('DialogContent renders with clay classes', () => {
    render(
      <Dialog open={true}>
        <DialogContent>Content</DialogContent>
      </Dialog>
    );
    const content = screen.getByText('Content').closest('[role="dialog"]');
    expect(content).toHaveClass('rounded-clay-lg');
    expect(content).toHaveClass('bg-clay-raised');
    expect(content).toHaveClass('shadow-clay-modal');
  });

  it('Dialog sub-components render', () => {
    render(
      <Dialog open={true}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Title</DialogTitle>
            <DialogDescription>Description</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
  });

  it('SheetContent renders with clay classes', () => {
    render(
      <Sheet open={true}>
        <SheetContent>Content</SheetContent>
      </Sheet>
    );
    const content = screen.getByText('Content').closest('[role="dialog"]');
    expect(content).toHaveClass('rounded-clay-lg');
    expect(content).toHaveClass('bg-clay-raised');
    expect(content).toHaveClass('shadow-clay-modal');
  });
});