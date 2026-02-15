// Google Analytics 4 Data API bindings

// GA4 report configuration types
type dateRange = {startDate: string, endDate: string}
type dimension = {name: string}
type metric = {name: string}
type metricOrderBy = {metricName: string}
type orderBy = {metric: metricOrderBy, desc: bool}
type stringFilter = {value: string, matchType: string}
type fieldFilter = {fieldName: string, stringFilter: stringFilter}
type simpleFilter = {filter: fieldFilter}

// Response types
type dimensionValue = {value: string}
type metricValue = {value: string}
type row = {
  dimensionValues: array<dimensionValue>,
  metricValues: array<metricValue>,
}
type reportResponse = {rows: Nullable.t<array<row>>}

// Client type and constructor
type client
type credentials
@val external parseCredentials: string => credentials = "JSON.parse"

@module("@google-analytics/data") @new
external makeClient: {"credentials": credentials} => client = "BetaAnalyticsDataClient"

// Run report with simple dimension filter
@send
external runReportWithFilter: (
  client,
  {
    "property": string,
    "dateRanges": array<dateRange>,
    "dimensions": array<dimension>,
    "metrics": array<metric>,
    "dimensionFilter": simpleFilter,
    "orderBys": array<orderBy>,
    "limit": int,
  },
) => promise<array<reportResponse>> = "runReport"

// Helper: extract path -> view count pairs from response rows
let extractPathViewCounts = (response: reportResponse): array<(string, int)> => {
  switch response.rows->Nullable.toOption {
  | None => []
  | Some(rows) =>
    rows->Array.filterMap(row => {
      let pathValue = row.dimensionValues[0]
      let countValue = row.metricValues[0]
      switch (pathValue, countValue) {
      | (Some({value: path}), Some({value: countStr}))
        if path != "" && path != "(not set)" =>
        Some((path, countStr->Int.fromString->Option.getOr(0)))
      | _ => None
      }
    })
  }
}
