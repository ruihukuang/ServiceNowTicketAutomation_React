import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import FirstPage from './pages/FirstPage'
import SecondPage from './pages/SecondPage'
import ThirdPage from './pages/ThirdPage'
import Dashboard from './pages/Dashboard'

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
})

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<FirstPage />} />
          <Route path="/page1" element={<FirstPage />} />
          <Route path="/page2" element={<SecondPage />} />
          <Route path="/page3" element={<ThirdPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          {/* 可选：添加404页面 */}
          <Route path="*" element={<FirstPage />} />
        </Routes>
      </Router>
    </ThemeProvider>
  )
}

export default App