import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/loginstyle.css'
import './styles/schedulestyle.css'
import './styles/availablelessionsstyle.css'
import "./styles/globalstyle.css";
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)