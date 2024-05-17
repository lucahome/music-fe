import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Index from './pages';
import Music from './pages/music';

const App = () => {

  return (
    <div className='container'>
      <Router>
        <Routes>
          <Route path='/' element={<Index />} />
          <Route path='/music/:musicId' element={<Music />} />
          <Route path="*" element={<Index />} />
        </Routes>
      </Router>
    </div>
  )
}

export default App;