import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { auth } from './services/firebase';
import { onAuthStateChanged, getRedirectResult } from 'firebase/auth';
import { getUserData } from './services/userService';
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
import PublicExp from './pages/PublicExp';
import CreditCardForm from './pages/admin/CreditCardForm';
import ShopForm from './pages/admin/ShopForm';
import CreditCardList from './pages/CreditCardList';
import CreditCardDetail from './pages/CreditCardDetail';
import CreditCardEdit from './pages/CreditCardEdit';

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const handleAuth = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          const userData = await getUserData(result.user.uid);
          setUser({ ...result.user, ...userData });
        }

        const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
          if (authUser) {
            const userData = await getUserData(authUser.uid);
            setUser({ ...authUser, ...userData });
          } else {
            setUser(null);
          }
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

  const ProtectedRoute = ({ children, allowedRoles = ['user', 'admin', 'bankstaff'] }) => {
    const navigate = useNavigate();
    
    useEffect(() => {
      if (!user || !allowedRoles.includes(user.role)) {
        navigate('/', { replace: true });
      }
    }, [user, navigate, allowedRoles]);

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
        <Route path="/public-expenses" element={<PublicExp />} />
        <Route path="/admin/credit-card-form" element={<ProtectedRoute allowedRoles={['admin', 'bankstaff']}><CreditCardForm /></ProtectedRoute>} />
        <Route path="/admin/shop-form" element={<ProtectedRoute allowedRoles={['admin']}><ShopForm /></ProtectedRoute>} />
        <Route path="/credit-cards" element={<CreditCardList />} />
        <Route path="/credit-cards/:id" element={<CreditCardDetail />} />
        <Route path="/credit-cards/:id/edit" element={
          <ProtectedRoute allowedRoles={['admin', 'bankstaff']}>
            <CreditCardEdit />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
};

export default App;