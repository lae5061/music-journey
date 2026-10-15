import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Where the site is served from. GitHub Pages puts a project site under /<repo>/;
  // the deploy workflow sets this, and a local build serves from the root.
  base: process.env.BASE_PATH ?? '/',
})
