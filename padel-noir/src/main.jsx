import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { SiteContentProvider } from './context/SiteContentContext'
import App from './App'
import ErrorBoundary from './components/ErrorBoundary'
import './style.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <SiteContentProvider>
          <App />
        </SiteContentProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
)
