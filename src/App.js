import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Keyboard from './pages/Keyboard';
import Report from './pages/Report';
import SingleTransaction from './pages/SingleTransaction';
import Profile from './pages/Profile';

function App() {
  return (
    <Router>
      <div>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/keyboard/:categoryId" element={<Keyboard />} />
          <Route path="/report" element={<Report />} />
          <Route path="/transaction/:transactionId" element={<SingleTransaction />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;