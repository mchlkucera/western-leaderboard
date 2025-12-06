import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AdminView from './AdminView'
import ReadView from './ReadView'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ReadView />} />
        <Route path="/admin" element={<AdminView />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
