import { useState } from 'react'
import { X, DollarSign } from 'lucide-react'
import { useVaultStore } from '../store/vaultStore'

interface MintModalProps {
  isOpen: boolean
  onClose: () => void
  onMint: (amount: string) => void
}

export default function MintModal({ isOpen, onClose, onMint }: MintModalProps) {
  const [amount, setAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { vault } = useVaultStore()
  
  if (!isOpen || !vault) return null
  
  const maxMintable = Number(vault.maxMintable) / Math.pow(10, 18)
  
  const handleMaxClick = () => {
    setAmount(maxMintable.toString())
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || parseFloat(amount) <= 0) return
    
    setIsLoading(true)
    try {
      await onMint(amount)
      onClose()
      setAmount('')
    } catch (error) {
      console.error('Mint failed:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  const newLTV = vault && amount ? 
    ((Number(vault.debt) + parseFloat(amount) * Math.pow(10, 18)) * 100) / Number(vault.collateralValue) : 
    vault.ltv
  
  const newHealthFactor = newLTV > 0 ? (150 * 100) / newLTV : vault.healthFactor
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Mint eSUSD</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Amount Input */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
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
                    className="text-xs text-sonic-600 hover:text-sonic-700 font-medium"
                  >
                    MAX
                  </button>
                  <span className="text-sm text-gray-500">eSUSD</span>
                </div>
              </div>
              
              <div className="flex justify-between text-sm text-gray-600">
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
                <span className="text-gray-600">Current Health Factor</span>
                <span className="font-medium">{vault.healthFactor.toFixed(1)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">New Health Factor</span>
                <span className={`font-medium ${newHealthFactor < 120 ? 'text-red-600' : newHealthFactor < 150 ? 'text-yellow-600' : 'text-green-600'}`}>
                  {newHealthFactor.toFixed(1)}
                </span>
              </div>
            </div>
          )}
          
          {/* Warning */}
          {newHealthFactor < 130 && amount && parseFloat(amount) > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="text-sm text-yellow-800">
                <div className="font-medium">⚠️ Warning</div>
                <div>Your health factor will be low. Consider minting less to avoid liquidation risk.</div>
              </div>
            </div>
          )}
          
          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="text-sm text-blue-800">
              <div className="font-medium">ℹ️ About eSUSD</div>
              <div>eSUSD is a collateral-backed stablecoin pegged to $1 USD. Interest-free borrowing powered by staking rewards.</div>
            </div>
          </div>
          
          {/* Submit Button */}
          <button
            type="submit"
            disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > maxMintable || isLoading}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
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
        </form>
      </div>
    </div>
  )
}