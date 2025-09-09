import { GuestEbookDashboard } from '@/components/dashboard/guest-ebook-dashboard'
import { Header } from '@/components/layout/header'

export default function FreeEbooksPage() {

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <GuestEbookDashboard />
        </div>
      </main>
                </div>
  )
}
