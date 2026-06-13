import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import '@mantine/core/styles.css'
import '@mantine/code-highlight/styles.css'
import './styles/global.css'
import { MantineProvider, createTheme } from '@mantine/core'

const theme = createTheme({
  primaryColor: 'blue',
  colors: {
    dark: [
      '#C1C2C5', '#A6A7AB', '#909296', '#5C5F66', 
      '#373A40', '#2C2E33', '#1A1B1E', '#141517', 
      'rgba(20, 21, 27, 0.65)', '#0B0C10'
    ],
  },
  components: {
    Paper: {
      styles: {
        root: {
          backgroundColor: 'rgba(20, 21, 27, 0.65)',
          backdropFilter: 'blur(12px)',
          borderColor: 'rgba(255, 255, 255, 0.05)',
        }
      }
    },
    Card: {
      styles: {
        root: {
          backgroundColor: 'rgba(20, 21, 27, 0.65)',
          backdropFilter: 'blur(12px)',
          borderColor: 'rgba(255, 255, 255, 0.05)',
        }
      }
    }
  }
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MantineProvider defaultColorScheme="dark" theme={theme}>
      <App />
    </MantineProvider>
  </React.StrictMode>,
)
