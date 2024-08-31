import React, { useState, useEffect } from 'react';
import { useMediaQuery } from 'react-responsive';
import { db, auth } from '../services/firebase';
import { collection, getDocs, query, orderBy, where, doc, getDoc } from 'firebase/firestore';
import TransactionsR from '../components/TransactionsR';
import TransactionMobile from '../components/TransactionMobile';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [userCategories, setUserCategories] = useState([]);
  const [filterMonth, setFilterMonth] = useState('');
  const [filterCurrency, setFilterCurrency] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  const isMobile = useMediaQuery({ maxWidth: 767 });

  useEffect(() => {
    const fetchTransactions = async () => {
      const user = auth.currentUser;
      if (user) {
        const q = query(
          collection(db, 'expenses'),
          where('userId', '==', user.uid),
          orderBy('date', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const fetchedTransactions = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTransactions(fetchedTransactions);
      }
    };

    const fetchUserCategories = async () => {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          setUserCategories(userData.categories || []);
        }
      }
    };

    fetchTransactions();
    fetchUserCategories();
  }, []);

  const handleMonthChange = (month) => setFilterMonth(month);
  const handleCurrencyChange = (currency) => setFilterCurrency(currency);
  const handleCategoryChange = (category) => setFilterCategory(category);
  const handlePaymentMethodChange = (method) => setFilterPaymentMethod(method);

  const handleShowPaymentDetails = (payment) => {
    setSelectedPayment(payment);
    setShowPaymentModal(true);
  };

  const handleClosePaymentModal = () => setShowPaymentModal(false);

  const resetFilters = () => {
    setFilterMonth('');
    setFilterCurrency('');
    setFilterCategory('');
    setFilterPaymentMethod('');
  };

  const uniqueMonths = [...new Set(transactions.map(t => 
    new Date(t.date).toLocaleString('default', { month: 'long', year: 'numeric' })
  ))];

  const uniqueCurrencies = [...new Set(transactions.map(t => t.fromCurrency))];

  const uniquePaymentMethods = [...new Set(transactions.map(t => t.paymentMethod.type))];

  const filteredTransactions = transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    const monthYearString = transactionDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    
    return (
      (!filterMonth || monthYearString === filterMonth) &&
      (!filterCurrency || transaction.fromCurrency === filterCurrency) &&
      (!filterCategory || transaction.categoryId === filterCategory) &&
      (!filterPaymentMethod || transaction.paymentMethod.type === filterPaymentMethod)
    );
  });

  const groupedTransactions = filteredTransactions.reduce((acc, transaction) => {
    const monthYear = new Date(transaction.date).toLocaleString('default', { month: 'long', year: 'numeric' });
    if (!acc[monthYear]) {
      acc[monthYear] = [];
    }
    acc[monthYear].push(transaction);
    return acc;
  }, {});

  const commonProps = {
    groupedTransactions,
    userCategories,
    uniqueMonths,
    uniqueCurrencies,
    uniquePaymentMethods,
    filterMonth,
    filterCurrency,
    filterCategory,
    filterPaymentMethod,
    handleMonthChange,
    handleCurrencyChange,
    handleCategoryChange,
    handlePaymentMethodChange,
    handleShowPaymentDetails,
    showPaymentModal,
    handleClosePaymentModal,
    selectedPayment,
    resetFilters
  };

  return isMobile ? <TransactionMobile {...commonProps} /> : <TransactionsR {...commonProps} />;
};

export default Transactions;