/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.module.rules.forEach((rule) => {
      if (Array.isArray(rule.oneOf)) {
        rule.oneOf.forEach((one) => {
          const useLoaders = Array.isArray(one.use) ? one.use : [one.use];
          useLoaders.forEach((use) => {
            if (
              use &&
              typeof use.loader === 'string' &&
              use.loader.includes('css-loader')
            ) {
              use.options = {
                ...use.options,
                modules: {
                  auto: true,
                },
              };
            }
          });
        });
      }
    });
    return config;
  },
};

export default nextConfig;
