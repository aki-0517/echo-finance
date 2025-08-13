import { useState, useEffect } from 'react'
import { useReadContract } from 'wagmi'
import { formatUnits } from 'viem'
import { contractAddresses } from '../contracts/addresses'
import { VAULT_MANAGER_ABI } from '../contracts/abis'

interface ProtocolStats {
  totalValueLocked: string
  totalESUSDMinted: string
  isLoading: boolean
  error: string | null
}

export function useProtocolStats(): ProtocolStats {
  const [stats, setStats] = useState<ProtocolStats>({
    totalValueLocked: '0',
    totalESUSDMinted: '0',
    isLoading: true,
    error: null
  })

  // Fetch total collateral value (TVL)
  const { data: totalCollateralValue, isLoading: isLoadingTVL, error: tvlError } = useReadContract({
    address: contractAddresses.vaultManager as `0x${string}`,
    abi: VAULT_MANAGER_ABI,
    functionName: 'getTotalCollateralValue',
    query: {
      enabled: !!contractAddresses.vaultManager,
      refetchInterval: 30000, // Refresh every 30 seconds
    }
  })

  // Fetch total eSUSD minted (stablecoin total supply)
  const { data: totalSupply, isLoading: isLoadingSupply, error: supplyError } = useReadContract({
    address: contractAddresses.stablecoin as `0x${string}`,
    abi: [
      {
        "type": "function",
        "name": "totalSupply",
        "inputs": [],
        "outputs": [{"name": "", "type": "uint256"}],
        "stateMutability": "view"
      }
    ] as const,
    functionName: 'totalSupply',
    query: {
      enabled: !!contractAddresses.stablecoin,
      refetchInterval: 30000, // Refresh every 30 seconds
    }
  })

  useEffect(() => {
    const isLoading = isLoadingTVL || isLoadingSupply
    const error = tvlError?.message || supplyError?.message || null

    if (!isLoading && !error) {
      const tvlValue = totalCollateralValue ? Number(formatUnits(BigInt(totalCollateralValue.toString()), 18)) : 0
      const tvlFormatted = tvlValue > 0
        ? `$${tvlValue.toLocaleString('en-US', { 
            minimumFractionDigits: 0, 
            maximumFractionDigits: 1 
          })}${tvlValue >= 1000000 ? 'M' : tvlValue >= 1000 ? 'K' : ''}`
        : '$0'

      const supplyValue = totalSupply ? Number(formatUnits(BigInt(totalSupply.toString()), 18)) : 0
      const supplyFormatted = supplyValue > 0
        ? `${supplyValue.toLocaleString('en-US', { 
            minimumFractionDigits: 0, 
            maximumFractionDigits: 1 
          })}${supplyValue >= 1000000 ? 'M' : supplyValue >= 1000 ? 'K' : ''} eSUSD`
        : '0 eSUSD'

      setStats({
        totalValueLocked: tvlFormatted,
        totalESUSDMinted: supplyFormatted,
        isLoading: false,
        error: null
      })
    } else {
      setStats(prev => ({
        ...prev,
        isLoading,
        error
      }))
    }
  }, [totalCollateralValue, totalSupply, isLoadingTVL, isLoadingSupply, tvlError, supplyError])

  return stats
}