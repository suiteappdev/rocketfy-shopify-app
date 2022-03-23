import crypto from "crypto";

const shopifyVerify = (ctx, key) => {
  return new Promise((resolve, reject) => {
    const generatedHash = crypto
      .createHmac("SHA256", Shopify.Context.API_SECRET_KEY)
      .update(JSON.stringify(ctx.reques.body), "utf8")
      .digest("base64");
    const hmac = ""; // Equal to 'X-Shopify-Hmac-Sha256' at time of coding
    return Shopify.Utils.safeCompare(generatedHash, hmac);
  });
};

export default shopifyVerify;
