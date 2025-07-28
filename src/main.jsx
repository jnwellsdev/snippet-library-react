import React from 'react'
import ReactDOM from 'react-dom/client'
import { Theme } from '@radix-ui/themes'
import '@radix-ui/themes/styles.css'
import './styles/theme.css'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Theme
      appearance="dark"
      accentColor="gray"
      grayColor="blue"
      radius="medium"
      scaling="100%"
    >
      <App />
    </Theme>
  </React.StrictMode>
)
