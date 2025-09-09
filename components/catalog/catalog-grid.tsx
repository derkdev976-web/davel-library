"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { deweyClassFromCode, deweyRanges } from "@/lib/dewey"

type Book = {
  id: string
  title: string
  author: string
  deweyDecimal: string
  isElectronic: boolean
  availableCopies: number
  genre?: string
  summary?: string
  coverImage?: string
}

interface CatalogGridProps {
  initialBooks?: Book[]
}

export function CatalogGrid({ initialBooks = [] }: CatalogGridProps) {
  const [books, setBooks] = useState<Book[]>(initialBooks)
  const [q, setQ] = useState("")
  const [range, setRange] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [pageCount, setPageCount] = useState(1)
  const { toast } = useToast()

  // Only fetch books if no initialBooks provided
  useEffect(() => {
    if (initialBooks.length === 0) {
      ;(async () => {
        const res = await fetch(`/api/books?page=${page}&limit=12`, { cache: "no-store" })
        if (res.ok) {
          const data = await res.json()
          setBooks(data.books)
          setPageCount(data.pageCount || 1)
        }
      })()
    } else {
      setBooks(initialBooks)
    }
  }, [page, initialBooks])

  const filtered = useMemo(() => {
    const t = q.toLowerCase().trim()
    const byText = (b: Book) =>
      !t || b.title.toLowerCase().includes(t) || b.author.toLowerCase().includes(t) || (b.deweyDecimal || "").startsWith(t)
    const byRange = (b: Book) => {
      if (!range) return true
      const cls = deweyClassFromCode(b.deweyDecimal)
      return cls?.code === range
    }
    return books.filter((b) => byText(b) && byRange(b))
  }, [books, q, range])

  const reserve = async (bookId: string) => {
    const res = await fetch("/api/reservations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ bookId }) })
    if (res.status === 401) {
      toast({ title: "Please sign in", description: "You must be signed in to reserve a book.", variant: "destructive" })
      return
    }
    toast({ title: "Reserved", description: "Your reservation request has been placed." })
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <aside className="lg:col-span-3">
        <div className="sticky top-24 space-y-3">
          <Input placeholder="Search by title, author, or Dewey..." value={q} onChange={(e) => setQ(e.target.value)} />
          <div className="flex flex-wrap gap-2">
            <button
              className={`px-3 py-1 rounded-full border text-xs ${!range ? "bg-[#8B4513] text-white border-[#8B4513]" : "bg-background"}`}
              onClick={() => setRange(null)}
            >
              All
            </button>
            {deweyRanges.map((r) => (
              <button
                key={r.code}
                className={`px-3 py-1 rounded-full border text-xs ${range === r.code ? "bg-[#8B4513] text-white border-[#8B4513]" : "bg-background"}`}
                onClick={() => setRange(r.code)}
                title={r.title}
              >
                {r.code.split("-")[0]}s
              </button>
            ))}
          </div>
          {range && (
            <div className="rounded-md border p-3 bg-card">
              <div className="font-semibold text-sm mb-2">{deweyRanges.find((r) => r.code === range)?.title}</div>
              <ul className="text-xs text-muted-foreground list-disc ml-4 space-y-1">
                {deweyRanges
                  .find((r) => r.code === range)!
                  .topics.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
              </ul>
            </div>
          )}
        </div>
      </aside>
      <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.map((b) => (
          <Card key={b.id}>
            <CardHeader>
              <CardTitle className="text-lg">{b.title}</CardTitle>
              <div className="text-sm text-muted-foreground">{b.author}</div>
            </CardHeader>
            <CardContent>
              <Image 
                src={b.coverImage || "/images/catalog/placeholder.svg"} 
                alt={b.title} 
                width={300}
                height={160}
                className="w-full h-40 object-cover rounded-md mb-3 border" 
              />
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Dewey {b.deweyDecimal}</Badge>
                {(() => { const cls = deweyClassFromCode(b.deweyDecimal); return cls ? <Badge variant="outline">{cls.title}</Badge> : null })()}
                {b.isElectronic ? <Badge variant="default">eBook</Badge> : <Badge variant="outline">Print</Badge>}
                                 {b.genre && (
                   <Badge variant="outline">{b.genre}</Badge>
                 )}
              </div>
              {b.summary && <p className="mt-3 text-sm text-muted-foreground">{b.summary}</p>}
              <Button onClick={() => reserve(b.id)} className="mt-3 bg-[#8B4513] hover:bg-[#A0522D]">Reserve</Button>
            </CardContent>
          </Card>
        ))}
      </div>
      {initialBooks.length === 0 && (
        <div className="lg:col-span-9 flex items-center justify-center gap-2">
          <Button variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>Prev</Button>
          <span className="text-sm">Page {page} of {pageCount}</span>
          <Button variant="outline" onClick={() => setPage((p) => Math.min(pageCount, p + 1))} disabled={page >= pageCount}>Next</Button>
        </div>
      )}
    </div>
  )
}


