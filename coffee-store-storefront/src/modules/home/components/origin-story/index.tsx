import LocalizedClientLink from "@modules/common/components/localized-client-link"

const OriginStory = () => {
  return (
    <section className="bg-berg-ink py-32 px-6">
      <div className="content-container max-w-4xl mx-auto flex flex-col items-center text-center gap-8">
        <span className="section-eyebrow">Our Story</span>

        <blockquote className="font-display text-3xl small:text-5xl font-bold text-white leading-tight">
          &ldquo;Coffee grown where the air is thin and the sun is generous.&rdquo;
        </blockquote>

        <div className="h-px w-24 bg-berg-red" />

        <p className="text-white/60 font-sans text-base leading-relaxed max-w-2xl">
          Bergkraft was founded by mountain climbers who found the world&apos;s finest
          coffees growing at altitude — where cooler temperatures slow the cherry&apos;s
          development and concentrate its sugars. We source exclusively from farms above
          1,500m, then roast in small batches to honour every nuance.
        </p>

        <LocalizedClientLink href="/store" className="berg-btn mt-2">
          Explore Our Coffees
        </LocalizedClientLink>
      </div>
    </section>
  )
}

export default OriginStory
