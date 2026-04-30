import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

console.log('🚀 Initializing React application...')

const rootElement = document.getElementById('root')

if (!rootElement) {
  const error = new Error('❌ Root element (#root) not found in index.html. Check that <div id="root"></div> exists in the body.')
  console.error(error)
  document.body.innerHTML = `<div style="padding: 20px; color: red; font-family: sans-serif;"><h1>React App Error</h1><p>${error.message}</p></div>`
  throw error
}

console.log('✓ Root element found')
console.log('✓ Creating React root and mounting App...')

try {
  const root = createRoot(rootElement)
  
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
  
  console.log('✓ React app mounted successfully')
} catch (error) {
  console.error('❌ Error mounting React app:', error)
  rootElement.innerHTML = `<div style="padding: 20px; color: red; font-family: sans-serif;"><h1>App Error</h1><p>${error.message}</p><pre>${error.stack}</pre></div>`
}
