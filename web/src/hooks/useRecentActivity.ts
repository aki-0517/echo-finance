import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'

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

export function useRecentActivity(): RecentActivityData {
  const { address, isConnected } = useAccount()
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // For now, return mock data or empty array until event fetching is properly implemented
    // This avoids complex event parsing issues while we get the core functionality working
    if (!isConnected || !address) {
      setActivities([])
      setIsLoading(false)
      setError(null)
      return
    }

    setIsLoading(true)
    
    // Simulate loading and then show empty state for now
    const timer = setTimeout(() => {
      setActivities([])
      setIsLoading(false)
      setError(null)
    }, 1000)

    return () => clearTimeout(timer)
  }, [address, isConnected])

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