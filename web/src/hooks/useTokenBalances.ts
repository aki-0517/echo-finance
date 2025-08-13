import { useAccount, useReadContracts } from 'wagmi'
import { contractAddresses } from '../contracts/addresses'
import { ERC20_ABI } from '../contracts/abis'

export function useTokenBalances() {
  const { address } = useAccount()

  const { data, error, isLoading } = useReadContracts({
    contracts: [
      {
        address: contractAddresses.sToken as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [address!],
      },
      {
        address: contractAddresses.stSToken as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [address!],
      },
      {
        address: contractAddresses.stablecoin as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [address!],
      },
    ],
    query: {
      enabled: !!address && !!contractAddresses.sToken,
    },
  })

  const [sBalance, stSBalance, eSUSDBalance] = data?.map(result => result.result || BigInt(0)) || [BigInt(0), BigInt(0), BigInt(0)]

  return {
    sBalance: sBalance as bigint,
    stSBalance: stSBalance as bigint,
    eSUSDBalance: eSUSDBalance as bigint,
    isLoading,
    error,
  }
}