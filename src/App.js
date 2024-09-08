import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { auth } from './services/firebase';
import { onAuthStateChanged, getRedirectResult } from 'firebase/auth';
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
import Debt from './pages/Debt';
import DebtDetail from './components/DebtDetail';
import ReportDebt from './components/ReportDebt';
import Settings from './pages/Settings';
import InitialSetup from './components/InitialSetup';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import ConversionRate from './pages/ConversionRate';
import NonLoginHome from './components/NonLoginHome';

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const handleAuth = async () => {
      try {
        // Handle redirect result first
        const result = await getRedirectResult(auth);
        if (result?.user) {
          setUser(result.user);
        }

        // Set up the auth state listener
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          setUser(user);
          setLoading(false);
        }, (error) => {
          console.error("Auth state error:", error);
          setAuthError(error);
          setLoading(false);
        });

        return unsubscribe;
      } catch (error) {
        console.error("Auth initialization error:", error);
        setAuthError(error);
        setLoading(false);
      }
    };

    handleAuth();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (authError) {
    return <div>An authentication error occurred. Please try logging in again.</div>;
  }

  // Custom Route component to handle authentication
  const ProtectedRoute = ({ children }) => {
    const navigate = useNavigate();
    
    useEffect(() => {
      if (!user) {
        navigate('/', { replace: true });
      }
    }, [user, navigate]);

    return children;
  };

  return (
    <Router>
      {user && <Header user={user} />}
      <Routes>
        <Route path="/" element={user ? <Home user={user} /> : <NonLoginHome />} />
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
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/conversion-rate" element={<ConversionRate />} />
      </Routes>
    </Router>
  );
};

export default App;