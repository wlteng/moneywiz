import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Transactions from './pages/Transactions';
import SingleTransaction from './pages/SingleTransaction';
import SingleTransactionEdit from './components/SingleTransactionEdit';
import Report from './pages/Report';
import Profile from './pages/Profile';
import Keyboard from './pages/Keyboard';
import Investment from './pages/Investment';
import InvestmentDetail from './components/InvestmentDetail';
import ReportInvest from './components/ReportInvest';
import Header from './components/Header';
import { auth } from './services/firebase';
import Debt from './pages/Debt';
import DebtDetail from './components/DebtDetail';
import ReportDebt from './components/ReportDebt';
import Settings from './pages/Settings';
import InitialSetup from './components/InitialSetup';

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

  // Custom Route component to handle authentication
  const ProtectedRoute = ({ children }) => {
    if (!user) {
      return <Navigate to="/profile" replace />;
    }
    return children;
  };

  return (
    <Router>
      {user && <Header />}
      <Routes>
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/keyboard/:categoryId" element={<ProtectedRoute><Keyboard /></ProtectedRoute>} />
        <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
        <Route path="/transaction/:transactionId" element={<ProtectedRoute><SingleTransaction /></ProtectedRoute>} />
        <Route path="/transaction/:transactionId/edit" element={<ProtectedRoute><SingleTransactionEdit /></ProtectedRoute>} />
        <Route path="/report" element={<ProtectedRoute><Report /></ProtectedRoute>} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/initial-setup" element={<ProtectedRoute><InitialSetup /></ProtectedRoute>} />
        <Route path="/investments" element={<ProtectedRoute><Investment /></ProtectedRoute>} />
        <Route path="/investments/:id" element={<ProtectedRoute><InvestmentDetail /></ProtectedRoute>} />
        <Route path="/report/investments" element={<ProtectedRoute><ReportInvest /></ProtectedRoute>} />
        <Route path="/debts" element={<ProtectedRoute><Debt /></ProtectedRoute>} />
        <Route path="/debts/:id" element={<ProtectedRoute><DebtDetail /></ProtectedRoute>} />
        <Route path="/report/debts" element={<ProtectedRoute><ReportDebt /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
};

export default App;