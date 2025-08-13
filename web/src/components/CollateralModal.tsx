import { useState } from 'react'
import { X, Plus } from 'lucide-react'
import { useAccount, useBalance } from 'wagmi'

interface CollateralModalProps {
  isOpen: boolean
  onClose: () => void
  onDeposit: (amount: string, isStS: boolean) => void
}

export default function CollateralModal({ isOpen, onClose, onDeposit }: CollateralModalProps) {
  const [amount, setAmount] = useState('')
  const [selectedToken, setSelectedToken] = useState<'S' | 'stS'>('S')
  const [isLoading, setIsLoading] = useState(false)
  const { address } = useAccount()
  
  // Mock balances - in real implementation, fetch actual token balances
  const sBalance = useBalance({ address, token: undefined }) // S token balance
  const stSBalance = { data: { formatted: '0', symbol: 'stS' } } // stS token balance
  
  if (!isOpen) return null
  
  const handleMaxClick = () => {
    const balance = selectedToken === 'S' ? sBalance.data?.formatted || '0' : stSBalance.data?.formatted || '0'
    setAmount(balance)
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || parseFloat(amount) <= 0) return
    
    setIsLoading(true)
    try {
      await onDeposit(amount, selectedToken === 'stS')
      onClose()
      setAmount('')
    } catch (error) {
      console.error('Deposit failed:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  const currentBalance = selectedToken === 'S' 
    ? sBalance.data?.formatted || '0' 
    : stSBalance.data?.formatted || '0'
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Deposit Collateral</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Token Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Select Token
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedToken('S')}
                className={`p-3 rounded-lg border-2 text-center font-medium transition-colors ${
                  selectedToken === 'S'
                    ? 'border-sonic-500 bg-sonic-50 text-sonic-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-lg">S</div>
                <div className="text-xs text-gray-500">Sonic</div>
              </button>
              
              <button
                type="button"
                onClick={() => setSelectedToken('stS')}
                className={`p-3 rounded-lg border-2 text-center font-medium transition-colors ${
                  selectedToken === 'stS'
                    ? 'border-sonic-500 bg-sonic-50 text-sonic-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-lg">stS</div>
                <div className="text-xs text-gray-500">Staked Sonic</div>
              </button>
            </div>
          </div>
          
          {/* Amount Input */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
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
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handleMaxClick}
                    className="text-xs text-sonic-600 hover:text-sonic-700 font-medium"
                  >
                    MAX
                  </button>
                  <span className="text-sm text-gray-500">{selectedToken}</span>
                </div>
              </div>
              
              <div className="flex justify-between text-sm text-gray-600">
                <span>Balance: {parseFloat(currentBalance).toFixed(6)} {selectedToken}</span>
                {amount && (
                  <span>
                    ≈ ${(parseFloat(amount) * (selectedToken === 'S' ? 2000 : 2200)).toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {/* Benefits Info */}
          {selectedToken === 'stS' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="text-sm text-green-800">
                <div className="font-medium">✨ stS Benefits</div>
                <div>Higher collateral efficiency due to staking rewards (~10% APY)</div>
              </div>
            </div>
          )}
          
          {/* Submit Button */}
          <button
            type="submit"
            disabled={!amount || parseFloat(amount) <= 0 || isLoading}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Depositing...
              </div>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Deposit {selectedToken}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}