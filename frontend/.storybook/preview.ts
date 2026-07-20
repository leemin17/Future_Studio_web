/// <reference types="vite/client" />

import type { Preview } from '@storybook/react-vite';
import '../src/index.css';

const preview: Preview = {
  parameters: {
    layout: 'centered',
    backgrounds: {
      options: {
        studio: { name: 'Studio', value: '#0c0d0e' },
      },
    },
  },
  initialGlobals: {
    backgrounds: { value: 'studio' },
  },
};

export default preview;
