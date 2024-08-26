import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { paymentTypes, getConvertedAmount, currencyList, creditCards, debitCards, wallets, categoryList } from '../data/General';
import { db } from '../services/firebase';
import { collection, addDoc, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { auth } from '../services/firebase';
import KeyboardR from './KeyboardR';

const Keyboard = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [convertedAmount, setConvertedAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState({ type: 'Cash', last4: 'N/A', bank: 'N/A' });
  const [description, setDescription] = useState('');
  const [receipt, setReceipt] = useState(null);
  const [productImage, setProductImage] = useState(null);
  const [fromCurrency, setFromCurrency] = useState(localStorage.getItem('lastChosenCurrency') || currencyList[0].code);
  const [toCurrency, setToCurrency] = useState(localStorage.getItem('mainCurrency') || 'USD');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  const [showSuccess, setShowSuccess] = useState(false);
  const [user, setUser] = useState(null);
  const [recentPaymentMethods, setRecentPaymentMethods] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(categoryList.find(cat => cat.id === categoryId) || categoryList[0]);
  const amountInputRef = useRef(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        const storedCurrency = localStorage.getItem('mainCurrency');
        if (storedCurrency) {
          setToCurrency(storedCurrency);
        }
      } else {
        navigate('/profile');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const convertCurrency = async () => {
      if (amount) {
        const converted = await getConvertedAmount(parseFloat(amount), fromCurrency, toCurrency);
        setConvertedAmount(converted.toFixed(2));
      }
    };
    convertCurrency();
  }, [amount, fromCurrency, toCurrency]);

  useEffect(() => {
    if (amountInputRef.current) {
      amountInputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    const fetchRecentPaymentMethods = async () => {
      if (user) {
        const q = query(collection(db, 'expenses'), orderBy('date', 'desc'), limit(10));
        const querySnapshot = await getDocs(q);
        const methods = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            type: data.paymentMethod.type,
            last4: data.paymentMethod.last4,
            bank: data.paymentMethod.bank,
            currency: data.fromCurrency
          };
        });
        const uniqueMethods = Array.from(new Set(methods.map(JSON.stringify))).map(JSON.parse);
        setRecentPaymentMethods(uniqueMethods);
      }
    };
    fetchRecentPaymentMethods();
  }, [user]);

  useEffect(() => {
    // Update date and time every second
    const timer = setInterval(() => {
      const now = new Date();
      setDate(now.toISOString().split('T')[0]);
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (!isNaN(value) && value.match(/^\d*\.?\d{0,2}$/)) {
      setAmount(value);
    }
  };

  const handleCurrencyChange = (currency) => {
    setFromCurrency(currency);
    localStorage.setItem('lastChosenCurrency', currency);
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Submit button clicked');

    try {
      if (!user) {
        console.log('User not authenticated, navigating to profile');
        navigate('/profile');
        return;
      }

      if (!amount || !date || !time) {
        console.log('Missing required fields');
        alert("Please fill in all required fields");
        return;
      }

      const transactionDate = new Date(`${date}T${time}`);
      const transaction = {
        amount: parseFloat(amount).toFixed(2),
        convertedAmount,
        paymentMethod: {
          type: paymentMethod.type,
          last4: paymentMethod.last4 || 'N/A',
          bank: paymentMethod.bank || 'N/A'
        },
        description,
        receipt,
        productImage,
        date: transactionDate.toISOString(),
        fromCurrency,
        toCurrency,
        categoryId: selectedCategory.id,
        categoryName: selectedCategory.name,
      };

      console.log('Creating transaction object:', transaction);

      const docRef = await addDoc(collection(db, 'expenses'), transaction);
      console.log('Transaction saved with ID:', docRef.id);

      setShowSuccess(true);
      console.log('Success message shown');

      setTimeout(() => {
        setShowSuccess(false);
        console.log('Navigating to home page');
        navigate('/');
      }, 1000);
    } catch (error) {
      console.error('Failed to save transaction:', error);
      alert(`Error saving transaction: ${error.message}`);
    }
  };

  return (
    <KeyboardR
      amount={amount}
      convertedAmount={convertedAmount}
      paymentMethod={paymentMethod}
      description={description}
      receipt={receipt}
      productImage={productImage}
      fromCurrency={fromCurrency}
      toCurrency={toCurrency}
      date={date}
      time={time}
      showSuccess={showSuccess}
      recentPaymentMethods={recentPaymentMethods}
      selectedCategory={selectedCategory}
      amountInputRef={amountInputRef}
      handleAmountChange={handleAmountChange}
      handleCurrencyChange={handleCurrencyChange}
      handlePaymentMethodChange={handlePaymentMethodChange}
      handleSubmit={handleSubmit}
      setDescription={setDescription}
      setReceipt={setReceipt}
      setProductImage={setProductImage}
      paymentTypes={paymentTypes}
      creditCards={creditCards}
      debitCards={debitCards}
      wallets={wallets}
      currencyList={currencyList}
    />
  );
};

export default Keyboard;