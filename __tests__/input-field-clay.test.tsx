import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel, FieldInput, FieldDescription, FieldError } from '@/components/ui/field';

describe('Claymorphism Input/Field', () => {
  it('Input renders with clay base classes', () => {
    render(<Input placeholder="Test" />);
    const input = screen.getByPlaceholderText('Test');
    expect(input).toHaveClass('rounded-clay');
    expect(input).toHaveClass('bg-clay-surface');
    expect(input).toHaveClass('border-clay-border');
    expect(input).toHaveClass('shadow-clay-inset');
    expect(input).toHaveClass('focus-clay');
  });

  it('Input focus shows ring', () => {
    render(<Input />);
    const input = screen.getByRole('textbox');
    fireEvent.focus(input);
    expect(input).toHaveClass('focus-clay');
  });

  it('Input error state shows destructive border/ring', () => {
    render(<Input aria-invalid="true" aria-describedby="error" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('border-destructive');
    expect(input).toHaveClass('focus-visible:ring-destructive');
  });

  it('disabled input has clay pressed bg and no shadow via disabled pseudo-classes', () => {
    render(<Input disabled />);
    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
    expect(input).toHaveClass('disabled:bg-clay-pressed');
    expect(input).toHaveClass('disabled:shadow-none');
  });

  it('Field composes label, input, description, error with proper a11y', () => {
    const inputId = 'email-field';
    render(
      <Field>
        <FieldLabel htmlFor={inputId}>Email</FieldLabel>
        <FieldInput id={inputId} placeholder="you@example.com" />
        <FieldDescription>We'll never share your email</FieldDescription>
        <FieldError>Invalid email</FieldError>
      </Field>
    );
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
    expect(screen.getByText("We'll never share your email")).toHaveClass('text-muted-foreground');
    expect(screen.getByText('Invalid email')).toHaveClass('text-destructive');
  });
});