import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import DashboardLayout from './DashboardLayout.jsx'
import Wallet from './Wallet.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <DashboardLayout />
    <Wallet />
  </StrictMode>,
)
