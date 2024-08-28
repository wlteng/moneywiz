import React, { useState, useEffect } from 'react';
import { useMediaQuery } from 'react-responsive';
import { db } from '../services/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { categoryList } from '../data/General';
import TransactionsR from '../components/TransactionsR';
import TransactionMobile from '../components/TransactionMobile';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [filterMonth, setFilterMonth] = useState('');
  const [filterCurrency, setFilterCurrency] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const isMobile = useMediaQuery({ maxWidth: 767 });

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const q = query(collection(db, 'expenses'), orderBy('date', 'desc'));
        const querySnapshot = await getDocs(q);
        const fetchedTransactions = [];
        querySnapshot.forEach((doc) => {
          fetchedTransactions.push({ id: doc.id, ...doc.data() });
        });
        console.log('Fetched transactions:', fetchedTransactions);
        setTransactions(fetchedTransactions);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      }
    };

    fetchTransactions();
  }, []);

  const handleShowDescription = (transaction) => {
    setSelectedTransaction(transaction);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

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

  const uniqueMonths = [
    ...new Set(
      transactions.map((transaction) =>
        new Date(transaction.date).toLocaleString('default', { month: 'long', year: 'numeric' })
      )
    ),
  ];

  const uniqueCurrencies = [...new Set(transactions.map((transaction) => transaction.fromCurrency))];

  const filteredTransactions = transactions.filter((transaction) => {
    const transactionDate = new Date(transaction.date);
    const monthMatches = filterMonth
      ? transactionDate.toLocaleString('default', { month: 'long', year: 'numeric' }) === filterMonth
      : true;
    const currencyMatches = filterCurrency ? transaction.fromCurrency === filterCurrency : true;
    const categoryMatches = filterCategory ? transaction.categoryId === filterCategory : true;
    return monthMatches && currencyMatches && categoryMatches;
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
    categoryList,
    filterMonth,
    filterCurrency,
    filterCategory,
    handleMonthChange,
    handleCurrencyChange,
    handleCategoryChange,
    handleShowDescription,
    handleShowPaymentDetails,
    showModal,
    showPaymentModal,
    handleCloseModal,
    handleClosePaymentModal,
    selectedTransaction,
    selectedPayment
  };

  return isMobile ? (
    <TransactionMobile {...commonProps} />
  ) : (
    <TransactionsR {...commonProps} />
  );
};

export default Transactions;