import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { MemberDirectory } from "@/components/public/member-directory"

export default function MembersPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <Header />
      <main className="pt-24 pb-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Our Community Members
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover and connect with fellow library members in your community. 
              Share reading interests, find study partners, and build lasting friendships.
            </p>
          </div>
          
          <MemberDirectory />
        </div>
      </main>
      <Footer />
    </div>
  )
}
