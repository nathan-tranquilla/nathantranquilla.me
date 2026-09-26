// GA4 Data API client for the analytics scripts. Credentials come from the
// environment or .env.local (gitignored); in practice only CI has them.
import fs from "node:fs";
import { BetaAnalyticsDataClient } from "@google-analytics/data";

export function ga4() {
  if (fs.existsSync(".env.local")) {
    for (const line of fs.readFileSync(".env.local", "utf8").split("\n")) {
      const m = line.trim().match(/^([A-Z0-9_]+)=(.*)$/);
      if (m && !(m[1] in process.env)) process.env[m[1]] = m[2];
    }
  }
  const { GA4_SERVICE_ACCOUNT_JSON: json, GA4_PROPERTY_ID: propertyId } = process.env;
  if (!json || !propertyId) {
    console.error("Set GA4_SERVICE_ACCOUNT_JSON and GA4_PROPERTY_ID (env or .env.local).");
    process.exit(1);
  }
  const client = new BetaAnalyticsDataClient({ credentials: JSON.parse(json) });
  const property = `properties/${propertyId}`;
  return { run: (request) => client.runReport({ property, limit: 10000, ...request }).then(([r]) => r) };
}

/** A GA4 filter: the dimension starts with /blogs/. */
export const blogPaths = (fieldName) => ({
  filter: { fieldName, stringFilter: { matchType: "BEGINS_WITH", value: "/blogs/" } },
});
