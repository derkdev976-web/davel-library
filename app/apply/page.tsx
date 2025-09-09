import { MembershipForm } from "@/components/forms/membership-form"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

export default function ApplyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F5DC] to-white dark:from-gray-900 dark:to-gray-800">
      <Header />
      <main className="pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gradient mb-4">Apply for Membership</h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Join our community of book lovers and gain access to our extensive collection, events, and exclusive
              member benefits.
            </p>
          </div>
          <MembershipForm />
        </div>
      </main>
      <Footer />
    </div>
  )
}
