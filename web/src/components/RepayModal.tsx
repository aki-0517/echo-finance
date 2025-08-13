import React, { useState } from 'react'
import { X, Minus } from 'lucide-react'
import { formatUnits } from 'viem'
import { useVaultStore } from '../store/vaultStore'
import { useVaultActions } from '../hooks/useVaultActions'
import { useTokenBalances } from '../hooks/useTokenBalances'
import TransactionProgress from './TransactionProgress'

interface RepayModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function RepayModal({ isOpen, onClose }: RepayModalProps) {
  const [amount, setAmount] = useState('')
  const [showProgress, setShowProgress] = useState(false)
  const { vault } = useVaultStore()
  const { burnStable, isPending, isSuccess, error, currentAction } = useVaultActions()
  const { eSUSDBalance } = useTokenBalances()
  
  // Handle transaction progress
  React.useEffect(() => {
    // Show progress modal when transaction starts
    if (currentAction.type === 'approve-burn' && isPending) {
      setShowProgress(true)
    }
    
    // Close everything when transaction completes successfully
    if (isSuccess && currentAction.type === 'burn') {
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
      currentAction.type === 'approve-burn' && isPending ? 'in-progress' :
      currentAction.type === 'burn' || (currentAction.type === 'approve-burn' && isSuccess) ? 'completed' :
      error ? 'failed' : 'pending'
    
    const burnStatus = 
      currentAction.type === 'burn' && isPending ? 'in-progress' :
      currentAction.type === 'burn' && isSuccess ? 'completed' :
      currentAction.type === 'burn' && error ? 'failed' : 'pending'

    return [
      {
        id: 'approve',
        title: 'Approve',
        description: 'Approving eSUSD token usage...',
        status: approveStatus as 'pending' | 'in-progress' | 'completed' | 'failed'
      },
      {
        id: 'burn',
        title: 'Repay',
        description: 'Burning eSUSD to repay debt...',
        status: burnStatus as 'pending' | 'in-progress' | 'completed' | 'failed'
      }
    ]
  }
  
  if (!isOpen || !vault) return null
  
  const currentDebt = parseFloat(formatUnits(vault.debt, 18))
  const eSUSDBalanceFormatted = parseFloat(formatUnits(eSUSDBalance, 18))
  const maxRepayable = Math.min(currentDebt, eSUSDBalanceFormatted)
  
  const handleMaxClick = () => {
    setAmount(maxRepayable.toString())
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || parseFloat(amount) <= 0) return
    
    try {
      await burnStable(amount)
    } catch (error) {
      console.error('Repay failed:', error)
      setShowProgress(false)
    }
  }
  
  const newDebt = amount ? Math.max(0, currentDebt - parseFloat(amount)) : currentDebt
  const newLTV = vault && newDebt > 0 ? 
    (newDebt * Math.pow(10, 18) * 100) / Number(vault.collateralValue) : 0
  const newHealthFactor = newLTV > 0 ? (150 * 100) / newLTV : Infinity
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Repay eSUSD</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Amount Input */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Amount to Repay
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
                  max={maxRepayable}
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
                <span>Balance: {eSUSDBalanceFormatted.toFixed(6)} eSUSD</span>
                <span>Debt: {currentDebt.toFixed(6)} eSUSD</span>
              </div>
            </div>
          </div>
          
          {/* Debt Preview */}
          {amount && parseFloat(amount) > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Current Debt</span>
                <span className="font-medium">{currentDebt.toFixed(6)} eSUSD</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">New Debt</span>
                <span className="font-medium text-green-600">{newDebt.toFixed(6)} eSUSD</span>
              </div>
              {newDebt > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">New Health Factor</span>
                  <span className={`font-medium ${newHealthFactor < 120 ? 'text-red-600' : newHealthFactor < 150 ? 'text-yellow-600' : 'text-green-600'}`}>
                    {newHealthFactor === Infinity ? '∞' : newHealthFactor.toFixed(1)}
                  </span>
                </div>
              )}
            </div>
          )}
          
          {/* Full Repayment Notice */}
          {amount && parseFloat(amount) >= currentDebt && currentDebt > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="text-sm text-green-800">
                <div className="font-medium">✅ Full Repayment</div>
                <div>You will fully repay your debt and can withdraw all collateral.</div>
              </div>
            </div>
          )}
          
          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="text-sm text-blue-800">
              <div className="font-medium">ℹ️ About Repaying</div>
              <div>Repaying eSUSD reduces your debt and improves your health factor. Fully repaying allows collateral withdrawal.</div>
            </div>
          </div>
          
          {/* Submit Button */}
          <button
            type="submit"
            disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > maxRepayable || isPending}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Repaying...
              </div>
            ) : (
              <>
                <Minus className="w-4 h-4 mr-2" />
                Repay {amount || '0'} eSUSD
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
        title="eSUSD Repay"
      />
    </div>
  )
}