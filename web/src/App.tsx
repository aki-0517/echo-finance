import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import '@rainbow-me/rainbowkit/styles.css'

import { config } from './wagmi'
import LandingPage from './components/LandingPage'
import AppLayout from './components/AppLayout'

const queryClient = new QueryClient()

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <Router>
            <Routes>
              <Route path="/lp" element={<LandingPage />} />
              <Route path="/app" element={<AppLayout />} />
              <Route path="/" element={<AppLayout />} />
            </Routes>
          </Router>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default App