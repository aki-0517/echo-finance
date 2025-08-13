import { useState } from 'react'
import { useAccount } from 'wagmi'
import VaultSummaryCard from './VaultSummaryCard'
import CollateralModal from './CollateralModal'
import MintModal from './MintModal'
import RepayModal from './RepayModal'
import WithdrawModal from './WithdrawModal'
import LiquidationList from './LiquidationList'
import { useVaultData } from '../hooks/useVaultData'

export default function Dashboard() {
  const [isCollateralModalOpen, setIsCollateralModalOpen] = useState(false)
  const [isMintModalOpen, setIsMintModalOpen] = useState(false)
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false)
  const [isRepayModalOpen, setIsRepayModalOpen] = useState(false)
  
  const { isConnected } = useAccount()
  
  // Load real vault data from contracts
  useVaultData()
  
  
  return (
    <div className="space-y-8">
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
          {/* Protocol Stats */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Protocol Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Value Locked</span>
                <span className="text-sm font-semibold">$2.4M</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total eSUSD Minted</span>
                <span className="text-sm font-semibold">1.2M eSUSD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">S Price</span>
                <span className="text-sm font-semibold">$2,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">stS Exchange Rate</span>
                <span className="text-sm font-semibold">1.1 S</span>
              </div>
            </div>
          </div>
          
          {/* Recent Activity */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Deposited 2 S</span>
                <span className="text-gray-500">2h ago</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Minted 1000 eSUSD</span>
                <span className="text-gray-500">1d ago</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Repaid 500 eSUSD</span>
                <span className="text-gray-500">3d ago</span>
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