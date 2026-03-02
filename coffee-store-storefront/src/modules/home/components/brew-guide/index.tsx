import LocalizedClientLink from "@modules/common/components/localized-client-link"

const methods = [
  {
    icon: "◈",
    name: "Espresso",
    description: "Classic pressure extraction — bold, concentrated, with a thick crema.",
  },
  {
    icon: "◎",
    name: "Pour Over",
    description: "Manual precision brewing — clean, complex, and bright in the cup.",
  },
  {
    icon: "◉",
    name: "French Press",
    description: "Full immersion steep — rich, textured, deeply satisfying.",
  },
]

const BrewGuide = () => {
  return (
    <section className="bg-berg-off py-24 px-6">
      <div className="content-container">
        <div className="text-center mb-16">
          <span className="section-eyebrow">Brew Methods</span>
          <h2 className="section-heading text-berg-ink mt-3">Find Your Ritual</h2>
        </div>
        <div className="grid grid-cols-1 small:grid-cols-3 gap-8">
          {methods.map((m) => (
            <div
              key={m.name}
              className="bg-white p-8 flex flex-col gap-4 border border-berg-rule"
            >
              <span className="text-4xl text-berg-red font-display">{m.icon}</span>
              <h3 className="font-display text-xl font-bold text-berg-ink">{m.name}</h3>
              <p className="text-berg-muted font-sans text-sm leading-relaxed flex-1">
                {m.description}
              </p>
              <LocalizedClientLink
                href="/store"
                className="text-berg-red text-xs font-sans font-semibold uppercase tracking-widest hover:text-berg-red-dark transition-colors"
              >
                Explore Beans →
              </LocalizedClientLink>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default BrewGuide
