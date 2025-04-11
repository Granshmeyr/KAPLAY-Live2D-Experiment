import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [],
  resolve: {
    alias: {
      path: 'path-browserify',
    },
  },
})
