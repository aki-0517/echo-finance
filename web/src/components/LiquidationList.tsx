import { AlertTriangle, Zap } from 'lucide-react'
import { useVaultActions } from '../hooks/useVaultActions'

interface LiquidatableVault {
  address: string
  collateralValue: number
  debt: number
  healthFactor: number
  liquidationReward: number
}

export default function LiquidationList() {
  const { liquidateVault, isPending } = useVaultActions()
  // Mock liquidatable vaults - in real implementation, fetch from contract
  const liquidatableVaults: LiquidatableVault[] = [
    {
      address: '0x1234...5678',
      collateralValue: 15000,
      debt: 12500,
      healthFactor: 115.2,
      liquidationReward: 750,
    },
    {
      address: '0xabcd...efgh',
      collateralValue: 8200,
      debt: 7100,
      healthFactor: 108.8,
      liquidationReward: 410,
    },
    {
      address: '0x9876...4321',
      collateralValue: 25000,
      debt: 22000,
      healthFactor: 103.4,
      liquidationReward: 1250,
    },
  ]
  
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }
  
  const getHealthFactorColor = (healthFactor: number) => {
    if (healthFactor < 110) return 'text-red-600 bg-red-50'
    if (healthFactor < 120) return 'text-orange-600 bg-orange-50'
    return 'text-yellow-600 bg-yellow-50'
  }
  
  if (liquidatableVaults.length === 0) {
    return (
      <div className="card text-center">
        <div className="space-y-3">
          <Zap className="w-12 h-12 text-gray-400 mx-auto" />
          <h3 className="text-lg font-medium text-gray-900">No Liquidation Opportunities</h3>
          <p className="text-gray-600">All vaults are currently healthy. Check back later for liquidation opportunities.</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="card">
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-yellow-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Liquidatable Vaults ({liquidatableVaults.length})
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Vault</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Collateral</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Debt</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Health Factor</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Reward</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {liquidatableVaults.map((vault) => (
                <tr key={vault.address} className="hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="font-mono text-sm">{formatAddress(vault.address)}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm font-medium">{formatCurrency(vault.collateralValue)}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm">{formatCurrency(vault.debt)}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getHealthFactorColor(vault.healthFactor)}`}>
                      {vault.healthFactor.toFixed(1)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm font-medium text-green-600">
                      +{formatCurrency(vault.liquidationReward)}
                    </div>
                    <div className="text-xs text-gray-500">5% discount</div>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => liquidateVault(vault.address)}
                      disabled={isPending}
                      className="inline-flex items-center px-3 py-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded transition-colors"
                    >
                      <Zap className="w-3 h-3 mr-1" />
                      {isPending ? 'Liquidating...' : 'Liquidate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="text-sm text-yellow-800">
            <div className="font-medium">⚡ About Liquidations</div>
            <div>
              Liquidate unhealthy vaults (health factor &lt; 120) to earn a 5% discount on collateral. 
              You need eSUSD to cover the vault's debt.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}