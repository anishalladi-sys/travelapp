import { readFileSync } from 'fs';
import { join } from 'path';

describe('Claymorphism tokens in globals.css', () => {
  const globalsCss = readFileSync(join(process.cwd(), 'app/globals.css'), 'utf-8');

  it('defines clay surface variables in :root', () => {
    expect(globalsCss).toContain('--clay-surface:');
    expect(globalsCss).toContain('--clay-raised:');
    expect(globalsCss).toContain('--clay-pressed:');
    expect(globalsCss).toContain('--clay-border:');
    expect(globalsCss).toContain('--clay-highlight:');
    expect(globalsCss).toContain('--clay-shadow:');
    expect(globalsCss).toContain('--clay-ring:');
  });

  it('maps semantic colors to clay tokens', () => {
    expect(globalsCss).toContain('--background: var(--clay-surface);');
    expect(globalsCss).toContain('--card: var(--clay-raised);');
    expect(globalsCss).toContain('--border: var(--clay-border);');
    expect(globalsCss).toContain('--ring: var(--clay-ring);');
  });

  it('defines dark mode clay tokens in .dark', () => {
    expect(globalsCss).toContain('.dark {');
    expect(globalsCss).toContain('--clay-surface: 25 15% 16%;');
    expect(globalsCss).toContain('--clay-raised: 25 15% 20%;');
    expect(globalsCss).toContain('--clay-pressed: 25 10% 13%;');
    expect(globalsCss).toContain('--clay-border: 25 10% 23%;');
  });

  it('defines clay shadow utilities', () => {
    expect(globalsCss).toContain('.shadow-clay {');
    expect(globalsCss).toContain('.shadow-clay-inset {');
    expect(globalsCss).toContain('.shadow-clay-raised {');
    expect(globalsCss).toContain('.shadow-clay-modal {');
  });

  it('defines clay radius utilities', () => {
    expect(globalsCss).toContain('.rounded-clay {');
    expect(globalsCss).toContain('.rounded-clay-lg {');
    expect(globalsCss).toContain('.rounded-clay-full {');
  });

  it('defines clay color utilities', () => {
    expect(globalsCss).toContain('.bg-clay-surface {');
    expect(globalsCss).toContain('.bg-clay-raised {');
    expect(globalsCss).toContain('.bg-clay-pressed {');
    expect(globalsCss).toContain('.border-clay-border {');
  });

  it('defines focus-clay utility', () => {
    expect(globalsCss).toContain('.focus-clay {');
  });
});