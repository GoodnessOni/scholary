import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': '{}',
    global: 'globalThis',
  },
  optimizeDeps: {
    include: ['buffer', '@solana/web3.js', '@solana/wallet-adapter-base'],
  },
  resolve: {
    alias: {
      buffer: 'buffer/',
    },
  },
})
