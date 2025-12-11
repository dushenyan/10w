import antfu from '@antfu/eslint-config'

export default antfu({

  type: 'lib',

  jsonc: true,

  typescript: true,

  ignores: ['pages/**/*'],

}, {
  files: ['**/*'],
  rules: {
    'no-console': 'off',
    'ts/explicit-function-return-type': 'off',
  },
})
