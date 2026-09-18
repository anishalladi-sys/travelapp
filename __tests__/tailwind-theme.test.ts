import config from '@/tailwind.config';

describe('Tailwind claymorphism theme', () => {
  const theme = config.theme as any;
  const colors = theme.extend.colors as Record<string, any>;
  const radius = theme.extend.borderRadius as Record<string, string>;
  const shadows = theme.extend.boxShadow as Record<string, string>;

  it('extends colors with clay palette', () => {
    expect(colors.clay).toBeDefined();
    expect(colors.clay.surface).toBe('hsl(var(--clay-surface))');
    expect(colors.clay.raised).toBe('hsl(var(--clay-raised))');
    expect(colors.clay.pressed).toBe('hsl(var(--clay-pressed))');
    expect(colors.clay.border).toBe('hsl(var(--clay-border))');
    expect(colors.clay.highlight).toBe('hsl(var(--clay-highlight))');
    expect(colors.clay.shadow).toBe('hsl(var(--clay-shadow))');
  });

  it('maps semantic colors to clay tokens', () => {
    expect(colors.background).toBe('hsl(var(--background))');
    expect(colors.card.DEFAULT).toBe('hsl(var(--card))');
    expect(colors.border).toBe('hsl(var(--border))');
    expect(colors.ring).toBe('hsl(var(--ring))');
  });

  it('defines clay borderRadius', () => {
    expect(radius.clay).toBe('var(--radius)');
    expect(radius['clay-lg']).toBe('calc(var(--radius) + 4px)');
  });

  it('defines clay boxShadows', () => {
    expect(shadows.clay).toBeTruthy();
    expect(shadows['clay-inset']).toBeTruthy();
    expect(shadows['clay-raised']).toBeTruthy();
    expect(shadows['clay-modal']).toBeTruthy();
  });
});