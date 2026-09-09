import type { Meta, StoryObj } from '@storybook/react-vite';
import { Page, Group, mono, useResolved } from './tokenTable';

const ROLES: Record<string, string[]> = {
  Surfaces: ['bg', 'surface', 'surface-sunken'],
  Borders: ['border', 'border-strong'],
  Text: ['text', 'text-muted', 'text-inverse'],
  Accent: ['accent', 'accent-hover', 'accent-active', 'accent-subtle', 'on-accent'],
  Success: ['success', 'success-hover', 'success-subtle', 'on-success'],
  Warning: ['warning', 'warning-hover', 'warning-subtle', 'on-warning'],
  Danger: ['danger', 'danger-hover', 'danger-subtle', 'on-danger'],
  Utility: ['focus-ring', 'overlay'],
};

const ALL = Object.values(ROLES).flat().map((n) => `--sds-color-${n}`);

function Swatches() {
  const { ref, values } = useResolved(ALL);
  return (
    <div ref={ref}>
      {Object.entries(ROLES).map(([group, names]) => (
        <Group key={group} title={group}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--sds-space-3)' }}>
            {names.map((name) => (
              <div key={name}>
                <div
                  style={{
                    height: 64,
                    borderRadius: 'var(--sds-radius-md)',
                    border: '1px solid var(--sds-color-border)',
                    background: `var(--sds-color-${name})`,
                  }}
                />
                <div style={{ ...mono, marginTop: 'var(--sds-space-1)' }}>--sds-color-{name}</div>
                <div style={{ ...mono, color: 'var(--sds-color-text-muted)' }}>
                  {values[`--sds-color-${name}`] || ' '}
                </div>
              </div>
            ))}
          </div>
        </Group>
      ))}
    </div>
  );
}

const meta = {
  title: 'Foundations/Colour',
  parameters: { layout: 'fullscreen', controls: { disable: true } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Semantic: Story = {
  render: () => (
    <Page
      title="Colour"
      intro="These are semantic tokens: they name a role, not a hue. Components may only use this layer. Flip the theme in the toolbar and watch every name stay the same while its resolved value changes. That stability is what makes the layer mappable to Figma variable modes."
    >
      <Swatches />
    </Page>
  ),
};

export const Primitives: Story = {
  render: () => (
    <Page
      title="Primitive ramps"
      intro="The raw material. Nothing outside src/tokens/semantic.css is allowed to reference these. They are shown here so you can see what the semantic layer is choosing from, not so you can use them."
    >
      {(['neutral', 'brand', 'success', 'warning', 'danger'] as const).map((ramp) => {
        const steps =
          ramp === 'neutral'
            ? ['0', '50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950']
            : ramp === 'brand'
              ? ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900']
              : ['100', '300', '500', '600', '700'];
        return (
          <Group key={ramp} title={ramp}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {steps.map((step) => (
                <div key={step} style={{ flex: '1 1 60px' }}>
                  <div
                    style={{
                      height: 48,
                      background: `var(--sds-${ramp}-${step})`,
                      border: '1px solid var(--sds-color-border)',
                    }}
                  />
                  <div style={{ ...mono, textAlign: 'center' }}>{step}</div>
                </div>
              ))}
            </div>
          </Group>
        );
      })}
    </Page>
  ),
};
