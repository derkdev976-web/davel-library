import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Suspense } from "react"
import { CatalogGrid } from "@/components/catalog/catalog-grid"
import { headers } from "next/headers"

export const dynamic = "force-dynamic"

async function getBooks() {
  const hdrs = headers()
  const proto = hdrs.get("x-forwarded-proto") || "http"
  const host = hdrs.get("host") || "localhost:3000"
  const base = process.env.NEXT_PUBLIC_BASE_URL || `${proto}://${host}`
  const res = await fetch(`${base}/api/books`, { cache: "no-store" })
  if (!res.ok) return [] as any[]
  const data = await res.json()
  return data.books as Array<any>
}

export default async function CatalogPage() {
  const books = await getBooks()
  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10">
        <h1 className="text-3xl font-bold mb-6 text-gradient">Catalog</h1>
        <Suspense fallback={<div>Loading catalog...</div>}>
          <CatalogGrid initialBooks={books} />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}


