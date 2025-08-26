import { useState, useEffect } from 'react'
import { useAccount, usePublicClient, useWatchContractEvent } from 'wagmi'
import { formatUnits } from 'viem'
import { contractAddresses } from '../contracts/addresses'
import { VAULT_MANAGER_ABI } from '../contracts/abis'

interface ActivityItem {
  id: string
  type: 'deposit' | 'withdraw' | 'mint' | 'repay' | 'liquidation'
  amount: string
  token: string
  timestamp: Date
  txHash: string
}

interface RecentActivityData {
  activities: ActivityItem[]
  isLoading: boolean
  error: string | null
}

// const ACTIVITY_STORAGE_KEY = 'lybra_pending_activities' // Unused for now

export function useRecentActivity(): RecentActivityData {
  const { address, isConnected } = useAccount()
  const publicClient = usePublicClient()
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Helper function to get pending activities from localStorage
  const getPendingActivities = (): ActivityItem[] => {
    // Temporarily disabled to clear old test data
    return []
    
    /* Original implementation - uncomment when needed:
    try {
      const stored = localStorage.getItem(ACTIVITY_STORAGE_KEY)
      if (!stored) return []
      return JSON.parse(stored).map((activity: any) => ({
        ...activity,
        timestamp: new Date(activity.timestamp)
      }))
    } catch {
      return []
    }
    */
  }

  // Helper function to parse events into ActivityItems
  const parseEventToActivity = (log: Record<string, unknown>): ActivityItem | null => {
    try {
      const eventName = log.eventName as string
      const args = log.args as Record<string, unknown>
      const txHash = log.transactionHash as string
      
      // Create unique ID from tx hash and log index
      const id = `${txHash}-${log.logIndex}`
      
      // Use current timestamp for events - this should ideally be the actual block timestamp
      const timestamp = new Date()
      
      switch (eventName) {
        case 'CollateralDeposited':
          return {
            id,
            type: 'deposit',
            amount: formatUnits(args.amount as bigint, 18),
            token: args.isStS as boolean ? 'stS' : 'S',
            timestamp,
            txHash
          }
        case 'CollateralWithdrawn':
          return {
            id,
            type: 'withdraw',
            amount: formatUnits(args.amount as bigint, 18),
            token: args.isStS as boolean ? 'stS' : 'S',
            timestamp,
            txHash
          }
        case 'StableMinted':
          return {
            id,
            type: 'mint',
            amount: formatUnits(args.amount as bigint, 18),
            token: 'eSUSD',
            timestamp,
            txHash
          }
        case 'StableBurned':
          return {
            id,
            type: 'repay',
            amount: formatUnits(args.amount as bigint, 18),
            token: 'eSUSD',
            timestamp,
            txHash
          }
        case 'VaultLiquidated':
          return {
            id,
            type: 'liquidation',
            amount: formatUnits(args.collateralSeized as bigint, 18),
            token: 'Collateral',
            timestamp,
            txHash
          }
        default:
          return null
      }
    } catch (err) {
      console.error('Error parsing event:', err)
      return null
    }
  }

  // Fetch historical events
  useEffect(() => {
    const fetchHistoricalEvents = async () => {
      if (!isConnected || !address || !publicClient || !contractAddresses.vaultManager) {
        setActivities([])
        setIsLoading(false)
        setError(null)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const currentBlock = await publicClient.getBlockNumber()
        const fromBlock = currentBlock > 10000n ? currentBlock - 10000n : 0n

        // Fetch all relevant events for the user
        const [depositLogs, withdrawLogs, mintLogs, burnLogs, liquidationLogs] = await Promise.all([
          publicClient.getLogs({
            address: contractAddresses.vaultManager as `0x${string}`,
            event: {
              type: 'event',
              name: 'CollateralDeposited',
              inputs: [
                { indexed: true, name: 'user', type: 'address' },
                { indexed: false, name: 'amount', type: 'uint256' },
                { indexed: false, name: 'isStS', type: 'bool' }
              ]
            },
            args: { user: address as `0x${string}` },
            fromBlock,
            toBlock: 'latest'
          }),
          publicClient.getLogs({
            address: contractAddresses.vaultManager as `0x${string}`,
            event: {
              type: 'event',
              name: 'CollateralWithdrawn',
              inputs: [
                { indexed: true, name: 'user', type: 'address' },
                { indexed: false, name: 'amount', type: 'uint256' },
                { indexed: false, name: 'isStS', type: 'bool' }
              ]
            },
            args: { user: address as `0x${string}` },
            fromBlock,
            toBlock: 'latest'
          }),
          publicClient.getLogs({
            address: contractAddresses.vaultManager as `0x${string}`,
            event: {
              type: 'event',
              name: 'StableMinted',
              inputs: [
                { indexed: true, name: 'user', type: 'address' },
                { indexed: false, name: 'amount', type: 'uint256' }
              ]
            },
            args: { user: address as `0x${string}` },
            fromBlock,
            toBlock: 'latest'
          }),
          publicClient.getLogs({
            address: contractAddresses.vaultManager as `0x${string}`,
            event: {
              type: 'event',
              name: 'StableBurned',
              inputs: [
                { indexed: true, name: 'user', type: 'address' },
                { indexed: false, name: 'amount', type: 'uint256' }
              ]
            },
            args: { user: address as `0x${string}` },
            fromBlock,
            toBlock: 'latest'
          }),
          publicClient.getLogs({
            address: contractAddresses.vaultManager as `0x${string}`,
            event: {
              type: 'event',
              name: 'VaultLiquidated',
              inputs: [
                { indexed: true, name: 'user', type: 'address' },
                { indexed: true, name: 'liquidator', type: 'address' },
                { indexed: false, name: 'collateralSeized', type: 'uint256' }
              ]
            },
            args: { user: address as `0x${string}` },
            fromBlock,
            toBlock: 'latest'
          })
        ])

        // Combine and parse all logs
        const allLogs = [
          ...depositLogs.map(log => ({ ...log, eventName: 'CollateralDeposited' })),
          ...withdrawLogs.map(log => ({ ...log, eventName: 'CollateralWithdrawn' })),
          ...mintLogs.map(log => ({ ...log, eventName: 'StableMinted' })),
          ...burnLogs.map(log => ({ ...log, eventName: 'StableBurned' })),
          ...liquidationLogs.map(log => ({ ...log, eventName: 'VaultLiquidated' }))
        ]

        // Parse events and sort by block number (most recent first)
        const parsedActivities = allLogs
          .map(parseEventToActivity)
          .filter((activity): activity is ActivityItem => activity !== null)
        
        // Combine with pending activities
        const pendingActivities = getPendingActivities()
        const combined = [...pendingActivities, ...parsedActivities]
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
          .slice(0, 20) // Limit to 20 most recent activities

        setActivities(combined)
        setIsLoading(false)
      } catch (err) {
        console.error('Error fetching events:', err)
        setError('Failed to load recent activity')
        setIsLoading(false)
      }
    }

    fetchHistoricalEvents()
  }, [address, isConnected, publicClient])

  // Watch for new events in real-time
  useWatchContractEvent({
    address: contractAddresses.vaultManager as `0x${string}`,
    abi: VAULT_MANAGER_ABI,
    eventName: 'CollateralDeposited',
    args: isConnected && address ? { user: address as `0x${string}` } : undefined,
    onLogs(logs) {
      const newActivities = logs
        .map(log => parseEventToActivity({ ...log, eventName: 'CollateralDeposited' }))
        .filter((activity): activity is ActivityItem => activity !== null)
      
      if (newActivities.length > 0) {
        setActivities(prev => {
          const pendingActivities = getPendingActivities()
          const combined = [...pendingActivities, ...newActivities, ...prev]
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(0, 20)
          return combined
        })
      }
    },
    enabled: isConnected && !!address && !!contractAddresses.vaultManager,
  })

  useWatchContractEvent({
    address: contractAddresses.vaultManager as `0x${string}`,
    abi: VAULT_MANAGER_ABI,
    eventName: 'CollateralWithdrawn',
    args: isConnected && address ? { user: address as `0x${string}` } : undefined,
    onLogs(logs) {
      const newActivities = logs
        .map(log => parseEventToActivity({ ...log, eventName: 'CollateralWithdrawn' }))
        .filter((activity): activity is ActivityItem => activity !== null)
      
      if (newActivities.length > 0) {
        setActivities(prev => {
          const pendingActivities = getPendingActivities()
          const combined = [...pendingActivities, ...newActivities, ...prev]
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(0, 20)
          return combined
        })
      }
    },
    enabled: isConnected && !!address && !!contractAddresses.vaultManager,
  })

  useWatchContractEvent({
    address: contractAddresses.vaultManager as `0x${string}`,
    abi: VAULT_MANAGER_ABI,
    eventName: 'StableMinted',
    args: isConnected && address ? { user: address as `0x${string}` } : undefined,
    onLogs(logs) {
      const newActivities = logs
        .map(log => parseEventToActivity({ ...log, eventName: 'StableMinted' }))
        .filter((activity): activity is ActivityItem => activity !== null)
      
      if (newActivities.length > 0) {
        setActivities(prev => {
          const pendingActivities = getPendingActivities()
          const combined = [...pendingActivities, ...newActivities, ...prev]
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(0, 20)
          return combined
        })
      }
    },
    enabled: isConnected && !!address && !!contractAddresses.vaultManager,
  })

  useWatchContractEvent({
    address: contractAddresses.vaultManager as `0x${string}`,
    abi: VAULT_MANAGER_ABI,
    eventName: 'StableBurned',
    args: isConnected && address ? { user: address as `0x${string}` } : undefined,
    onLogs(logs) {
      const newActivities = logs
        .map(log => parseEventToActivity({ ...log, eventName: 'StableBurned' }))
        .filter((activity): activity is ActivityItem => activity !== null)
      
      if (newActivities.length > 0) {
        setActivities(prev => {
          const pendingActivities = getPendingActivities()
          const combined = [...pendingActivities, ...newActivities, ...prev]
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(0, 20)
          return combined
        })
      }
    },
    enabled: isConnected && !!address && !!contractAddresses.vaultManager,
  })

  useWatchContractEvent({
    address: contractAddresses.vaultManager as `0x${string}`,
    abi: VAULT_MANAGER_ABI,
    eventName: 'VaultLiquidated',
    args: isConnected && address ? { user: address as `0x${string}` } : undefined,
    onLogs(logs) {
      const newActivities = logs
        .map(log => parseEventToActivity({ ...log, eventName: 'VaultLiquidated' }))
        .filter((activity): activity is ActivityItem => activity !== null)
      
      if (newActivities.length > 0) {
        setActivities(prev => {
          const pendingActivities = getPendingActivities()
          const combined = [...pendingActivities, ...newActivities, ...prev]
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(0, 20)
          return combined
        })
      }
    },
    enabled: isConnected && !!address && !!contractAddresses.vaultManager,
  })

  return {
    activities,
    isLoading,
    error
  }
}

// Helper function to format activity text
export function formatActivityText(activity: ActivityItem): string {
  const amount = Number(activity.amount).toLocaleString('en-US', { 
    minimumFractionDigits: 0, 
    maximumFractionDigits: 2 
  })

  switch (activity.type) {
    case 'deposit':
      return `Deposited ${amount} ${activity.token}`
    case 'withdraw':
      return `Withdrew ${amount} ${activity.token}`
    case 'mint':
      return `Minted ${amount} ${activity.token}`
    case 'repay':
      return `Repaid ${amount} ${activity.token}`
    case 'liquidation':
      return `Liquidated ${amount} ${activity.token}`
    default:
      return 'Unknown activity'
  }
}

// Helper function to format relative time
export function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  return `${Math.floor(diffInSeconds / 86400)}d ago`
}