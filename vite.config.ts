import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  // Explicit env var wins; otherwise auto-detect from GitHub Actions GITHUB_REPOSITORY
  // e.g. "4rsen1x/GermanCards" → base = "/GermanCards/"
  let base = env.VITE_BASE_URL || '/'
  if (!env.VITE_BASE_URL && process.env.GITHUB_REPOSITORY) {
    const repoName = process.env.GITHUB_REPOSITORY.split('/')[1]
    base = `/${repoName}/`
  }

  return {
    plugins: [react()],
    base,
  }
})
