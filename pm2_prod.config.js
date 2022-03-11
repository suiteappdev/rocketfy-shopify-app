module.exports = {
  apps: [
    {
      name: "shopify-app:prod",
      script: "server/index.js",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
