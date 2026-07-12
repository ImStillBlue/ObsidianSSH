/**
 * Whether this build runs the custom UI skin.
 *
 * On by default in this fork; set CUSTOM_UI=0 to build/run the stock
 * electerm UI. Packaged apps launch without env vars, so prepare.js
 * overwrites this file in work/app with the resolved constant at pack
 * time, baking the flag into the bundle.
 */
module.exports = process.env.CUSTOM_UI !== '0'
