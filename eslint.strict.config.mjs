import baseConfig from './eslint.config.mjs';

const HARD_FILE_LINE_LIMIT = 300;
const HARD_FUNCTION_LINE_LIMIT = 30;

export default [
  ...baseConfig,
  {
    files: ['**/*.{js,jsx,ts,tsx,mjs,cjs}'],
    rules: {
      'max-lines': [
        'error',
        {
          max: HARD_FILE_LINE_LIMIT,
          skipBlankLines: true,
          skipComments: true,
        },
      ],
      'max-lines-per-function': [
        'error',
        {
          max: HARD_FUNCTION_LINE_LIMIT,
          skipBlankLines: true,
          skipComments: true,
          IIFEs: true,
        },
      ],
    },
  },
];
