// Contract addresses loaded from environment variables
export const contractAddresses = {
  vaultManager: import.meta.env.VITE_VAULT_MANAGER_ADDRESS || '',
  stablecoin: import.meta.env.VITE_STABLECOIN_ADDRESS || '',
  collateralAdapter: import.meta.env.VITE_COLLATERAL_ADAPTER_ADDRESS || '',
  sToken: import.meta.env.VITE_S_TOKEN_ADDRESS || '',
  stSToken: import.meta.env.VITE_STS_TOKEN_ADDRESS || '',
} as const

// Validate that all required addresses are set
export const validateAddresses = () => {
  const missing = Object.entries(contractAddresses)
    .filter(([, address]) => !address)
    .map(([name]) => name)
  
  if (missing.length > 0) {
    console.warn('Missing contract addresses:', missing)
    return false
  }
  
  return true
}

// Network configuration
export const networkConfig = {
  rpcUrl: import.meta.env.VITE_SONIC_TESTNET_RPC || 'https://rpc.testnet.soniclabs.com',
  explorerUrl: import.meta.env.VITE_SONIC_EXPLORER || 'https://explorer.sonic.test',
}