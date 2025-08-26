import { ConnectButton } from '@rainbow-me/rainbowkit'
import Dashboard from './Dashboard'

export default function AppLayout() {
  return (
    <div className="min-h-screen grad-black">
      <div className="min-h-screen">
        <header className="bg-white/5 backdrop-blur supports-[backdrop-filter]:bg-white/5 border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <img src="/logo.png" alt="Echo Finance" className="w-8 h-8" />
                <h1 className="text-2xl font-bold bg-clip-text text-transparent grad-orange">
                  Echo <span className="text-brand-highlight">v0.1.0</span>
                </h1>
              </div>
              <ConnectButton />
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-28">
          <Dashboard />
        </main>
        
        <footer className="fixed bottom-0 inset-x-0 bg-white/5 backdrop-blur supports-[backdrop-filter]:bg-white/5 border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between text-sm text-brand-gray">
            <span>© {new Date().getFullYear()} Echo</span>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-brand-highlight">Docs</a>
              <a href="#" className="hover:text-brand-highlight">GitHub</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}