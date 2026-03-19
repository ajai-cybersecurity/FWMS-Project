import { Link } from 'react-router-dom'
import { Home, Wheat } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen auth-bg field-pattern flex items-center justify-center p-4">
      <div className="text-center text-white animate-fade-up">
        <div className="text-8xl mb-4">🌾</div>
        <h1 className="font-display text-6xl font-black mb-2">404</h1>
        <p className="text-white/80 text-xl mb-8">This field is empty — page not found.</p>
        <Link to="/login" className="inline-flex items-center gap-2 bg-white text-leaf-700 font-semibold px-6 py-3 rounded-2xl hover:bg-white/90 transition-colors shadow-lg">
          <Home className="w-5 h-5" /> Back to Home
        </Link>
      </div>
    </div>
  )
}
