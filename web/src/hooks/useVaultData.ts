import { useEffect } from 'react'
import { useAccount, useReadContract, useReadContracts } from 'wagmi'
import { contractAddresses } from '../contracts/addresses'
import { VAULT_MANAGER_ABI } from '../contracts/abis'
import { useVaultStore } from '../store/vaultStore'

export function useVaultData() {
  const { address, isConnected } = useAccount()
  const { setVault, setLoading, setError, clearVault } = useVaultStore()

  // Read vault data
  const { data: vaultData, error: vaultError, isLoading: vaultLoading } = useReadContract({
    address: contractAddresses.vaultManager as `0x${string}`,
    abi: VAULT_MANAGER_ABI,
    functionName: 'vaults',
    args: [address!],
    query: {
      enabled: !!address && !!contractAddresses.vaultManager,
    },
  })

  // Read additional vault metrics
  const { data: metricsData, error: metricsError, isLoading: metricsLoading } = useReadContracts({
    contracts: [
      {
        address: contractAddresses.vaultManager as `0x${string}`,
        abi: VAULT_MANAGER_ABI,
        functionName: 'getCollateralValue',
        args: [address!],
      },
      {
        address: contractAddresses.vaultManager as `0x${string}`,
        abi: VAULT_MANAGER_ABI,
        functionName: 'getLTV',
        args: [address!],
      },
      {
        address: contractAddresses.vaultManager as `0x${string}`,
        abi: VAULT_MANAGER_ABI,
        functionName: 'getHealthFactor',
        args: [address!],
      },
      {
        address: contractAddresses.vaultManager as `0x${string}`,
        abi: VAULT_MANAGER_ABI,
        functionName: 'getMaxMintable',
        args: [address!],
      },
    ],
    query: {
      enabled: !!address && !!contractAddresses.vaultManager,
    },
  })

  useEffect(() => {
    if (!isConnected || !address) {
      clearVault()
      return
    }

    setLoading(vaultLoading || metricsLoading)

    if (vaultError || metricsError) {
      setError(vaultError?.message || metricsError?.message || 'Failed to load vault data')
      return
    }

    if (vaultData && metricsData) {
      const [collateralS, collateralStS, debt] = vaultData
      // 全メトリクスの取得に失敗したらエラーにする（0 へフォールバックしない）
      const results = metricsData as Array<{ status: 'success' | 'failure'; result?: bigint }>
      const hasFailure = results.some(r => r.status !== 'success')
      if (hasFailure) {
        setError('Price feed unavailable or stale')
        return
      }
      const [collateralValue, ltv, healthFactor, maxMintable] = results.map(r => r.result as bigint)

      setVault({
        collateralS: collateralS || BigInt(0),
        collateralStS: collateralStS || BigInt(0),
        debt: debt || BigInt(0),
        collateralValue: collateralValue as bigint,
        ltv: Number(ltv) / 100, // Convert from basis points to percentage
        healthFactor: Number(healthFactor) / 100, // Convert from basis points 
        maxMintable: maxMintable as bigint,
      })
    }
  }, [
    isConnected,
    address,
    vaultData,
    metricsData,
    vaultError,
    metricsError,
    vaultLoading,
    metricsLoading,
    setVault,
    setLoading,
    setError,
    clearVault,
  ])

  return {
    isLoading: vaultLoading || metricsLoading,
    error: vaultError || metricsError,
  }
}