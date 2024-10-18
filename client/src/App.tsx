import React from 'react'
import {BrowserRouter as Router,Routes,Route } from 'react-router-dom'
import Login from './pages/Login'
import { Toaster } from 'react-hot-toast'
import './App.css'
import Dashboard from './pages/Dashboard'
import StudentEnlist from './pages/StudentEnlist'
import Fees from './pages/Fees'

const App:React.FC = () => {
  return (
   
   <Router>
    <Routes>

    <Route path={'/'} element={<Login/>}/>
    <Route path={'/dashboard'} element={<Dashboard/>}/>
    <Route path={'/Delist'} element={<StudentEnlist/>}/>
    <Route path={'/Fees'} element={<Fees/>}/>
    </Routes>
    <Toaster position='top-center'/>
   </Router>
  )
}

export default App