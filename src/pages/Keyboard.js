import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { currencyList } from '../data/General';
import { db, storage } from '../services/firebase';
import { collection, addDoc, query, orderBy, limit, getDocs, doc, getDoc, where } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { auth } from '../services/firebase';
import KeyboardR from './KeyboardR';
import { convertCurrency } from '../services/conversionService';

const Keyboard = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [convertedAmount, setConvertedAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState({ type: 'Cash', details: {} });
  const [description, setDescription] = useState('');
  const [receipt, setReceipt] = useState(null);
  const [productImage, setProductImage] = useState(null);
  const [fromCurrency, setFromCurrency] = useState(localStorage.getItem('lastChosenCurrency') || currencyList[0].code);
  const [toCurrency, setToCurrency] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  const [showSuccess, setShowSuccess] = useState(false);
  const [user, setUser] = useState(null);
  const [recentPaymentMethods, setRecentPaymentMethods] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [userCategories, setUserCategories] = useState([]);
  const amountInputRef = useRef(null);
  const [receiptProgress, setReceiptProgress] = useState(0);
  const [productImageProgress, setProductImageProgress] = useState(0);
  const [userPaymentMethods, setUserPaymentMethods] = useState([]);
  const [tags, setTags] = useState([]);
  const [allTags, setAllTags] = useState([]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        fetchUserData(user.uid);
      } else {
        navigate('/profile');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const fetchUserData = async (userId) => {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const userData = userSnap.data();
      setUserCategories(userData.categories || []);
      setUserPaymentMethods(userData.paymentMethods || []);
      setToCurrency(userData.mainCurrency || 'MYR');
      setAllTags(userData.tags || []);
      localStorage.setItem('mainCurrency', userData.mainCurrency || 'MYR');
      if (categoryId) {
        const category = userData.categories.find(cat => cat.id === categoryId);
        setSelectedCategory(category || null);
      }
      fetchRecentPaymentMethods(userId, userData.paymentMethods || []);
    }
  };

  const fetchRecentPaymentMethods = async (userId, allPaymentMethods) => {
    const q = query(collection(db, 'expenses'), where('userId', '==', userId), orderBy('date', 'desc'), limit(50));
    const querySnapshot = await getDocs(q);
    const recentMethods = querySnapshot.docs.map(doc => doc.data().paymentMethod);

    const methodMap = new Map();
    recentMethods.forEach(method => {
      const key = `${method.type}-${method.details.name || ''}-${method.details.last4 || ''}`;
      if (!methodMap.has(key)) {
        methodMap.set(key, method);
      }
    });

    allPaymentMethods.forEach(method => {
      const key = `${method.type}-${method.details.name || ''}-${method.details.last4 || ''}`;
      if (!methodMap.has(key)) {
        methodMap.set(key, method);
      }
    });

    setRecentPaymentMethods(Array.from(methodMap.values()));
  };

  useEffect(() => {
    const convertAmount = async () => {
      if (amount && toCurrency) {
        try {
          const converted = await convertCurrency(parseFloat(amount), fromCurrency, toCurrency);
          setConvertedAmount(converted.toFixed(2));
        } catch (error) {
          console.error('Error converting currency:', error);
          // Handle error (e.g., show a message to the user)
        }
      }
    };
    convertAmount();
  }, [amount, fromCurrency, toCurrency]);

  useEffect(() => {
    if (amountInputRef.current) {
      amountInputRef.current.focus();
    }
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
    if (amountInputRef.current) {
      amountInputRef.current.focus();
    }
  };

  const handleImageUpload = async (file, setProgress) => {
    if (!file) return null;

    const storageRef = ref(storage, `images/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(progress);
        },
        (error) => {
          console.error('Upload error:', error);
          reject(error);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        }
      );
    });
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

      if (!amount || !date || !time || !selectedCategory) {
        console.log('Missing required fields');
        alert("Please fill in all required fields");
        return;
      }

      const receiptURL = await handleImageUpload(receipt, setReceiptProgress);
      const productImageURL = await handleImageUpload(productImage, setProductImageProgress);

      const transactionDate = new Date(`${date}T${time}`);
      const transaction = {
        userId: user.uid,
        amount: parseFloat(amount).toFixed(2),
        convertedAmount,
        paymentMethod,
        description,
        receipt: receiptURL,
        productImage: productImageURL,
        date: transactionDate.toISOString(),
        fromCurrency,
        toCurrency,
        categoryId: selectedCategory.id,
        categoryName: selectedCategory.name,
        tags,
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
      userCategories={userCategories}
      amountInputRef={amountInputRef}
      handleAmountChange={handleAmountChange}
      handleCurrencyChange={handleCurrencyChange}
      handlePaymentMethodChange={handlePaymentMethodChange}
      handleSubmit={handleSubmit}
      setDescription={setDescription}
      setReceipt={setReceipt}
      setProductImage={setProductImage}
      setDate={setDate}
      setTime={setTime}
      currencyList={currencyList}
      userPaymentMethods={userPaymentMethods}
      tags={tags}
      setTags={setTags}
      allTags={allTags}
    />
  );
};

export default Keyboard;