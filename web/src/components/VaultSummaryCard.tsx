import { useAccount } from 'wagmi'
import { Plus, Minus, DollarSign, ArrowUpCircle } from 'lucide-react'
import HealthFactorBar from './HealthFactorBar'
import { useVaultStore } from '../store/vaultStore'

interface VaultSummaryCardProps {
  onDepositClick: () => void
  onWithdrawClick: () => void
  onMintClick: () => void
  onRepayClick: () => void
}

export default function VaultSummaryCard({ 
  onDepositClick, 
  onWithdrawClick, 
  onMintClick, 
  onRepayClick 
}: VaultSummaryCardProps) {
  const { isConnected } = useAccount()
  const { vault, isLoading, error } = useVaultStore()
  
  if (!isConnected) {
    return (
      <div className="card text-center">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-brand-gray">Connect Wallet</h2>
          <p className="text-brand-gray/70">Connect your wallet using the button in the header to access your vault</p>
        </div>
      </div>
    )
  }
  
  if (isLoading) {
    return (
      <div className="card">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-brand-ink/20 rounded w-1/3"></div>
          <div className="space-y-2">
            <div className="h-4 bg-brand-ink/20 rounded"></div>
            <div className="h-4 bg-brand-ink/20 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="card">
        <div className="text-center text-red-600">
          <p>Error loading vault data: {error}</p>
        </div>
      </div>
    )
  }
  
  if (!vault) {
    return (
      <div className="card text-center">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-brand-gray">No Vault Found</h2>
          <p className="text-brand-gray/70">Deposit collateral to create your vault</p>
          <button onClick={onDepositClick} className="btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            Deposit Collateral
          </button>
        </div>
      </div>
    )
  }
  
  const formatAmount = (amount: bigint, decimals: number = 18) => {
    const value = Number(amount) / Math.pow(10, decimals)
    return value.toLocaleString(undefined, { maximumFractionDigits: 4 })
  }
  
  const formatUSD = (amount: bigint, decimals: number = 18) => {
    const value = Number(amount) / Math.pow(10, decimals)
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value)
  }
  
  return (
    <div className="card">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-brand-gray">Your Vault</h2>
        </div>
        
        {/* Vault Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-brand-gray/70">Total Collateral</p>
            <p className="text-lg font-semibold text-brand-gray">{formatUSD(vault.collateralValue)}</p>
            <div className="text-xs text-brand-gray/60 space-y-1">
              {vault.collateralS > 0n && (
                <div>S: {formatAmount(vault.collateralS)}</div>
              )}
              {vault.collateralStS > 0n && (
                <div>stS: {formatAmount(vault.collateralStS)}</div>
              )}
            </div>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm text-brand-gray/70">eSUSD Debt</p>
            <p className="text-lg font-semibold text-brand-gray">{formatAmount(vault.debt)} eSUSD</p>
            <p className="text-xs text-brand-gray/60">LTV: {vault.ltv.toFixed(1)}%</p>
          </div>
        </div>
        
        {/* Health Factor */}
        {vault.debt > 0n && (
          <HealthFactorBar healthFactor={vault.healthFactor} />
        )}
        
        {/* Max Mintable */}
        {vault.maxMintable > 0n && (
          <div className="bg-gradient-to-r from-brand-highlight/25 to-brand-primary/25 border border-brand-highlight/30 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-brand-primary font-medium">Available to Mint</p>
                <p className="text-lg font-semibold text-brand-accent">
                  {formatAmount(vault.maxMintable)} eSUSD
                </p>
              </div>
              <ArrowUpCircle className="w-6 h-6 text-brand-primary" />
            </div>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button onClick={onDepositClick} className="btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            Deposit
          </button>
          
          <button 
            onClick={onWithdrawClick} 
            className="btn-secondary"
            disabled={vault.collateralS === 0n && vault.collateralStS === 0n}
          >
            <Minus className="w-4 h-4 mr-2" />
            Withdraw
          </button>
          
          <button 
            onClick={onMintClick} 
            className="btn-primary"
            disabled={vault.maxMintable === 0n}
          >
            <DollarSign className="w-4 h-4 mr-2" />
            Mint eSUSD
          </button>
          
          <button 
            onClick={onRepayClick} 
            className="btn-secondary"
            disabled={vault.debt === 0n}
          >
            <ArrowUpCircle className="w-4 h-4 mr-2" />
            Repay
          </button>
        </div>
      </div>
    </div>
  )
}