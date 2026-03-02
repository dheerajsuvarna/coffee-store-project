const pillars = [
  {
    number: "01",
    title: "Single Origin",
    description:
      "Every bean traced to a single farm or cooperative.",
  },
  {
    number: "02",
    title: "Ethically Traded",
    description:
      "Direct farmer relationships, fair prices.",
  },
  {
    number: "03",
    title: "Small Batch",
    description:
      "Roasted weekly in 20kg batches for freshness.",
  },
  {
    number: "04",
    title: "Expert Curated",
    description:
      "Selected by Q-Grade certified cuppers.",
  },
]

const BrandPromise = () => {
  return (
    <section className="bg-berg-off py-24 px-6">
      <div className="content-container">
        <div className="text-center mb-16">
          <span className="section-eyebrow">Why Bergkraft</span>
          <h2 className="section-heading text-berg-ink mt-3">Our Promise</h2>
        </div>
        <div className="grid grid-cols-2 small:grid-cols-4 gap-10">
          {pillars.map((p) => (
            <div key={p.number} className="flex flex-col gap-3">
              <span className="font-display text-5xl font-bold text-berg-red leading-none">
                {p.number}
              </span>
              <h3 className="text-berg-ink font-sans font-bold uppercase tracking-widest text-xs">
                {p.title}
              </h3>
              <p className="text-berg-muted font-sans text-sm leading-relaxed">
                {p.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default BrandPromise
