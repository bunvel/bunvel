//  @ts-check

import { tanstackConfig } from '@tanstack/eslint-config'

export default [
  ...tanstackConfig,
  {
    rules: {
      '@typescript-eslint/no-unnecessary-type-assertion': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
      'import/order': 'off',
      '@typescript-eslint/require-await': 'off'
    }
  },
  {
    ignores: ['eslint.config.js', 'prettier.config.js', 'src/components/ui/**']
  }
]
