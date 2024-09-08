import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Container, Form, Button, InputGroup, Row, Col, Alert } from 'react-bootstrap';
import { getCurrencyDecimals } from '../data/General';
import { addDoc, collection, doc, getDoc, query, orderBy, limit, getDocs, updateDoc, where } from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import { useMediaQuery } from 'react-responsive';
import { FaTimes, FaArrowUp, FaArrowDown, FaSave } from 'react-icons/fa';
import { IoMdMove } from 'react-icons/io';
import { convertCurrency } from '../services/conversionService';
import { useNavigate } from 'react-router-dom';


const HomeInput = ({ userCategories, userPaymentMethods }) => {
  const [amounts, setAmounts] = useState({});
  const [convertedAmounts, setConvertedAmounts] = useState({});
  const [paymentMethod, setPaymentMethod] = useState({ type: 'Cash', details: {} });
  const [fromCurrency, setFromCurrency] = useState(localStorage.getItem('lastChosenCurrency') || 'SGD');
  const [mainCurrency, setMainCurrency] = useState(localStorage.getItem('mainCurrency') || 'MYR');
  const [showSuccess, setShowSuccess] = useState(false);
  const [user, setUser] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [favoriteCurrencies, setFavoriteCurrencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fieldOrder, setFieldOrder] = useState([]);
  const [isReordering, setIsReordering] = useState(false);
  const [tempFieldOrder, setTempFieldOrder] = useState([]);
  const [recentPaymentMethods, setRecentPaymentMethods] = useState([]);
  const navigate = useNavigate();
  const [longPressTimer, setLongPressTimer] = useState(null);
  const [monthlyTotals, setMonthlyTotals] = useState({});

  const isMobile = useMediaQuery({ maxWidth: 767 });
  const paymentMethodsRef = useRef(null);
  const inputRefs = useRef({});

  const fetchMonthlyTotals = useCallback(async (userId) => {
    try {
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const q = query(
        collection(db, 'expenses'),
        where('userId', '==', userId),
        where('date', '>=', firstDayOfMonth.toISOString()),
        where('date', '<=', lastDayOfMonth.toISOString())
      );

      const querySnapshot = await getDocs(q);
      const totals = {};

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (!totals[data.categoryId]) {
          totals[data.categoryId] = 0;
        }
        totals[data.categoryId] += parseFloat(data.convertedAmount);
      });

      setMonthlyTotals(totals);
    } catch (err) {
      console.error("Error fetching monthly totals:", err);
      setError("Failed to fetch monthly totals");
    }
  }, []);

  const fetchUserMainCurrency = useCallback(async (userId) => {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userData = userSnap.data();
        setMainCurrency(userData.mainCurrency || 'MYR');
        localStorage.setItem('mainCurrency', userData.mainCurrency || 'MYR');
      }
    } catch (err) {
      console.error("Error fetching user main currency:", err);
      setError("Failed to fetch user main currency");
    }
  }, []);

  const fetchRecentTransactions = useCallback(async (userId) => {
    try {
      const q = query(collection(db, 'expenses'), orderBy('date', 'desc'), limit(2));
      const querySnapshot = await getDocs(q);
      const transactions = querySnapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
      setRecentTransactions(transactions);
    } catch (err) {
      console.error("Error fetching recent transactions:", err);
      setError("Failed to fetch recent transactions");
    }
  }, []);

  const fetchRecentPaymentMethods = useCallback(async (userId) => {
    try {
      const q = query(collection(db, 'expenses'), where('userId', '==', userId), orderBy('date', 'desc'), limit(50));
      const querySnapshot = await getDocs(q);
      const recentMethods = querySnapshot.docs.map(doc => doc.data().paymentMethod);

      const methodMap = new Map();
      recentMethods.forEach(method => {
        const key = `${method.type}-${method.details.bank || ''}-${method.details.last4 || ''}`;
        if (!methodMap.has(key)) {
          methodMap.set(key, method);
        }
      });

      userPaymentMethods.forEach(method => {
        const key = `${method.type}-${method.details.bank || ''}-${method.details.last4 || ''}`;
        if (!methodMap.has(key)) {
          methodMap.set(key, method);
        }
      });

      setRecentPaymentMethods(Array.from(methodMap.values()));
    } catch (err) {
      console.error("Error fetching recent payment methods:", err);
      setError("Failed to fetch recent payment methods");
    }
  }, [userPaymentMethods]);

  const fetchFavoriteCurrencies = useCallback(async (userId) => {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const favorites = userData.favoriteCurrencies || [];
        setFavoriteCurrencies(favorites);
        
        if (!favorites.includes(fromCurrency)) {
          const newCurrency = favorites.length > 0 ? favorites[0] : mainCurrency;
          setFromCurrency(newCurrency);
          localStorage.setItem('lastChosenCurrency', newCurrency);
        }
      }
    } catch (err) {
      console.error("Error fetching favorite currencies:", err);
      setError("Failed to fetch favorite currencies");
    }
  }, [fromCurrency, mainCurrency]);

  const fetchFieldOrder = useCallback(async (userId) => {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const order = userData.fieldOrder || userCategories.map(cat => cat.id);
        setFieldOrder(order);
        setTempFieldOrder(order);
      }
    } catch (err) {
      console.error("Error fetching field order:", err);
      setError("Failed to fetch field order");
    }
  }, [userCategories]);

  useEffect(() => {
  const unsubscribe = auth.onAuthStateChanged((user) => {
    if (user) {
      setUser(user);
      fetchUserMainCurrency(user.uid);
      fetchRecentTransactions(user.uid);
      fetchFavoriteCurrencies(user.uid);
      fetchFieldOrder(user.uid);
      fetchRecentPaymentMethods(user.uid);
      fetchMonthlyTotals(user.uid);  // Add this line
    }
    setLoading(false);
  });
  return () => unsubscribe();
}, [fetchUserMainCurrency, fetchRecentTransactions, fetchFavoriteCurrencies, fetchFieldOrder, fetchRecentPaymentMethods, fetchMonthlyTotals]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        fetchUserMainCurrency(user.uid);
        fetchRecentTransactions(user.uid);
        fetchFavoriteCurrencies(user.uid);
        fetchFieldOrder(user.uid);
        fetchRecentPaymentMethods(user.uid);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [fetchUserMainCurrency, fetchRecentTransactions, fetchFavoriteCurrencies, fetchFieldOrder, fetchRecentPaymentMethods]);

  useEffect(() => {
    const convertAmounts = async () => {
      const newConvertedAmounts = {};
      for (const [categoryId, amount] of Object.entries(amounts)) {
        if (amount) {
          try {
            const converted = await convertCurrency(parseFloat(amount), fromCurrency, mainCurrency);
            newConvertedAmounts[categoryId] = converted;
          } catch (err) {
            console.error(`Error converting amount for category ${categoryId}:`, err);
            newConvertedAmounts[categoryId] = null;
          }
        }
      }
      setConvertedAmounts(newConvertedAmounts);
    };

    convertAmounts();
  }, [amounts, fromCurrency, mainCurrency]);

  const handleMouseDown = (categoryId) => {
    const timer = setTimeout(() => {
      navigate(`/keyboard/${categoryId}`);
    }, 500); // Adjust this value to change how long the user needs to hold
    setLongPressTimer(timer);
  };

  const handleMouseUp = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const handleMouseLeave = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
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
    if (!user) {
      console.error('No user logged in');
      return;
    }

    const amount = parseFloat(amounts[categoryId]);
    if (isNaN(amount)) return;

    try {
      const convertedAmount = convertedAmounts[categoryId];
      const now = new Date();

      const transaction = {
        userId: user.uid,
        amount: amount.toFixed(2),
        convertedAmount: convertedAmount.toFixed(2),
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

      await addDoc(collection(db, 'expenses'), transaction);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      fetchRecentTransactions(user.uid);
      fetchRecentPaymentMethods(user.uid);
    } catch (error) {
      console.error('Error submitting transaction:', error);
      setError('Failed to submit transaction');
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
        return 'rgba(0, 123, 255, 0.7)';
      case 'Debit Card':
        return 'rgba(40, 167, 69, 0.7)';
      case 'Credit Card':
        return 'rgba(220, 53, 69, 0.7)';
      case 'Cash':
      default:
        return 'rgba(108, 117, 125, 0.7)';
    }
  };

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

  const moveField = (index, direction) => {
    const newOrder = [...tempFieldOrder];
    const [removed] = newOrder.splice(index, 1);
    newOrder.splice(index + direction, 0, removed);
    setTempFieldOrder(newOrder);
  };

  const saveFieldOrder = async () => {
    try {
      if (user) {
        await updateDoc(doc(db, 'users', user.uid), { fieldOrder: tempFieldOrder });
        setFieldOrder(tempFieldOrder);
        setIsReordering(false);
      }
    } catch (err) {
      console.error("Error saving field order:", err);
      setError("Failed to save field order");
    }
  };

  const toggleReordering = () => {
    if (isReordering) {
      saveFieldOrder();
    } else {
      setTempFieldOrder([...fieldOrder]);
      setIsReordering(true);
    }
  };

  if (loading) {
    return <Container className="mt-4"><p>Loading...</p></Container>;
  }

  if (error) {
    return <Container className="mt-4"><Alert variant="danger">{error}</Alert></Container>;
  }

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
              padding-left: 5px;
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
        <Alert 
          key={index} 
          variant={getPaymentMethodBadgeColor(transaction.paymentMethod.type)} 
          className="mb-2"
          onClick={() => removeRecentTransaction(transaction.id)}
          style={{ cursor: 'pointer' }}
        >
          <div className="d-flex justify-content-between align-items-center">
            <div>
              {formatCurrency(transaction.amount, transaction.fromCurrency)} {transaction.fromCurrency} - 
              {getPaymentMethodTag(transaction.paymentMethod)} - 
              {userCategories.find(cat => cat.id === transaction.categoryId)?.name}
            </div>
          </div>
        </Alert>
      ))}

      <Row className="align-items-center">
        <Col xs={6}>
          <div className="payment-label" style={{ fontWeight: 'bold' }}>
            {getPaymentMethodTag(paymentMethod)}
          </div>
        </Col>
        <Col xs={6} className="d-flex justify-content-end">
          <Button 
            variant="link" 
            onClick={toggleReordering}
            style={{ 
              ...mobileStyles.button, 
              width: '50px', 
              padding: 0, 
              border: 'none', 
              background: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {isReordering ? <FaSave size={24} /> : <IoMdMove size={24} />}
          </Button>
          <Form.Select 
            value={fromCurrency}
            onChange={handleCurrencyChange}
            style={{ 
              ...mobileStyles.input, 
              width: 'auto', 
              marginRight: '0px' 
            }}
          >
            {favoriteCurrencies.map((currency) => (
              <option key={currency} value={currency}>{currency}</option>
            ))}
          </Form.Select>
          
        </Col>
      </Row>

      <div className="payment-methods-slider" style={{
        display: 'flex',
        overflowX: 'auto',
        whiteSpace: 'nowrap',
        padding: '10px 0',
        marginRight: '-11px',
      }} ref={paymentMethodsRef}>
        <Button
          key="cash"
          variant="outline-secondary"
          onClick={() => handlePaymentMethodChange({ type: 'Cash', details: {} })}
          className="me-2 payment-method-button"
          style={{ 
            flexShrink: 0,
            backgroundColor: getPaymentMethodColor('Cash'),
            color: 'white',
          }}
        >
          Cash
        </Button>
        {recentPaymentMethods.filter(method => method.type !== 'Cash').map((method, index) => (
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

      {(isReordering ? tempFieldOrder : fieldOrder).map((categoryId, index) => {
        const category = userCategories.find(cat => cat.id === categoryId);
        if (!category) return null;
        return (
          <Row key={categoryId} className="mb-3">
            <Col xs={12}>
              <InputGroup>
                {isReordering && (
                  <>
                    <Button
                      variant="outline-secondary"
                      onClick={() => moveField(index, -1)}
                      disabled={index === 0}
                    >
                      <FaArrowUp />
                    </Button>
                    <Button
                      variant="outline-secondary"
                      onClick={() => moveField(index, 1)}
                      disabled={index === tempFieldOrder.length - 1}
                    >
                      <FaArrowDown />
                    </Button>
                  </>
                )}
                
                <Form.Control
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  value={amounts[category.id] || ''}
                  onChange={(e) => handleAmountChange(category.id, e.target.value)}
                  onFocus={() => handleFocus(category.id)}
                  ref={(el) => inputRefs.current[category.id] = el}
                  placeholder={`${mainCurrency} ${formatCurrency(monthlyTotals[category.id] || 0, mainCurrency)} `}
                  style={isMobile ? mobileStyles.input : {}}
                  disabled={isReordering}
                />
                <Button
                    variant="primary"
                    style={{ 
                      ...categoryButtonStyle,
                      backgroundColor: `${category.color}B3`,
                    }}
                    onClick={() => handleQuickSubmit(category.id, category.name)}
                    onMouseDown={() => handleMouseDown(category.id)}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseLeave}
                    disabled={isReordering}
                  >
                    {category.name}
                  </Button>
              </InputGroup>
              {amounts[category.id] && !isReordering && (
                <small className="text-muted">
                  {formatCurrency(amounts[category.id], fromCurrency)} {fromCurrency} = 
                  {convertedAmounts[category.id] !== undefined
                    ? ` ${formatCurrency(convertedAmounts[category.id], mainCurrency)} ${mainCurrency}`
                    : ' Converting...'}
                </small>
              )}
            </Col>
          </Row>
        );
      })}

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