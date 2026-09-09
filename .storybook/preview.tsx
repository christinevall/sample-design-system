import type { Preview, Decorator } from '@storybook/react-vite';
import '../src/tokens/base.css';

/**
 * Applies the selected theme by setting the token scope on a wrapper.
 * Fullscreen stories get no padding, so app shells sit flush to the frame.
 */
const withTheme: Decorator = (Story, context) => {
  const theme = context.globals.theme ?? 'light';
  const fullscreen = context.parameters.layout === 'fullscreen';
  document.documentElement.setAttribute('data-theme', theme);
  return (
    <div
      data-theme={theme}
      style={{
        background: 'var(--sds-color-bg)',
        color: 'var(--sds-color-text)',
        padding: fullscreen ? 0 : 'var(--sds-space-6)',
        minHeight: '100%',
      }}
    >
      <Story />
    </div>
  );
};

const preview: Preview = {
  decorators: [withTheme],
  initialGlobals: { theme: 'light' },
  globalTypes: {
    theme: {
      description: 'Token theme',
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
  },
  parameters: {
    layout: 'centered',
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    a11y: { test: 'error' },
    options: {
      storySort: {
        order: [
          'Getting started',
          'Foundations',
          ['Colour', 'Typography', 'Space and shape', 'Motion'],
          'Components',
          ['Actions', 'Forms', 'Navigation', 'Overlays', 'Content', 'Layout', 'Display', 'Feedback'],
          'Patterns',
        ],
      },
    },
  },
};

export default preview;
