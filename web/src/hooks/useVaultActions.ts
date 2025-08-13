import React, { useState } from 'react'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseUnits } from 'viem'
import { contractAddresses } from '../contracts/addresses'
import { VAULT_MANAGER_ABI, ERC20_ABI } from '../contracts/abis'

export function useVaultActions() {
  const { writeContract, data: hash, error, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })
  
  const [currentAction, setCurrentAction] = useState<{
    type: 'approve' | 'approve-burn' | 'deposit' | 'burn' | 'mint' | 'withdraw' | null
    data?: any
  }>({ type: null })
  
  const [transactionHashes, setTransactionHashes] = useState<{
    approve?: string
    deposit?: string
    burn?: string
    mint?: string
    withdraw?: string
  }>({})

  // Save transaction hash when success
  React.useEffect(() => {
    if (isSuccess && hash) {
      if (currentAction.type === 'approve') {
        setTransactionHashes(prev => ({ ...prev, approve: hash }))
      } else if (currentAction.type === 'deposit') {
        setTransactionHashes(prev => ({ ...prev, deposit: hash }))
      } else if (currentAction.type === 'approve-burn') {
        setTransactionHashes(prev => ({ ...prev, approve: hash }))
      } else if (currentAction.type === 'burn') {
        setTransactionHashes(prev => ({ ...prev, burn: hash }))
      } else {
        // For single transactions like mint, withdraw, liquidate
        const actionType = currentAction.type || 'transaction'
        setTransactionHashes(prev => ({ ...prev, [actionType]: hash }))
      }
    }
  }, [isSuccess, hash, currentAction.type])

  // Handle two-step transactions (approve then deposit)
  React.useEffect(() => {
    if (isSuccess && currentAction.type === 'approve' && currentAction.data) {
      const { amount, isStS } = currentAction.data
      const amountWei = parseUnits(amount, 18)
      
      // After approval succeeds, execute the deposit
      setCurrentAction({ type: 'deposit' })
      writeContract({
        address: contractAddresses.vaultManager as `0x${string}`,
        abi: VAULT_MANAGER_ABI,
        functionName: 'depositCollateral',
        args: [amountWei, isStS],
      })
    }
    
    if (isSuccess && currentAction.type === 'approve-burn' && currentAction.data) {
      const { amount } = currentAction.data
      const amountWei = parseUnits(amount, 18)
      
      // After approval succeeds, execute the burn
      setCurrentAction({ type: 'burn' })
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