// Node.js API bindings for build scripts

// fs module
@module("fs") external readFileSync: (string, string) => string = "readFileSync"
@module("fs") external writeFileSync: (string, string) => unit = "writeFileSync"
@module("fs") external mkdirSync: (string, {"recursive": bool}) => unit = "mkdirSync"
@module("fs") external existsSync: string => bool = "existsSync"

// path module
@module("path") @variadic external joinPath: array<string> => string = "join"
@module("path") external dirname: string => string = "dirname"

// url module
@module("url") external fileURLToPath: string => string = "fileURLToPath"

// process
@val external processEnv: dict<string> = "process.env"

// import.meta.url — no direct ReScript binding available
let importMetaUrl: string = %raw(`import.meta.url`)

// JSON helpers
@val external jsonParse: string => 'a = "JSON.parse"
@val external jsonStringify: 'a => string = "JSON.stringify"
@val external jsonStringify2: ('a, @as(json`null`) _, int) => string = "JSON.stringify"
