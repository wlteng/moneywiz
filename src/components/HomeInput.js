import React, { useState, useEffect, useRef } from 'react';
import { Container, Form, Button, InputGroup, Row, Col, Alert } from 'react-bootstrap';
import { getConvertedAmount, currencyList, getCurrencyDecimals } from '../data/General';
import { addDoc, collection, doc, getDoc, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import { useMediaQuery } from 'react-responsive';
import { FaTimes } from 'react-icons/fa';

const HomeInput = ({
  userCategories,
  recentPaymentMethods,
  userPaymentMethods,
}) => {
  const [amounts, setAmounts] = useState({});  
  const [paymentMethod, setPaymentMethod] = useState({ type: 'Cash', details: {} });
  const [fromCurrency, setFromCurrency] = useState(localStorage.getItem('lastChosenCurrency') || 'SGD');
  const [mainCurrency, setMainCurrency] = useState(localStorage.getItem('mainCurrency') || 'MYR');
  const [showSuccess, setShowSuccess] = useState(false);
  const [user, setUser] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [favoriteCurrencies, setFavoriteCurrencies] = useState([]);

  const isMobile = useMediaQuery({ maxWidth: 767 });
  const paymentMethodsRef = useRef(null);
  const inputRefs = useRef({});

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        fetchUserMainCurrency(user.uid);
        fetchRecentTransactions(user.uid);
        fetchFavoriteCurrencies(user.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchUserMainCurrency = async (userId) => {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const userData = userSnap.data();
      setMainCurrency(userData.mainCurrency || 'MYR');
      localStorage.setItem('mainCurrency', userData.mainCurrency || 'MYR');
    }
  };

  const fetchRecentTransactions = async (userId) => {
    const q = query(collection(db, 'expenses'), 
                    orderBy('date', 'desc'), 
                    limit(2));
    const querySnapshot = await getDocs(q);
    const transactions = querySnapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
    setRecentTransactions(transactions);
  };

  const fetchFavoriteCurrencies = async (userId) => {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const userData = userSnap.data();
      const favorites = userData.favoriteCurrencies || [];
      setFavoriteCurrencies(favorites);
      
      // If the current fromCurrency is not in favorites, set it to the first favorite or mainCurrency
      if (!favorites.includes(fromCurrency)) {
        const newCurrency = favorites.length > 0 ? favorites[0] : mainCurrency;
        setFromCurrency(newCurrency);
        localStorage.setItem('lastChosenCurrency', newCurrency);
      }
    }
  };

  const formatCurrency = (value, currency) => {
    const numericValue = parseFloat(value);
    if (isNaN(numericValue)) return '';
    const decimals = getCurrencyDecimals(currency);
    return numericValue.toFixed(decimals);
  };

  const handleAmountChange = (categoryId, value) => {
    const numericValue = value.replace(/[^\d]/g, '');
    const formattedValue = (parseFloat(numericValue) / 100).toFixed(2);
    setAmounts(prevAmounts => ({
      ...prevAmounts,
      [categoryId]: formattedValue
    }));
  };

  const handleFocus = (categoryId) => {
    if (inputRefs.current[categoryId]) {
      inputRefs.current[categoryId].select();
    }
  };

  const handleCurrencyChange = (event) => {
    const currency = event.target.value;
    setFromCurrency(currency);
    localStorage.setItem('lastChosenCurrency', currency);
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
  };

  const handleQuickSubmit = async (categoryId, categoryName) => {
    const user = auth.currentUser;
    if (!user) {
      console.error('No user logged in');
      return;
    }

    const amount = parseFloat(amounts[categoryId]);
    if (isNaN(amount)) return;

    const convertedAmount = getConvertedAmount(amount, fromCurrency, mainCurrency).toFixed(2);
    const now = new Date();

    const transaction = {
      userId: user.uid,
      amount: amount.toFixed(2),
      convertedAmount,
      paymentMethod,
      description: "",
      receipt: null,
      productImage: null,
      date: now.toISOString(),
      fromCurrency,
      toCurrency: mainCurrency,
      categoryId,
      categoryName,
    };

    try {
      await addDoc(collection(db, 'expenses'), transaction);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      fetchRecentTransactions(user.uid);
    } catch (error) {
      console.error('Error submitting transaction:', error);
    }
  };

  const getPaymentMethodTag = (method) => {
    if (!method || !method.type) return 'Unknown';
    switch (method.type) {
      case 'Cash':
        return 'Cash';
      case 'Credit Card':
        return `${method.details.bank} - ${method.details.last4}`;
      case 'Debit Card':
        return `${method.details.bank} - ${method.details.last4}`;
      case 'E-Wallet':
        return `E-Wallet - ${method.details.name}`;
      default:
        return `${method.type}`;
    }
  };

  const getPaymentMethodBadgeColor = (type) => {
    switch (type) {
      case 'E-Wallet':
        return 'primary';
      case 'Debit Card':
        return 'success';
      case 'Credit Card':
        return 'danger';
      case 'Cash':
      default:
        return 'secondary';
    }
  };

  const getPaymentMethodColor = (type) => {
    switch (type) {
      case 'E-Wallet':
        return 'rgba(0, 123, 255, 0.7)'; // primary blue with 0.7 opacity
      case 'Debit Card':
        return 'rgba(40, 167, 69, 0.7)'; // success green with 0.7 opacity
      case 'Credit Card':
        return 'rgba(220, 53, 69, 0.7)'; // danger red with 0.7 opacity
      case 'Cash':
      default:
        return 'rgba(108, 117, 125, 0.7)'; // secondary gray with 0.7 opacity
    }
  };

  const uniquePaymentMethods = [
    { type: 'Cash', details: {} },
    ...Array.from(new Set([...recentPaymentMethods, ...userPaymentMethods].map(JSON.stringify)))
      .map(JSON.parse)
      .filter(method => method.type !== 'Cash')
  ];

  const mobileStyles = {
    container: {
      paddingLeft: '5px',
      paddingRight: '5px',
    },
    input: {
      height: '50px',
    },
    button: {
      height: '50px',
      fontSize: '1.1rem',
    },
  };

  const categoryButtonStyle = {
    minWidth: '150px',
    height: '50px',
    ...(isMobile ? mobileStyles.button : {}),
  };

  const removeRecentTransaction = (id) => {
    setRecentTransactions(prev => prev.filter(t => t.id !== id));
  };

  return (
    <Container className="mt-4 pb-5" style={{ 
      maxWidth: '100%', 
      ...(isMobile ? mobileStyles.container : {})
    }}>
      <style>
        {`
          @media (max-width: 767px) {
            .container, .container-fluid {
              padding-left: 5px !important;
              padding-right: 5px !important;
            }
            .payment-label {
              font-size: 0.9rem;
            }
          }
          .payment-method-button:hover {
            opacity: 1;
          }
          .btn-primary, .btn-outline-secondary {
            border-color: transparent !important;
          }
          .payment-method-button {
            height: 50px;
          }
        `}
      </style>

      {recentTransactions.map((transaction, index) => (
        <Alert key={index} variant={getPaymentMethodBadgeColor(transaction.paymentMethod.type)} className="mb-2">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              {formatCurrency(transaction.amount, transaction.fromCurrency)} {transaction.fromCurrency} - 
              {getPaymentMethodTag(transaction.paymentMethod)} - 
              {userCategories.find(cat => cat.id === transaction.categoryId)?.name}
            </div>
            <Button variant="link" className="p-0 text-decoration-none" onClick={() => removeRecentTransaction(transaction.id)}>
              <FaTimes />
            </Button>
          </div>
        </Alert>
      ))}

      <Row className="align-items-center">
        <Col xs={8}>
          <div className="payment-label" style={{ fontWeight: 'bold' }}>
            {getPaymentMethodTag(paymentMethod)}
          </div>
        </Col>
        <Col xs={4}>
          <Form.Select 
            value={fromCurrency}
            onChange={handleCurrencyChange}
            style={isMobile ? mobileStyles.input : {}}
          >
            {favoriteCurrencies.map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </Form.Select>
        </Col>
      </Row>

      <div className="mb-3 payment-methods-slider" style={{
        display: 'flex',
        overflowX: 'auto',
        whiteSpace: 'nowrap',
        padding: '10px 0',
      }} ref={paymentMethodsRef}>
        {uniquePaymentMethods.map((method, index) => (
          <Button
            key={index}
            variant="outline-secondary"
            onClick={() => handlePaymentMethodChange(method)}
            className="me-2 payment-method-button"
            style={{ 
              flexShrink: 0,
              backgroundColor: getPaymentMethodColor(method.type),
              color: 'white',
            }}
          >
            {getPaymentMethodTag(method)}
          </Button>
        ))}
      </div>

      {userCategories.map((category) => (
        <Row key={category.id} className="mb-3">
          <Col xs={12}>
            <InputGroup>
              <Form.Control
                type="number"
                inputMode="decimal"
                step="0.01"
                value={amounts[category.id] || ''}
                onChange={(e) => handleAmountChange(category.id, e.target.value)}
                onFocus={() => handleFocus(category.id)}
                ref={(el) => inputRefs.current[category.id] = el}
                placeholder={`Enter amount for ${category.name}`}
                style={isMobile ? mobileStyles.input : {}}
              />
              <Button
                variant="primary"
                style={{ 
                  ...categoryButtonStyle,
                  backgroundColor: `${category.color}B3`,
                }}
                onClick={() => handleQuickSubmit(category.id, category.name)}
              >
                {category.name}
              </Button>
            </InputGroup>
            {amounts[category.id] && (
              <small className="text-muted">
                {formatCurrency(amounts[category.id], fromCurrency)} {fromCurrency} = {formatCurrency(getConvertedAmount(parseFloat(amounts[category.id]), fromCurrency, mainCurrency), mainCurrency)} {mainCurrency}
              </small>
            )}
          </Col>
        </Row>
      ))}

      {showSuccess && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1050,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          color: '#fff',
          padding: '10px 20px',
          borderRadius: '5px',
          textAlign: 'center',
        }}>
          Transaction saved successfully!
        </div>
      )}
    </Container>
  );
};

export default HomeInput;