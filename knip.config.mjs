/** @type {import('knip').KnipConfig} */
// Adapted from the FMC tech-stack knip template.
// Verify scripts: "knip": "KNIP_STRICT=1 knip --config knip.config.mjs"
//                 "knip-warn": "knip --config knip.config.mjs || true"
const strict = process.env.KNIP_STRICT === '1'

export default {
  entry: ['src/routes/**/*.tsx', 'src/**/*.test.ts'],
  ignore: [],
  ignoreBinaries: [],
  rules: {
    files: 'error',
    dependencies: 'error',
    devDependencies: 'error',
    unlisted: 'error',
    binaries: 'error',
    exports: strict ? 'error' : 'warn',
    types: strict ? 'error' : 'warn',
    enumMembers: strict ? 'error' : 'warn',
    duplicates: 'warn',
  },
}
