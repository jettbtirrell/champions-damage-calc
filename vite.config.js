import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'

const TEAMS_FILE = resolve('./src/data/savedTeams.json')

function teamsApiPlugin() {
  return {
    name: 'teams-api',
    configureServer(server) {
      server.middlewares.use('/api/teams', async (req, res) => {
        res.setHeader('Content-Type', 'application/json')

        if (req.method === 'GET') {
          try {
            res.end(readFileSync(TEAMS_FILE, 'utf8'))
          } catch {
            res.end('[]')
          }
          return
        }

        if (req.method === 'POST') {
          let body = ''
          req.on('data', chunk => { body += chunk })
          req.on('end', () => {
            try {
              const teams = JSON.parse(body)
              writeFileSync(TEAMS_FILE, JSON.stringify(teams, null, 2))
              res.end(JSON.stringify({ ok: true }))
            } catch (e) {
              res.statusCode = 400
              res.end(JSON.stringify({ error: e.message }))
            }
          })
          return
        }

        res.statusCode = 405
        res.end(JSON.stringify({ error: 'Method not allowed' }))
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), teamsApiPlugin()],
})
