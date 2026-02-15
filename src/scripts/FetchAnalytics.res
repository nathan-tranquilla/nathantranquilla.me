// Fetch GA4 page view data for blog posts at build time

let scriptDir = Node.dirname(Node.fileURLToPath(Node.importMetaUrl))
let projectRoot = Node.joinPath([scriptDir, "..", ".."])
let outputDir = Node.joinPath([projectRoot, "public", "data"])

// Load .env.local if it exists
let loadEnv = () => {
  let envPath = Node.joinPath([projectRoot, ".env.local"])
  if Node.existsSync(envPath) {
    let content = Node.readFileSync(envPath, "utf-8")
    content
    ->String.split("\n")
    ->Array.forEach(line => {
      let trimmed = line->String.trim
      if trimmed != "" && !(trimmed->String.startsWith("#")) {
        switch trimmed->String.indexOf("=") {
        | -1 => ()
        | eqIndex => {
            let key = trimmed->String.slice(~start=0, ~end=eqIndex)
            let value = trimmed->String.slice(~start=eqIndex + 1, ~end=trimmed->String.length)
            switch Node.processEnv->Dict.get(key) {
            | Some(_) => () // Don't override existing env vars
            | None => Node.processEnv->Dict.set(key, value)
            }
          }
        }
      }
    })
  }
}

// ISO date string for N days ago
let daysAgoDate: int => string = %raw(`(n) => new Date(Date.now() - n * 86400000).toISOString().slice(0, 10)`)

let fetchBlogViews = async (): dict<int> => {
  let serviceAccountJson = Node.processEnv->Dict.get("GA4_SERVICE_ACCOUNT_JSON")
  let propertyId = Node.processEnv->Dict.get("GA4_PROPERTY_ID")

  switch (serviceAccountJson, propertyId) {
  | (Some(jsonStr), Some(propId)) => {
      open Ga4Client
      let credentials = parseCredentials(jsonStr)
      let client = makeClient({"credentials": credentials})
      let property = `properties/${propId}`
      let startDate = daysAgoDate(90)
      Console.log(`  Date range: ${startDate} to today`)
      let dateRanges: array<dateRange> = [{startDate, endDate: "today"}]

      try {
        let responses = await client->runReportWithFilter({
          "property": property,
          "dateRanges": dateRanges,
          "dimensions": [{name: "pagePath"}: dimension],
          "metrics": [{name: "screenPageViews"}],
          "dimensionFilter": {
            filter: {
              fieldName: "pagePath",
              stringFilter: {value: "/blogs/", matchType: "BEGINS_WITH"},
            },
          },
          "orderBys": [{metric: {metricName: "screenPageViews"}, desc: true}],
          "limit": 100,
        })

        let result = Dict.make()
        switch responses[0] {
        | Some(response) => {
            let pairs = extractPathViewCounts(response)
            pairs->Array.forEach(((path, count)) => {
              // Normalize path: strip trailing slash for consistency
              let normalizedPath = if path->String.endsWith("/") {
                path->String.slice(~start=0, ~end=path->String.length - 1)
              } else {
                path
              }
              // Accumulate in case GA4 returns both /blogs/foo and /blogs/foo/
              let existing = result->Dict.get(normalizedPath)->Option.getOr(0)
              result->Dict.set(normalizedPath, existing + count)
            })
          }
        | None => ()
        }
        result
      } catch {
      | JsExn(err) => {
          Console.log("  Page view query failed: " ++ JsExn.message(err)->Option.getOr(""))
          Dict.make()
        }
      }
    }
  | _ => {
      Console.log("  GA4 credentials not configured. Skipping data fetch.")
      Console.log("  Set GA4_SERVICE_ACCOUNT_JSON and GA4_PROPERTY_ID to enable.")
      Dict.make()
    }
  }
}

let main = async () => {
  Console.log("Fetching blog view counts from GA4...\n")
  loadEnv()

  let viewCounts = try {
    await fetchBlogViews()
  } catch {
  | JsExn(err) => {
      Console.error("GA4 fetch failed: " ++ JsExn.message(err)->Option.getOr(""))
      Console.log("  Continuing with empty data.")
      Dict.make()
    }
  }

  Node.mkdirSync(outputDir, {"recursive": true})
  let outputPath = Node.joinPath([outputDir, "analytics.json"])
  Node.writeFileSync(outputPath, Node.jsonStringify2(viewCounts, 2))

  Console.log(`Blog view counts:`)
  viewCounts->Dict.forEachWithKey((count, path) => {
    Console.log(`  ${path}: ${count->Int.toString} views`)
  })
  Console.log(`\nWritten to ${outputPath}`)
  Console.log("Analytics fetch complete!")
}

main()->ignore
