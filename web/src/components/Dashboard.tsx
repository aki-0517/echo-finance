import { useState } from 'react'
import VaultSummaryCard from './VaultSummaryCard'
import CollateralModal from './CollateralModal'
import MintModal from './MintModal'
import RepayModal from './RepayModal'
import WithdrawModal from './WithdrawModal'
import { useVaultData } from '../hooks/useVaultData'

export default function Dashboard() {
  const [isCollateralModalOpen, setIsCollateralModalOpen] = useState(false)
  const [isMintModalOpen, setIsMintModalOpen] = useState(false)
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false)
  const [isRepayModalOpen, setIsRepayModalOpen] = useState(false)
  
  // Load real vault data from contracts
  useVaultData()
  
  
  return (
    <div className="space-y-8">
      {/* Protocol Stats - Top Highlight */}
      <div className="card bg-gradient-to-r from-brand-highlight/25 to-brand-primary/25 border border-brand-highlight/30">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-brand-gray">Protocol Stats</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
          <div>
            <p className="text-sm text-brand-gray/70">Total Value Locked</p>
            <p className="text-3xl sm:text-4xl font-bold text-brand-gray">$2.4M</p>
          </div>
          <div>
            <p className="text-sm text-brand-gray/70">Total eSUSD Minted</p>
            <p className="text-3xl sm:text-4xl font-bold text-brand-gray">1.2M eSUSD</p>
          </div>
        </div>
      </div>
      {/* Main Vault Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <VaultSummaryCard
            onDepositClick={() => setIsCollateralModalOpen(true)}
            onWithdrawClick={() => setIsWithdrawModalOpen(true)}
            onMintClick={() => setIsMintModalOpen(true)}
            onRepayClick={() => setIsRepayModalOpen(true)}
          />
        </div>
        
        <div className="space-y-6">
          
          {/* Recent Activity */}
          <div className="card">
            <h3 className="text-lg font-semibold text-brand-gray mb-4">Recent Activity</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-brand-gray/70">Deposited 2 S</span>
                <span className="text-brand-gray/60">2h ago</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-gray/70">Minted 1000 eSUSD</span>
                <span className="text-brand-gray/60">1d ago</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-gray/70">Repaid 500 eSUSD</span>
                <span className="text-brand-gray/60">3d ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Liquidations Section */}
      {/* {isConnected && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Liquidation Opportunities</h2>
          <LiquidationList />
        </div>
      )} */}
      
      {/* Modals */}
      <CollateralModal
        isOpen={isCollateralModalOpen}
        onClose={() => setIsCollateralModalOpen(false)}
      />
      
      <MintModal
        isOpen={isMintModalOpen}
        onClose={() => setIsMintModalOpen(false)}
      />
      
      <RepayModal
        isOpen={isRepayModalOpen}
        onClose={() => setIsRepayModalOpen(false)}
      />
      
      <WithdrawModal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
      />
    </div>
  )
}