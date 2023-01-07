/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

//module.exports = nextConfig

const withTM = require('next-transpile-modules')(['web-ifc-three']);
module.exports = withTM({nextConfig});