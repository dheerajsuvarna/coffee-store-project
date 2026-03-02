"use client"

import { useState } from "react"

const Newsletter = () => {
  const [email, setEmail] = useState("")

  return (
    <section className="bg-berg-red py-24 px-6">
      <div className="content-container max-w-2xl mx-auto flex flex-col items-center text-center gap-6">
        <h2 className="font-display text-4xl small:text-5xl font-bold text-white leading-tight">
          Join the Bergkraft Collective
        </h2>
        <p className="text-white/80 font-sans text-base">
          Early access to new origins, brewing guides, and seasonal drops.
        </p>
        <form
          onSubmit={(e) => e.preventDefault()}
          className="flex flex-col xsmall:flex-row gap-3 w-full mt-2"
        >
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 px-5 py-3 bg-white/10 border border-white/30 text-white placeholder-white/50 font-sans text-sm outline-none focus:border-white transition-colors"
          />
          <button
            type="submit"
            className="px-8 py-3 bg-white text-berg-red font-sans font-bold uppercase tracking-widest text-xs hover:bg-berg-off transition-colors"
          >
            Subscribe
          </button>
        </form>
      </div>
    </section>
  )
}

export default Newsletter
