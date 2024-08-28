import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Transactions from './pages/Transactions';
import Report from './pages/Report';
import Profile from './pages/Profile';
import Keyboard from './pages/Keyboard';
import Investment from './pages/Investment';
import InvestmentDetail from './components/InvestmentDetail';
import ReportInvest from './components/ReportInvest';
import Header from './components/Header';
import { auth } from './services/firebase';

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      {user && <Header />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/keyboard/:categoryId" element={user ? <Keyboard /> : <Navigate to="/profile" />} />
        <Route path="/transactions" element={user ? <Transactions /> : <Navigate to="/profile" />} />
        <Route path="/report" element={user ? <Report /> : <Navigate to="/profile" />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/investments" element={user ? <Investment /> : <Navigate to="/profile" />} />
        <Route path="/investments/:id" element={user ? <InvestmentDetail /> : <Navigate to="/profile" />} />
        <Route path="/report/investments" element={user ? <ReportInvest /> : <Navigate to="/profile" />} />
      </Routes>
    </Router>
  );
};

export default App;