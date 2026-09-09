import type { Meta, StoryObj } from '@storybook/react-vite';

const COLOUR_TOKENS = [
  'bg',
  'surface',
  'surface-sunken',
  'border',
  'border-strong',
  'text',
  'text-muted',
  'accent',
  'accent-hover',
  'accent-subtle',
  'danger',
  'danger-subtle',
];

const SPACE_TOKENS = ['1', '2', '3', '4', '5', '6', '8', '10', '12'];
const RADIUS_TOKENS = ['sm', 'md', 'lg', 'full'];

const meta = {
  title: 'Foundations/Tokens',
  parameters: { layout: 'fullscreen', controls: { disable: true } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 'var(--sds-space-10)' }}>
      <h2
        style={{
          fontSize: 'var(--sds-font-size-lg)',
          fontWeight: 'var(--sds-font-weight-bold)',
          marginBottom: 'var(--sds-space-4)',
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

/**
 * The semantic layer, rendered. Flip the theme in the toolbar: nothing
 * below changes name, only value. That one-to-one name mapping is what
 * later syncs to Figma variables.
 */
export const Semantic: Story = {
  render: () => (
    <div style={{ fontFamily: 'var(--sds-font-sans)' }}>
      <Section title="Colour">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: 'var(--sds-space-3)',
          }}
        >
          {COLOUR_TOKENS.map((name) => (
            <div key={name}>
              <div
                style={{
                  height: 56,
                  borderRadius: 'var(--sds-radius-md)',
                  border: '1px solid var(--sds-color-border)',
                  background: `var(--sds-color-${name})`,
                }}
              />
              <code style={{ fontSize: 'var(--sds-font-size-xs)', fontFamily: 'var(--sds-font-mono)' }}>
                --sds-color-{name}
              </code>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Spacing">
        <div style={{ display: 'grid', gap: 'var(--sds-space-2)' }}>
          {SPACE_TOKENS.map((step) => (
            <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 'var(--sds-space-4)' }}>
              <div
                style={{
                  height: 16,
                  width: `var(--sds-space-${step})`,
                  background: 'var(--sds-color-accent)',
                  borderRadius: 'var(--sds-radius-sm)',
                }}
              />
              <code style={{ fontSize: 'var(--sds-font-size-xs)', fontFamily: 'var(--sds-font-mono)' }}>
                --sds-space-{step}
              </code>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Radius">
        <div style={{ display: 'flex', gap: 'var(--sds-space-4)', flexWrap: 'wrap' }}>
          {RADIUS_TOKENS.map((name) => (
            <div key={name} style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: 72,
                  height: 72,
                  background: 'var(--sds-color-accent-subtle)',
                  border: '1px solid var(--sds-color-accent)',
                  borderRadius: `var(--sds-radius-${name})`,
                }}
              />
              <code style={{ fontSize: 'var(--sds-font-size-xs)', fontFamily: 'var(--sds-font-mono)' }}>
                {name}
              </code>
            </div>
          ))}
        </div>
      </Section>
    </div>
  ),
};
