import { Link } from 'react-router-dom'
import { ArrowRight, ExternalLink } from 'lucide-react'
import { useProtocolStats } from '../hooks/useProtocolStats'

export default function LandingPage() {
  const stats = useProtocolStats()

  return (
    <div className="min-h-screen grad-black">
      {/* Header */}
      <header className="bg-white/5 backdrop-blur supports-[backdrop-filter]:bg-white/5 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Echo Finance" className="w-8 h-8" />
              <h1 className="text-2xl font-bold bg-clip-text text-transparent grad-orange">
                Echo
              </h1>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <a 
                href="#" 
                className="text-brand-gray hover:text-brand-highlight transition-colors"
              >
                Docs
              </a>
              <Link
                to="/app"
                className="btn-primary flex items-center gap-2"
              >
                Launch App
                <ArrowRight size={16} />
              </Link>
            </nav>
            {/* Mobile menu button */}
            <div className="md:hidden">
              <Link
                to="/app"
                className="btn-primary text-sm px-3 py-2"
              >
                Launch App
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-brand-highlight/15 text-brand-primary mb-6">
                Sonic Testnet
              </div>
              
              <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Yield‑backed stability on Sonic
              </h1>
              
              <p className="text-lg text-brand-gray mb-8 max-w-lg mx-auto lg:mx-0">
                eSUSD — S / stS collateral, interest-free, leveraging stS yield
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  to="/app"
                  className="btn-primary flex items-center justify-center gap-2 text-lg px-8 py-3"
                >
                  Launch App
                  <ArrowRight size={20} />
                </Link>
                <a
                  href="#"
                  className="btn-secondary flex items-center justify-center gap-2 text-lg px-8 py-3"
                >
                  Docs
                  <ExternalLink size={20} />
                </a>
              </div>
            </div>
            
            {/* Hero Visual - Optional */}
            <div className="hidden lg:block">
              <div className="relative">
                <div className="w-96 h-96 mx-auto flex items-center justify-center">
                  <div className="absolute inset-0 grad-orange rounded-full blur-3xl opacity-20"></div>
                  <img src="/logo.png" alt="Echo Finance" className="w-48 h-48 relative z-10" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Protocol Stats */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="card text-center">
              <h3 className="text-sm font-medium text-brand-gray mb-2">Total Value Locked</h3>
              <p className="text-3xl font-bold text-white">
                {stats.totalValueLocked || '$0'}
              </p>
              <p className="text-xs text-brand-gray mt-1">Sonic Network</p>
            </div>
            
            <div className="card text-center">
              <h3 className="text-sm font-medium text-brand-gray mb-2">Total eSUSD Minted</h3>
              <p className="text-3xl font-bold text-white">
                {stats.totalESUSDMinted || '0 eSUSD'}
              </p>
              <p className="text-xs text-brand-gray mt-1">Collateralized Stablecoin</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-white/5 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-brand-gray">
              © {new Date().getFullYear()} Echo Finance
            </p>
            <div className="flex items-center gap-6">
              <a 
                href="#" 
                className="text-sm text-brand-gray hover:text-brand-highlight transition-colors"
              >
                Docs
              </a>
              <a 
                href="#" 
                className="text-sm text-brand-gray hover:text-brand-highlight transition-colors"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}