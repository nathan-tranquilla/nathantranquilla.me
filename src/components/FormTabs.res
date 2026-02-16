module Location = {
  type t
  @val @scope("window") external location: t = "location"
  @get external hash: t => string = "hash"
  @set external setHash: (t, string) => unit = "hash"

  let getHash = () => hash(location)
  let updateHash = (newHash: string) => setHash(location, newHash)
}

module Window = {
  @val @scope("window")
  external addEventListener: (string, unit => unit) => unit = "addEventListener"
  @val @scope("window")
  external removeEventListener: (string, unit => unit) => unit = "removeEventListener"
}

@react.component
let make = (~webdev: React.element, ~ai: React.element) => {
  let (activeTab, setActiveTab) = React.useState(() => "webdev")

  // Update URL hash when tab changes
  let switchTab = (tab: string) => {
    setActiveTab(_ => tab)
    Location.updateHash(tab)
  }

  // Read initial tab from URL hash on mount and listen for changes
  React.useEffect0(() => {
    // Set initial tab based on hash
    let initialHash = Location.getHash()
    switch initialHash {
    | "#ai" => setActiveTab(_ => "ai")
    | "#webdev" => setActiveTab(_ => "webdev")
    | _ => ()
    }

    // Listen for hash changes (browser back/forward)
    let handleHashChange = () => {
      let currentHash = Location.getHash()
      switch currentHash {
      | "#ai" => setActiveTab(_ => "ai")
      | "#webdev" => setActiveTab(_ => "webdev")
      | _ => ()
      }
    }

    Window.addEventListener("hashchange", handleHashChange)

    Some(() => Window.removeEventListener("hashchange", handleHashChange))
  })

  let tabBase = "pb-2 px-1 text-base cursor-pointer transition-colors"
  let activeClasses = "border-b-2 border-[var(--accent-bg)] text-[var(--text-primary)] font-semibold"
  let inactiveClasses = "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"

  <>
    <div className="flex gap-6 border-b border-[var(--border-primary)] mb-8" dataTestId="tab-bar">
      <button
        type_="button"
        className={`${tabBase} ${activeTab == "webdev" ? activeClasses : inactiveClasses}`}
        onClick={_ => switchTab("webdev")}>
        {React.string("Web Development")}
      </button>
      <button
        type_="button"
        className={`${tabBase} ${activeTab == "ai" ? activeClasses : inactiveClasses}`}
        onClick={_ => switchTab("ai")}>
        {React.string("AI Consulting")}
      </button>
    </div>
    <div className={activeTab == "webdev" ? "" : "hidden"}>
      {webdev}
    </div>
    <div className={activeTab == "ai" ? "" : "hidden"}>
      {ai}
    </div>
  </>
}
