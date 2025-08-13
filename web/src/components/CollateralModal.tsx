import React, { useState } from 'react'
import { X, Plus } from 'lucide-react'
import { formatUnits } from 'viem'
import { useTokenBalances } from '../hooks/useTokenBalances'
import { useVaultActions } from '../hooks/useVaultActions'
import TransactionProgress from './TransactionProgress'

interface CollateralModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function CollateralModal({ isOpen, onClose }: CollateralModalProps) {
  const [amount, setAmount] = useState('')
  const [selectedToken, setSelectedToken] = useState<'S' | 'stS'>('S')
  const [showProgress, setShowProgress] = useState(false)
  const { sBalance, stSBalance } = useTokenBalances()
  const { depositCollateral, isPending, isSuccess, error, currentAction, transactionHashes } = useVaultActions()
  
  // Handle transaction progress
  React.useEffect(() => {
    // Show progress modal when transaction starts
    if (currentAction.type === 'approve' && isPending) {
      setShowProgress(true)
    }
    
    // Close everything when transaction completes successfully
    if (isSuccess && currentAction.type === 'deposit') {
      setTimeout(() => {
        setShowProgress(false)
        onClose()
        setAmount('')
      }, 2000) // Show success for 2 seconds
    }
  }, [currentAction, isPending, isSuccess, onClose])

  // Prepare transaction steps
  const getTransactionSteps = () => {
    const approveStatus = 
      currentAction.type === 'approve' && isPending ? 'in-progress' :
      currentAction.type === 'deposit' || (currentAction.type === 'approve' && isSuccess) ? 'completed' :
      error ? 'failed' : 'pending'
    
    const depositStatus = 
      currentAction.type === 'deposit' && isPending ? 'in-progress' :
      currentAction.type === 'deposit' && isSuccess ? 'completed' :
      currentAction.type === 'deposit' && error ? 'failed' : 'pending'

    return [
      {
        id: 'approve',
        title: 'Approve',
        description: `Approving ${selectedToken} token usage...`,
        status: approveStatus as 'pending' | 'in-progress' | 'completed' | 'failed',
        txHash: transactionHashes.approve
      },
      {
        id: 'deposit',
        title: 'Deposit',
        description: 'Depositing collateral to vault...',
        status: depositStatus as 'pending' | 'in-progress' | 'completed' | 'failed',
        txHash: transactionHashes.deposit
      }
    ]
  }
  
  if (!isOpen) return null
  
  const handleMaxClick = () => {
    const balance = selectedToken === 'S' 
      ? formatUnits(sBalance, 18)
      : formatUnits(stSBalance, 18)
    setAmount(balance)
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || parseFloat(amount) <= 0) return
    
    try {
      await depositCollateral(amount, selectedToken === 'stS')
    } catch (error) {
      console.error('Deposit failed:', error)
      setShowProgress(false)
    }
  }
  
  const currentBalance = selectedToken === 'S' 
    ? formatUnits(sBalance, 18)
    : formatUnits(stSBalance, 18)
  
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
            disabled={!amount || parseFloat(amount) <= 0 || isPending}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? (
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
          
          {error && (
            <div className="text-red-600 text-sm text-center">
              Transaction failed. Please try again.
            </div>
          )}
        </form>
      </div>
      
      {/* Transaction Progress Modal */}
      <TransactionProgress
        isOpen={showProgress}
        onClose={() => {
          setShowProgress(false)
          onClose()
          setAmount('')
        }}
        steps={getTransactionSteps()}
        currentStepId={currentAction.type || 'approve'}
        title={`${selectedToken} Deposit`}
      />
    </div>
  )
}