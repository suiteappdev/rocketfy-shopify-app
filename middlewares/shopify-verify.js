import crypto from "crypto";
import Shopify from "@shopify/shopify-api";

const shopifyVerify = (ctx, key) => {
  return new Promise((resolve, reject) => {
    const hash = crypto
      .createHmac("SHA256", key)
      .update(JSON.stringify(ctx.request.body), "utf8")
      .digest("base64");

    const hmac = ctx.request.headers["x-shopify-hmac-sha256"];
    console.log(hash, hmac);

    return resolve(Shopify.Utils.safeCompare(hash, hmac));
  });
};

export default shopifyVerify;
