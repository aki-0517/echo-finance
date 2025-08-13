import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import VaultSummaryCard from './VaultSummaryCard'
import CollateralModal from './CollateralModal'
import MintModal from './MintModal'
import LiquidationList from './LiquidationList'
import { useVaultStore } from '../store/vaultStore'

export default function Dashboard() {
  const [isCollateralModalOpen, setIsCollateralModalOpen] = useState(false)
  const [isMintModalOpen, setIsMintModalOpen] = useState(false)
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false)
  const [isRepayModalOpen, setIsRepayModalOpen] = useState(false)
  
  const { address, isConnected } = useAccount()
  const { setVault, setLoading, setError } = useVaultStore()
  
  // Mock vault data loading - in real implementation, fetch from contracts
  useEffect(() => {
    if (isConnected && address) {
      setLoading(true)
      
      // Simulate API call
      setTimeout(() => {
        // Mock vault data
        setVault({
          collateralS: BigInt('5000000000000000000'), // 5 S
          collateralStS: BigInt('3000000000000000000'), // 3 stS
          debt: BigInt('8000000000000000000000'), // 8000 eSUSD
          collateralValue: BigInt('16600000000000000000000'), // $16,600
          ltv: 48.2, // 48.2%
          healthFactor: 155.8,
          maxMintable: BigInt('2666666666666666666666'), // ~2666 eSUSD
        })
        setLoading(false)
      }, 1000)
    } else {
      setVault(null)
    }
  }, [isConnected, address, setVault, setLoading])
  
  const handleDeposit = async (amount: string, isStS: boolean) => {
    console.log('Deposit:', amount, isStS ? 'stS' : 'S')
    // In real implementation: call VaultManager.depositCollateral
    alert(`Depositing ${amount} ${isStS ? 'stS' : 'S'}`)
  }
  
  const handleMint = async (amount: string) => {
    console.log('Mint:', amount, 'eSUSD')
    // In real implementation: call VaultManager.mintStable
    alert(`Minting ${amount} eSUSD`)
  }
  
  const handleWithdraw = async (amount: string, isStS: boolean) => {
    console.log('Withdraw:', amount, isStS ? 'stS' : 'S')
    // In real implementation: call VaultManager.withdrawCollateral
    alert(`Withdrawing ${amount} ${isStS ? 'stS' : 'S'}`)
  }
  
  const handleRepay = async (amount: string) => {
    console.log('Repay:', amount, 'eSUSD')
    // In real implementation: call VaultManager.burnStable
    alert(`Repaying ${amount} eSUSD`)
  }
  
  const handleLiquidate = async (userAddress: string) => {
    console.log('Liquidate:', userAddress)
    // In real implementation: call VaultManager.liquidate
    alert(`Liquidating ${userAddress}`)
  }
  
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
      {isConnected && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Liquidation Opportunities</h2>
          <LiquidationList onLiquidate={handleLiquidate} />
        </div>
      )}
      
      {/* Modals */}
      <CollateralModal
        isOpen={isCollateralModalOpen}
        onClose={() => setIsCollateralModalOpen(false)}
        onDeposit={handleDeposit}
      />
      
      <MintModal
        isOpen={isMintModalOpen}
        onClose={() => setIsMintModalOpen(false)}
        onMint={handleMint}
      />
      
      {/* TODO: Add WithdrawModal and RepayModal components */}
    </div>
  )
}