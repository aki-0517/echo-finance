import React, { useState } from 'react'
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi'
import { parseUnits } from 'viem'
import { contractAddresses } from '../contracts/addresses'
import { VAULT_MANAGER_ABI, ERC20_ABI } from '../contracts/abis'

interface ActivityItem {
  id: string
  type: 'deposit' | 'withdraw' | 'mint' | 'repay' | 'liquidation'
  amount: string
  token: string
  timestamp: Date
  txHash: string
  isPending?: boolean
}

// Helper functions for optimistic updates
const ACTIVITY_STORAGE_KEY = 'lybra_pending_activities'

const addPendingActivity = (activity: ActivityItem) => {
  const stored = localStorage.getItem(ACTIVITY_STORAGE_KEY)
  const activities = stored ? JSON.parse(stored) : []
  activities.unshift(activity)
  localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(activities.slice(0, 10)))
}

const updatePendingActivity = (txHash: string, isComplete: boolean) => {
  const stored = localStorage.getItem(ACTIVITY_STORAGE_KEY)
  if (!stored) return
  
  const activities = JSON.parse(stored) as ActivityItem[]
  const updated = activities.map(activity => 
    activity.txHash === txHash 
      ? { ...activity, isPending: !isComplete }
      : activity
  )
  
  // Remove completed activities after a delay (they'll be picked up by event fetching)
  if (isComplete) {
    setTimeout(() => {
      const current = localStorage.getItem(ACTIVITY_STORAGE_KEY)
      if (current) {
        const filtered = JSON.parse(current).filter((a: ActivityItem) => 
          a.txHash !== txHash || a.isPending
        )
        localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(filtered))
      }
    }, 5000) // Remove after 5 seconds to allow event fetching to take over
  }
  
  localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(updated))
}

export function useVaultActions() {
  const { address } = useAccount()
  const { writeContract, data: hash, error, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })
  
  const [currentAction, setCurrentAction] = useState<{
    type: 'approve' | 'approve-burn' | 'deposit' | 'burn' | 'mint' | 'withdraw' | null
    data?: {
      amount?: string
      isStS?: boolean
    }
  }>({ type: null })
  
  const [transactionHashes, setTransactionHashes] = useState<{
    approve?: string
    deposit?: string
    burn?: string
    mint?: string
    withdraw?: string
  }>({})

  // Save transaction hash when success and update optimistic activities
  React.useEffect(() => {
    if (isSuccess && hash) {
      if (currentAction.type === 'approve') {
        setTransactionHashes(prev => ({ ...prev, approve: hash }))
      } else if (currentAction.type === 'deposit') {
        setTransactionHashes(prev => ({ ...prev, deposit: hash }))
        updatePendingActivity(hash, true)
      } else if (currentAction.type === 'approve-burn') {
        setTransactionHashes(prev => ({ ...prev, approve: hash }))
      } else if (currentAction.type === 'burn') {
        setTransactionHashes(prev => ({ ...prev, burn: hash }))
        updatePendingActivity(hash, true)
      } else {
        // For single transactions like mint, withdraw, liquidate
        const actionType = currentAction.type || 'transaction'
        setTransactionHashes(prev => ({ ...prev, [actionType]: hash }))
        if (hash && (currentAction.type === 'mint' || currentAction.type === 'withdraw')) {
          updatePendingActivity(hash, true)
        }
      }
    }
  }, [isSuccess, hash, currentAction.type])

  // Handle two-step transactions (approve then deposit)
  React.useEffect(() => {
    if (isSuccess && currentAction.type === 'approve' && currentAction.data?.amount && typeof currentAction.data.isStS === 'boolean') {
      const { amount, isStS } = currentAction.data
      const amountWei = parseUnits(amount, 18)
      
      // After approval succeeds, execute the deposit
      setCurrentAction({ type: 'deposit' })
      
      // Add optimistic activity for deposit
      if (address) {
        const tempTxHash = `temp-${Date.now()}-deposit`
        addPendingActivity({
          id: tempTxHash,
          type: 'deposit',
          amount,
          token: isStS ? 'stS' : 'S',
          timestamp: new Date(),
          txHash: tempTxHash,
          isPending: true
        })
      }
      
      writeContract({
        address: contractAddresses.vaultManager as `0x${string}`,
        abi: VAULT_MANAGER_ABI,
        functionName: 'depositCollateral',
        args: [amountWei, isStS],
      })
    }
    
    if (isSuccess && currentAction.type === 'approve-burn' && currentAction.data?.amount) {
      const { amount } = currentAction.data
      const amountWei = parseUnits(amount, 18)
      
      // After approval succeeds, execute the burn
      setCurrentAction({ type: 'burn' })
      
      // Add optimistic activity for burn
      if (address) {
        const tempTxHash = `temp-${Date.now()}-burn`
        addPendingActivity({
          id: tempTxHash,
          type: 'repay',
          amount,
          token: 'eSUSD',
          timestamp: new Date(),
          txHash: tempTxHash,
          isPending: true
        })
      }
      
      writeContract({
        address: contractAddresses.vaultManager as `0x${string}`,
        abi: VAULT_MANAGER_ABI,
        functionName: 'burnStable',
        args: [amountWei],
      })
    }
    
    if (isSuccess && (currentAction.type === 'deposit' || currentAction.type === 'burn' || currentAction.type === 'mint' || currentAction.type === 'withdraw')) {
      setCurrentAction({ type: null })
    }
  }, [isSuccess, currentAction, writeContract])

  const depositCollateral = async (amount: string, isStS: boolean) => {
    const tokenAddress = isStS ? contractAddresses.stSToken : contractAddresses.sToken
    const amountWei = parseUnits(amount, 18)

    try {
      // Reset transaction hashes for new transaction
      setTransactionHashes({})
      // Set current action to track the approve step
      setCurrentAction({ type: 'approve', data: { amount, isStS } })
      
      // First approve the VaultManager to spend tokens
      writeContract({
        address: tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [contractAddresses.vaultManager, amountWei],
      })
    } catch (error) {
      console.error('Approval failed:', error)
      setCurrentAction({ type: null })
      throw error
    }
  }

  const withdrawCollateral = async (amount: string, isStS: boolean) => {
    const amountWei = parseUnits(amount, 18)
    
    // Reset transaction hashes for new transaction
    setTransactionHashes({})
    setCurrentAction({ type: 'withdraw' })
    
    // Add optimistic activity for withdraw
    if (address) {
      const tempTxHash = `temp-${Date.now()}-withdraw`
      addPendingActivity({
        id: tempTxHash,
        type: 'withdraw',
        amount,
        token: isStS ? 'stS' : 'S',
        timestamp: new Date(),
        txHash: tempTxHash,
        isPending: true
      })
    }
    
    writeContract({
      address: contractAddresses.vaultManager as `0x${string}`,
      abi: VAULT_MANAGER_ABI,
      functionName: 'withdrawCollateral',
      args: [amountWei, isStS],
    })
  }

  const mintStable = async (amount: string) => {
    const amountWei = parseUnits(amount, 18)
    
    // Reset transaction hashes for new transaction
    setTransactionHashes({})
    setCurrentAction({ type: 'mint' })
    
    // Add optimistic activity for mint
    if (address) {
      const tempTxHash = `temp-${Date.now()}-mint`
      addPendingActivity({
        id: tempTxHash,
        type: 'mint',
        amount,
        token: 'eSUSD',
        timestamp: new Date(),
        txHash: tempTxHash,
        isPending: true
      })
    }
    
    writeContract({
      address: contractAddresses.vaultManager as `0x${string}`,
      abi: VAULT_MANAGER_ABI,
      functionName: 'mintStable',
      args: [amountWei],
    })
  }

  const burnStable = async (amount: string) => {
    const amountWei = parseUnits(amount, 18)

    try {
      // Reset transaction hashes for new transaction
      setTransactionHashes({})
      // Set current action to track the approve step for burn
      setCurrentAction({ type: 'approve-burn', data: { amount } })
      
      // First approve the VaultManager to spend eSUSD
      writeContract({
        address: contractAddresses.stablecoin as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [contractAddresses.vaultManager, amountWei],
      })
    } catch (error) {
      console.error('Approval failed:', error)
      setCurrentAction({ type: null })
      throw error
    }
  }

  const liquidateVault = async (userAddress: string) => {
    writeContract({
      address: contractAddresses.vaultManager as `0x${string}`,
      abi: VAULT_MANAGER_ABI,
      functionName: 'liquidate',
      args: [userAddress as `0x${string}`],
    })
  }

  return {
    depositCollateral,
    withdrawCollateral,
    mintStable,
    burnStable,
    liquidateVault,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
    hash,
    currentAction,
    transactionHashes,
  }
}