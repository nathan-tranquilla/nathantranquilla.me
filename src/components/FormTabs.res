@react.component
let make = (~webdev: React.element, ~ai: React.element) => {
  let url = RescriptReactRouter.useUrl()
  let (activeTab, setActiveTab) = React.useState(() => "webdev")

  // Sync with URL hash after hydration (avoids hydration mismatch)
  React.useEffect1(() => {
    switch url.hash {
    | "ai" => setActiveTab(_ => "ai")
    | "webdev" => setActiveTab(_ => "webdev")
    | _ => ()
    }
    None
  }, [url.hash])

  // Update URL hash when tab changes
  let switchTab = (tab: string) => {
    RescriptReactRouter.push("#" ++ tab)
  }

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
