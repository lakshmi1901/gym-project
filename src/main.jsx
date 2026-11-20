import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import './Common/Api/auth' // registers the JWT axios interceptors

createRoot(document.getElementById('root')).render(
  // <StrictMode>
    <App />
  // {/* </StrictMode>, */}
)
