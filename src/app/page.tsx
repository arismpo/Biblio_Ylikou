export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold text-blue-600">ΒΙΒΛΙΟ ΥΛΙΚΟΥ</h1>
      <p className="mt-4 text-lg text-gray-600">Νέα έκδοση με Next.js 15 και Prisma 6</p>
      <p className="mt-2 text-sm text-green-600">✅ Βάση δεδομένων συνδεδεμένη!</p>
      <div className="mt-8 flex gap-4">
        <a href="/dashboard" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Μετάβαση στην εφαρμογή
        </a>
      </div>
    </main>
  )
}