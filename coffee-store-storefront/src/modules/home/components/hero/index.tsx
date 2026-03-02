import LocalizedClientLink from "@modules/common/components/localized-client-link"

const Hero = () => {
  return (
    <div className="min-h-[95vh] bg-berg-ink relative overflow-hidden flex flex-col justify-center items-center">
      {/* Decorative circles */}
      <div className="absolute w-[600px] h-[600px] border border-white/5 rounded-full top-[-100px] right-[-150px]" />
      <div className="absolute w-[900px] h-[900px] border border-white/5 rounded-full bottom-[-300px] left-[-250px]" />

      {/* Center content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 gap-6">
        <span className="section-eyebrow">Est. in the mountains · Specialty Coffee</span>

        <h1
          className="font-display font-bold text-white uppercase tracking-tighter leading-none"
          style={{ fontSize: "clamp(4rem, 12vw, 10rem)" }}
        >
          Bergkraft
        </h1>

        <p className="text-white/50 text-lg font-sans max-w-sm">
          Coffee grown where the air is thin.
        </p>

        <div className="h-px w-24 bg-berg-red" />

        <div className="flex flex-col small:flex-row gap-4 mt-2">
          <LocalizedClientLink href="/store" className="berg-btn">
            Shop Now
          </LocalizedClientLink>
          <LocalizedClientLink href="/collections" className="berg-btn-outline">
            Browse Collections
          </LocalizedClientLink>
        </div>
      </div>

      {/* Bottom fade to white */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
    </div>
  )
}

export default Hero
