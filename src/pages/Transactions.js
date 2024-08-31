import React, { useState, useEffect } from 'react';
import { useMediaQuery } from 'react-responsive';
import { db, auth } from '../services/firebase';
import { collection, getDocs, query, orderBy, where, doc, getDoc } from 'firebase/firestore';
import TransactionsR from '../components/TransactionsR';
import TransactionMobile from '../components/TransactionMobile';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [filterMonth, setFilterMonth] = useState('');
  const [filterCurrency, setFilterCurrency] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState('');
  const [userCategories, setUserCategories] = useState([]);

  const isMobile = useMediaQuery({ maxWidth: 767 });

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const q = query(
            collection(db, 'expenses'),
            where('userId', '==', user.uid),
            orderBy('date', 'desc')
          );
          const querySnapshot = await getDocs(q);
          const fetchedTransactions = [];
          querySnapshot.forEach((doc) => {
            fetchedTransactions.push({ id: doc.id, ...doc.data() });
          });
          setTransactions(fetchedTransactions);
        }
      } catch (error) {
        console.error('Error fetching transactions:', error);
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

  const handleShowPaymentDetails = (payment) => {
    setSelectedPayment(payment);
    setShowPaymentModal(true);
  };

  const handleClosePaymentModal = () => {
    setShowPaymentModal(false);
  };

  const handleMonthChange = (month) => {
    setFilterMonth(month);
  };

  const handleCurrencyChange = (currency) => {
    setFilterCurrency(currency);
  };

  const handleCategoryChange = (category) => {
    setFilterCategory(category);
  };

  const handlePaymentMethodChange = (method) => {
    setFilterPaymentMethod(method);
  };

  const uniqueMonths = [
    ...new Set(
      transactions.map((transaction) =>
        new Date(transaction.date).toLocaleString('default', { month: 'long', year: 'numeric' })
      )
    ),
  ];

  const uniqueCurrencies = [...new Set(transactions.map((transaction) => transaction.fromCurrency))];

  const uniquePaymentMethods = [...new Set(transactions.map((transaction) => transaction.paymentMethod.type))];

  const filteredTransactions = transactions.filter((transaction) => {
    const transactionDate = new Date(transaction.date);
    const monthMatches = filterMonth
      ? transactionDate.toLocaleString('default', { month: 'long', year: 'numeric' }) === filterMonth
      : true;
    const currencyMatches = filterCurrency ? transaction.fromCurrency === filterCurrency : true;
    const categoryMatches = filterCategory ? transaction.categoryId === filterCategory : true;
    const paymentMethodMatches = filterPaymentMethod ? transaction.paymentMethod.type === filterPaymentMethod : true;
    return monthMatches && currencyMatches && categoryMatches && paymentMethodMatches;
  });

  const groupedTransactions = filteredTransactions.reduce((acc, transaction) => {
    const transactionDate = new Date(transaction.date);
    const monthYear = transactionDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    if (!acc[monthYear]) {
      acc[monthYear] = [];
    }
    acc[monthYear].push(transaction);
    return acc;
  }, {});

  const commonProps = {
    groupedTransactions,
    uniqueMonths,
    uniqueCurrencies,
    userCategories,
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
    uniquePaymentMethods
  };

  return isMobile ? (
    <TransactionMobile {...commonProps} />
  ) : (
    <TransactionsR {...commonProps} />
  );
};

export default Transactions;