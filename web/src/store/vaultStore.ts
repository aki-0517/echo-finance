import { create } from 'zustand'

export interface VaultData {
  collateralS: bigint
  collateralStS: bigint
  debt: bigint
  collateralValue: bigint
  ltv: number
  healthFactor: number
  maxMintable: bigint
}

interface VaultStore {
  vault: VaultData | null
  isLoading: boolean
  error: string | null
  
  setVault: (vault: VaultData) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearVault: () => void
}

export const useVaultStore = create<VaultStore>((set) => ({
  vault: null,
  isLoading: false,
  error: null,
  
  setVault: (vault) => set({ vault, error: null }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clearVault: () => set({ vault: null, error: null }),
}))