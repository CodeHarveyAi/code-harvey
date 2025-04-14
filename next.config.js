/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: false, // disables SWC
  compiler: {
    // Force Babel for transpiling
    styledComponents: true,
  },
}

module.exports = nextConfig
