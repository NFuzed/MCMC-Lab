import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages serves project sites from /<repo-name>/, so assets need
// that prefix in CI builds; local dev and `vite preview` stay at root.
export default defineConfig({
  plugins: [react()],
  base: process.env.GITHUB_ACTIONS ? '/MCMC-Lab/' : '/',
})
