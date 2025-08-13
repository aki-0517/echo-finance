interface HealthFactorBarProps {
  healthFactor: number
  className?: string
}

export default function HealthFactorBar({ healthFactor, className = '' }: HealthFactorBarProps) {
  // Health factor > 150 = safe, 120-150 = caution, <120 = danger
  const getColorClass = () => {
    if (healthFactor >= 150) return 'bg-gradient-to-r from-green-400 to-green-600'
    if (healthFactor >= 120) return 'bg-gradient-to-r from-yellow-400 to-yellow-600'
    return 'bg-gradient-to-r from-red-500 to-red-600'
  }
  
  const getStatus = () => {
    if (healthFactor >= 150) return { label: 'Safe', color: 'text-green-700' }
    if (healthFactor >= 120) return { label: 'Caution', color: 'text-yellow-700' }
    return { label: 'Danger', color: 'text-red-700' }
  }
  
  const status = getStatus()
  const percentage = Math.min(100, (healthFactor / 200) * 100)
  
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-brand-gray/80">Health Factor</span>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-bold">{healthFactor.toFixed(1)}</span>
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${status.color} bg-opacity-10`}>
            {status.label}
          </span>
        </div>
      </div>
      
      <div className="w-full bg-brand-ink/20 rounded-full h-3">
        <div
          className={`h-3 rounded-full transition-all duration-300 ${getColorClass()}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      <div className="flex justify-between text-xs text-brand-gray/60">
        <span>Liquidation Risk</span>
        <span>Safe Zone</span>
      </div>
    </div>
  )
}