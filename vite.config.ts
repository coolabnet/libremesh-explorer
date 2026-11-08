import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: './' makes the build relocatable (works from any sub-path / static host).
export default defineConfig({
  plugins: [react()],
  base: './',
})
