@react.component
let make = (~webdev: React.element, ~ai: React.element) => {
  let (activeTab, setActiveTab) = React.useState(() => "webdev")

  let tabBase = "pb-2 px-1 text-base cursor-pointer transition-colors"
  let activeClasses = "border-b-2 border-[var(--accent-bg)] text-[var(--text-primary)] font-semibold"
  let inactiveClasses = "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"

  <>
    <div className="flex gap-6 border-b border-[var(--border-primary)] mb-8" dataTestId="tab-bar">
      <button
        type_="button"
        className={`${tabBase} ${activeTab == "webdev" ? activeClasses : inactiveClasses}`}
        onClick={_ => setActiveTab(_ => "webdev")}>
        {React.string("Web Development")}
      </button>
      <button
        type_="button"
        className={`${tabBase} ${activeTab == "ai" ? activeClasses : inactiveClasses}`}
        onClick={_ => setActiveTab(_ => "ai")}>
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
