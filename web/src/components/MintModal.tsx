import React, { useState } from 'react'
import { X, DollarSign } from 'lucide-react'
import { formatUnits } from 'viem'
import { useVaultStore } from '../store/vaultStore'
import { useVaultActions } from '../hooks/useVaultActions'

interface MintModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function MintModal({ isOpen, onClose }: MintModalProps) {
  const [amount, setAmount] = useState('')
  const { vault } = useVaultStore()
  const { mintStable, isPending, isSuccess, error } = useVaultActions()
  
  // Close modal on successful transaction
  React.useEffect(() => {
    if (isSuccess) {
      onClose()
      setAmount('')
    }
  }, [isSuccess, onClose])
  
  if (!isOpen || !vault) return null
  
  const maxMintable = parseFloat(formatUnits(vault.maxMintable, 18))
  
  const handleMaxClick = () => {
    setAmount(maxMintable.toString())
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || parseFloat(amount) <= 0) return
    
    try {
      await mintStable(amount)
    } catch (error) {
      console.error('Mint failed:', error)
    }
  }
  
  const newLTV = vault && amount ? 
    ((Number(vault.debt) + parseFloat(amount) * Math.pow(10, 18)) * 100) / Number(vault.collateralValue) : 
    vault.ltv
  
  const newHealthFactor = newLTV > 0 ? (150 * 100) / newLTV : vault.healthFactor
  
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-white/10 backdrop-blur-xl rounded-xl shadow-xl max-w-md w-full border border-white/10">
        <div className="flex justify-between items-center p-6 border-b border-white/10">
          <h2 className="text-xl font-semibold text-brand-gray">Mint eSUSD</h2>
          <button onClick={onClose} className="text-brand-gray/60 hover:text-brand-gray">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Amount Input */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-brand-gray/80">
              Amount to Mint
            </label>
            <div className="space-y-2">
              <div className="relative">
                <input
                  type="number"
                  step="0.000001"
                  placeholder="0.0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="input-field pr-24"
                  required
                  max={maxMintable}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handleMaxClick}
                    className="text-xs text-brand-primary hover:text-brand-accent font-medium"
                  >
                    MAX
                  </button>
                  <span className="text-sm text-brand-gray/60">eSUSD</span>
                </div>
              </div>
              
              <div className="flex justify-between text-sm text-brand-gray/70">
                <span>Max Mintable: {maxMintable.toFixed(6)} eSUSD</span>
                {amount && (
                  <span>New LTV: {newLTV.toFixed(1)}%</span>
                )}
              </div>
            </div>
          </div>
          
          {/* Health Factor Preview */}
          {amount && parseFloat(amount) > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-brand-gray/70">Current Health Factor</span>
                <span className="font-medium">{vault.healthFactor.toFixed(1)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-brand-gray/70">New Health Factor</span>
                <span className={`font-medium ${newHealthFactor < 120 ? 'text-red-600' : newHealthFactor < 150 ? 'text-yellow-600' : 'text-green-600'}`}>
                  {newHealthFactor.toFixed(1)}
                </span>
              </div>
            </div>
          )}
          
          {/* Warning */}
          {newHealthFactor < 130 && amount && parseFloat(amount) > 0 && (
            <div className="bg-brand-highlight/15 border border-brand-highlight/30 rounded-lg p-3">
              <div className="text-sm text-brand-primary">
                <div className="font-medium">⚠️ Warning</div>
                <div>Your health factor will be low. Consider minting less to avoid liquidation risk.</div>
              </div>
            </div>
          )}
          
          {/* Info */}
          <div className="bg-gradient-to-r from-brand-highlight/25 to-brand-primary/25 border border-brand-highlight/30 rounded-lg p-3">
            <div className="text-sm text-brand-primary">
              <div className="font-medium">ℹ️ About eSUSD</div>
              <div>eSUSD is a collateral-backed stablecoin pegged to $1 USD. Interest-free borrowing powered by staking rewards.</div>
            </div>
          </div>
          
          {/* Submit Button */}
          <button
            type="submit"
            disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > maxMintable || isPending}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Minting...
              </div>
            ) : (
              <>
                <DollarSign className="w-4 h-4 mr-2" />
                Mint {amount || '0'} eSUSD
              </>
            )}
          </button>
          
          {error && (
            <div className="text-red-600 text-sm text-center mt-2">
              Transaction failed. Please try again.
            </div>
          )}
        </form>
      </div>
    </div>
  )
}