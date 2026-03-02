import { Metadata } from "next"

import FeaturedProducts from "@modules/home/components/featured-products"
import Hero from "@modules/home/components/hero"
import BrandPromise from "@modules/home/components/brand-promise"
import OriginStory from "@modules/home/components/origin-story"
import BrewGuide from "@modules/home/components/brew-guide"
import Newsletter from "@modules/home/components/newsletter"
import { listCollections } from "@lib/data/collections"
import { getRegion } from "@lib/data/regions"

export const metadata: Metadata = {
  title: "Bergkraft — Specialty Coffee",
  description:
    "Single-origin specialty coffee sourced from high-altitude farms, roasted in small batches and delivered to your door.",
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params

  const { countryCode } = params

  const region = await getRegion(countryCode)

  const { collections } = await listCollections({
    fields: "id, handle, title",
  })

  if (!collections || !region) {
    return null
  }

  return (
    <>
      <Hero />
      <BrandPromise />
      <div className="py-12">
        <ul className="flex flex-col gap-x-6">
          <FeaturedProducts collections={collections} region={region} />
        </ul>
      </div>
      <OriginStory />
      <BrewGuide />
      <Newsletter />
    </>
  )
}
