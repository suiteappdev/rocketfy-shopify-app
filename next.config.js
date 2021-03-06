const { parsed: localEnv } = require("dotenv").config();

const webpack = require("webpack");
const apiKey = JSON.stringify(process.env.SHOPIFY_API_KEY);

module.exports = {
  webpack: (config) => {
    const env = { API_KEY: apiKey};
    config.plugins.push(new webpack.DefinePlugin(env));

    // Add ESM support for .mjs files in webpack 4
    config.module.rules.push({
      test: /\.mjs$/,
      include: /node_modules/,
      type: "javascript/auto",
    });

    return config;
  },
  env: {
    ROCKETFY_PARTNERID : process.env.ROCKETFY_PARTNERID,
    ROCKETFY_APIKEY : process.env.ROCKETFY_APIKEY,
    ROCKETFY_APIHOST : process.env.ROCKETFY_APIHOST,
    HOST : process.env.HOST,
    APIPUBLIC: (process.env.NODE_ENV  == 'production') ? process.env.APIPUBLIC_PRO : process.env.APIPUBLIC_PRO,
    SHOPIFY_PWD_KEYS : process.env.SHOPIFY_PWD_KEYS
  },
};
