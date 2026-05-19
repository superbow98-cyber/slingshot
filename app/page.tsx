export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-2xl text-center">
        <h1 className="serif text-6xl mb-4" style={{ color: 'var(--ink)' }}>
          Slingshot
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Website builder for Malaysian businesses. 12 niche templates. Customer + Owner + Kitchen + Counter — all in one.
        </p>
        <div className="flex gap-4 justify-center">
          <a
            href="/signup"
            className="px-6 py-3 rounded-xl font-bold text-sm"
            style={{ background: 'var(--ink)', color: 'white' }}
          >
            Start free trial →
          </a>
          <a
            href="/templates"
            className="px-6 py-3 rounded-xl font-bold text-sm border"
            style={{ borderColor: 'var(--line)' }}
          >
            See templates
          </a>
        </div>
        <p className="text-xs text-gray-500 mt-12">
          From RM 29/mo · 14-day free trial · No credit card required
        </p>
      </div>
    </main>
  );
}
