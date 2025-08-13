import { useState } from 'react'
import VaultSummaryCard from './VaultSummaryCard'
import CollateralModal from './CollateralModal'
import MintModal from './MintModal'
import RepayModal from './RepayModal'
import WithdrawModal from './WithdrawModal'
import { useVaultData } from '../hooks/useVaultData'
import { useProtocolStats } from '../hooks/useProtocolStats'
import { useRecentActivity, formatActivityText, formatRelativeTime } from '../hooks/useRecentActivity'

export default function Dashboard() {
  const [isCollateralModalOpen, setIsCollateralModalOpen] = useState(false)
  const [isMintModalOpen, setIsMintModalOpen] = useState(false)
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false)
  const [isRepayModalOpen, setIsRepayModalOpen] = useState(false)
  
  // Load real vault data from contracts
  useVaultData()
  
  // Load protocol statistics and recent activity
  const protocolStats = useProtocolStats()
  const recentActivity = useRecentActivity()
  
  
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
            {protocolStats.isLoading ? (
              <div className="animate-pulse bg-brand-gray/20 h-10 w-32 rounded"></div>
            ) : protocolStats.error ? (
              <p className="text-3xl sm:text-4xl font-bold text-red-500">Error</p>
            ) : (
              <p className="text-3xl sm:text-4xl font-bold text-brand-gray">{protocolStats.totalValueLocked}</p>
            )}
          </div>
          <div>
            <p className="text-sm text-brand-gray/70">Total eSUSD Minted</p>
            {protocolStats.isLoading ? (
              <div className="animate-pulse bg-brand-gray/20 h-10 w-40 rounded"></div>
            ) : protocolStats.error ? (
              <p className="text-3xl sm:text-4xl font-bold text-red-500">Error</p>
            ) : (
              <p className="text-3xl sm:text-4xl font-bold text-brand-gray">{protocolStats.totalESUSDMinted}</p>
            )}
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
            {recentActivity.isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <div className="animate-pulse bg-brand-gray/20 h-4 w-24 rounded"></div>
                    <div className="animate-pulse bg-brand-gray/20 h-4 w-12 rounded"></div>
                  </div>
                ))}
              </div>
            ) : recentActivity.error ? (
              <div className="text-sm text-red-500">Failed to load recent activity</div>
            ) : recentActivity.activities.length === 0 ? (
              <div className="text-sm text-brand-gray/70">No recent activity</div>
            ) : (
              <div className="space-y-3 text-sm">
                {recentActivity.activities.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex justify-between">
                    <span className="text-brand-gray/70">{formatActivityText(activity)}</span>
                    <span className="text-brand-gray/60">{formatRelativeTime(activity.timestamp)}</span>
                  </div>
                ))}
              </div>
            )}
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