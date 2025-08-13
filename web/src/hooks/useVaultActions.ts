import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseUnits } from 'viem'
import { contractAddresses } from '../contracts/addresses'
import { VAULT_MANAGER_ABI, ERC20_ABI } from '../contracts/abis'

export function useVaultActions() {
  const { writeContract, data: hash, error, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const depositCollateral = async (amount: string, isStS: boolean) => {
    const tokenAddress = isStS ? contractAddresses.stSToken : contractAddresses.sToken
    const amountWei = parseUnits(amount, 18)

    try {
      // First approve the VaultManager to spend tokens
      writeContract({
        address: tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [contractAddresses.vaultManager, amountWei],
      })
    } catch (error) {
      console.error('Approval failed:', error)
      throw error
    }
  }

  const withdrawCollateral = async (amount: string, isStS: boolean) => {
    const amountWei = parseUnits(amount, 18)
    
    writeContract({
      address: contractAddresses.vaultManager as `0x${string}`,
      abi: VAULT_MANAGER_ABI,
      functionName: 'withdrawCollateral',
      args: [amountWei, isStS],
    })
  }

  const mintStable = async (amount: string) => {
    const amountWei = parseUnits(amount, 18)
    
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
      // First approve the VaultManager to spend eSUSD
      writeContract({
        address: contractAddresses.stablecoin as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [contractAddresses.vaultManager, amountWei],
      })
    } catch (error) {
      console.error('Approval failed:', error)
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
  }
}