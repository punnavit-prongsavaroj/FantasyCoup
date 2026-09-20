import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { spawn } from 'child_process'
import path from 'path'

const backendStarterPlugin = () => ({
  name: 'backend-starter',
  configureServer(server: any) {
    server.middlewares.use(async (req: any, res: any, next: any) => {
      if (req.url === '/__dev/start-backend' && req.method === 'POST') {
        const backendPath = path.resolve(__dirname, '../coup/coup')
        
        // Windows uses mvnw.cmd, Mac/Linux uses ./mvnw
        const command = process.platform === 'win32' ? 'mvnw.cmd' : './mvnw'
        
        console.log('Starting Spring Boot backend...')
        const child = spawn(command, ['spring-boot:run'], {
          cwd: backendPath,
          stdio: 'inherit', // Stream logs to Vite console
          shell: true
        })
        
        child.on('error', (err) => {
          console.error('Failed to start backend:', err)
        })

        res.statusCode = 200
        res.end(JSON.stringify({ status: 'starting' }))
        return
      }
      next()
    })
  }
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), backendStarterPlugin()],
  define: {
    global: 'window',
  },
})
