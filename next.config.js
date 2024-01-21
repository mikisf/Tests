/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

const withTM = require('next-transpile-modules')(['openbim-components', '@popperjs/core', 'bim-fragment']);
module.exports = withTM({nextConfig});