module.exports = {
  apps: [
    {
      name: "shopify-app:dev",
      script: "server/index.js",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
