// App.tsx
import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import FirstPage from './pages/FirstPage'
import SecondPage from './pages/SecondPage'
// CHANGED: Import ThirdPage
import ThirdPage from './pages/ThirdPage'

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
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
          {/* CHANGED: Added Page 3 route */}
          <Route path="/page3" element={<ThirdPage />} />
        </Routes>
      </Router>
    </ThemeProvider>
  )
}

export default App