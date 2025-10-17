import React from 'react'
import LandingPage from './components/LandingPage'
import Navbar from './components/Navbar'
import LoginPage from './components/LoginPage'
import SignupPage from './components/SignupPage'
import { Route, Routes } from 'react-router-dom'
function App() {
  return (
    <>
    <Navbar />
    <Routes>
      <Route path='/' element={<LandingPage />} />
      <Route path='/login' element={<LoginPage />} />
      <Route path='/signup' element={<SignupPage />} />
    </Routes>
    </>
  )
}

export default App