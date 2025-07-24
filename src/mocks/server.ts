import { setupServer } from 'msw/node'
import { handlers } from './handlers'

// Setup MSW server with our handlers
export const server = setupServer(...handlers)

// Start server
export const startServer = () => server.listen()

// Stop server
export const stopServer = () => server.close()

// Reset handlers
export const resetServer = () => server.resetHandlers()
