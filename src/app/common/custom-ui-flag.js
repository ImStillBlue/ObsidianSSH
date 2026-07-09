/**
 * Whether this build runs the custom UI skin.
 *
 * In dev the CUSTOM_UI=1 env var toggles it (set via .env / dotenv).
 * Packaged apps launch without env vars, so prepare.js overwrites this
 * file in work/app with `module.exports = true` when building with
 * CUSTOM_UI=1, baking the flag into the bundle.
 */
module.exports = process.env.CUSTOM_UI === '1'
