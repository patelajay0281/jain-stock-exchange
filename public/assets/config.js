/* JSE front-end configuration: which API the pages talk to.
   Production pages use the production API; preview deployments (jse-live.pages.dev) use staging.
   Overrides are limited to the known backends: ?api=stage | ?api=prod | ?api=local */
(function () {
  var PROD = "https://br-lingering-sun-azzfzwj1-jse.compute.c-3.ap-southeast-1.aws.neon.tech";
  var STAGE = "https://br-lingering-sun-azzfzwj1-jsestage.compute.c-3.ap-southeast-1.aws.neon.tech";
  var host = location.hostname, pick = null;
  try {
    var q = new URLSearchParams(location.search).get("api");
    if (q === "stage" || q === "prod" || q === "local" || q === "auto") sessionStorage.setItem("jse_api", q);
    pick = sessionStorage.getItem("jse_api");
  } catch (e) {}
  var api;
  if (pick === "stage") api = STAGE;
  else if (pick === "prod") api = PROD;
  else if (pick === "local") api = "";
  else if (host === "localhost" || host === "127.0.0.1") api = "";
  else if (host === "jse-live.pages.dev" || /\.jse-live\.pages\.dev$/.test(host)) api = STAGE;
  else api = PROD;
  window.JSE_CONFIG = { api: api, env: api === STAGE ? "staging" : api === PROD ? "production" : "local", version: "2.72.0" };
})();
