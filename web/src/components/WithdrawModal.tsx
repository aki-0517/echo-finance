import React, { useState } from 'react'
import { X, ArrowDown } from 'lucide-react'
import { formatUnits } from 'viem'
import { useVaultStore } from '../store/vaultStore'
import { useVaultActions } from '../hooks/useVaultActions'

interface WithdrawModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function WithdrawModal({ isOpen, onClose }: WithdrawModalProps) {
  const [amount, setAmount] = useState('')
  const [selectedToken, setSelectedToken] = useState<'S' | 'stS'>('S')
  const { vault } = useVaultStore()
  const { withdrawCollateral, isPending, isSuccess, error } = useVaultActions()
  
  // Close modal on successful transaction
  React.useEffect(() => {
    if (isSuccess) {
      onClose()
      setAmount('')
    }
  }, [isSuccess, onClose])
  
  if (!isOpen || !vault) return null
  
  const sCollateral = parseFloat(formatUnits(vault.collateralS, 18))
  const stSCollateral = parseFloat(formatUnits(vault.collateralStS, 18))
  const currentDebt = parseFloat(formatUnits(vault.debt, 18))
  
  const maxWithdrawable = selectedToken === 'S' ? sCollateral : stSCollateral
  
  const handleMaxClick = () => {
    if (currentDebt === 0) {
      // If no debt, can withdraw all collateral
      setAmount(maxWithdrawable.toString())
    } else {
      // Calculate max withdrawable while maintaining 150% collateral ratio
      const minCollateralValue = currentDebt * 1.5 // 150% MCR
      const currentCollateralValue = Number(vault.collateralValue) / Math.pow(10, 18)
      const tokenPrice = selectedToken === 'S' ? 2000 : 2200 // Mock prices
      const maxWithdrawValue = Math.max(0, currentCollateralValue - minCollateralValue)
      const maxWithdrawTokens = Math.min(maxWithdrawable, maxWithdrawValue / tokenPrice)
      setAmount(Math.max(0, maxWithdrawTokens).toString())
    }
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || parseFloat(amount) <= 0) return
    
    try {
      await withdrawCollateral(amount, selectedToken === 'stS')
    } catch (error) {
      console.error('Withdraw failed:', error)
    }
  }
  
  // Calculate new health factor after withdrawal
  const tokenPrice = selectedToken === 'S' ? 2000 : 2200
  const withdrawValue = amount ? parseFloat(amount) * tokenPrice : 0
  const newCollateralValue = Number(vault.collateralValue) / Math.pow(10, 18) - withdrawValue
  const newLTV = currentDebt > 0 && newCollateralValue > 0 ? (currentDebt * 100) / newCollateralValue : 0
  const newHealthFactor = newLTV > 0 ? (150 * 100) / newLTV : vault.healthFactor
  
  const canWithdraw = currentDebt === 0 || newHealthFactor >= 150
  
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-white/10 backdrop-blur-xl rounded-xl shadow-xl max-w-md w-full border border-white/10">
        <div className="flex justify-between items-center p-6 border-b border-white/10">
          <h2 className="text-xl font-semibold text-brand-gray">Withdraw Collateral</h2>
          <button onClick={onClose} className="text-brand-gray/60 hover:text-brand-gray">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Token Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-brand-gray/80">
              Select Token
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedToken('S')}
                className={`p-3 rounded-lg border-2 text-center font-medium transition-colors ${
                  selectedToken === 'S'
                    ? 'border-brand-highlight bg-white/10 text-brand-highlight'
                    : 'border-white/10 hover:border-white/20 text-brand-gray'
                }`}
              >
                <div className="text-lg">S</div>
                <div className="text-xs text-brand-gray/60">{sCollateral.toFixed(6)} available</div>
              </button>
              
              <button
                type="button"
                onClick={() => setSelectedToken('stS')}
                className={`p-3 rounded-lg border-2 text-center font-medium transition-colors ${
                  selectedToken === 'stS'
                    ? 'border-brand-highlight bg-white/10 text-brand-highlight'
                    : 'border-white/10 hover:border-white/20 text-brand-gray'
                }`}
              >
                <div className="text-lg">stS</div>
                <div className="text-xs text-brand-gray/60">{stSCollateral.toFixed(6)} available</div>
              </button>
            </div>
          </div>
          
          {/* Amount Input */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-brand-gray/80">
              Amount
            </label>
            <div className="space-y-2">
              <div className="relative">
                <input
                  type="number"
                  step="0.000001"
                  placeholder="0.0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="input-field pr-20"
                  required
                  max={maxWithdrawable}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handleMaxClick}
                    className="text-xs text-brand-primary hover:text-brand-accent font-medium"
                  >
                    MAX
                  </button>
                  <span className="text-sm text-brand-gray/60">{selectedToken}</span>
                </div>
              </div>
              
              <div className="flex justify-between text-sm text-brand-gray/70">
                <span>Available: {maxWithdrawable.toFixed(6)} {selectedToken}</span>
                {amount && (
                  <span>
                    ≈ ${(parseFloat(amount) * tokenPrice).toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {/* Health Factor Preview */}
          {amount && parseFloat(amount) > 0 && currentDebt > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-brand-gray/70">Current Health Factor</span>
                <span className="font-medium">{vault.healthFactor.toFixed(1)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-brand-gray/70">New Health Factor</span>
                <span className={`font-medium ${newHealthFactor < 120 ? 'text-red-600' : newHealthFactor < 150 ? 'text-yellow-600' : 'text-green-600'}`}>
                  {newHealthFactor === Infinity ? '∞' : newHealthFactor.toFixed(1)}
                </span>
              </div>
            </div>
          )}
          
          {/* Warning */}
          {!canWithdraw && amount && parseFloat(amount) > 0 && (
            <div className="bg-red-50/60 border border-red-200/60 rounded-lg p-3">
              <div className="text-sm text-red-500">
                <div className="font-medium">⚠️ Cannot Withdraw</div>
                <div>This withdrawal would put your health factor below 150%. Please reduce the amount or repay debt first.</div>
              </div>
            </div>
          )}
          
          {/* No Debt Notice */}
          {currentDebt === 0 && (
            <div className="bg-brand-highlight/15 border border-brand-highlight/30 rounded-lg p-3">
              <div className="text-sm text-brand-primary">
                <div className="font-medium">✅ No Debt</div>
                <div>You can withdraw all your collateral since you have no outstanding debt.</div>
              </div>
            </div>
          )}
          
          {/* Info */}
          <div className="bg-gradient-to-r from-brand-highlight/25 to-brand-primary/25 border border-brand-highlight/30 rounded-lg p-3">
            <div className="text-sm text-brand-primary">
              <div className="font-medium">ℹ️ About Withdrawing</div>
              <div>You can only withdraw collateral if it maintains a health factor above 150% or if you have no debt.</div>
            </div>
          </div>
          
          {/* Submit Button */}
          <button
            type="submit"
            disabled={!amount || parseFloat(amount) <= 0 || !canWithdraw || isPending || parseFloat(amount) > maxWithdrawable}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Withdrawing...
              </div>
            ) : (
              <>
                <ArrowDown className="w-4 h-4 mr-2" />
                Withdraw {selectedToken}
              </>
            )}
          </button>
          
          {error && (
            <div className="text-red-600 text-sm text-center">
              Transaction failed. Please try again.
            </div>
          )}
        </form>
      </div>
    </div>
  )
}