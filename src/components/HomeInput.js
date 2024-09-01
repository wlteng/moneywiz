import React, { useState, useEffect } from 'react';
import { Container, Form, Button, InputGroup, Dropdown, Row, Col } from 'react-bootstrap';
import { getConvertedAmount, currencyList } from '../data/General';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../services/firebase';
import { auth } from '../services/firebase';

const HomeInput = ({
  userCategories,
  recentPaymentMethods,
  userPaymentMethods,
}) => {
  const [amounts, setAmounts] = useState({});  
  const [paymentMethod, setPaymentMethod] = useState({ type: 'Cash', details: {} });
  const [fromCurrency, setFromCurrency] = useState(localStorage.getItem('lastChosenCurrency') || 'SGD');
  const [toCurrency] = useState(localStorage.getItem('mainCurrency') || 'MYR');
  const [showSuccess, setShowSuccess] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleAmountChange = (categoryId, value) => {
    if (!isNaN(value) && value.match(/^\d*\.?\d{0,2}$/)) {
      setAmounts(prevAmounts => ({
        ...prevAmounts,
        [categoryId]: value
      }));
    }
  };

  const handleCurrencyChange = (currency) => {
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

    const convertedAmount = getConvertedAmount(amount, fromCurrency, toCurrency).toFixed(2);
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
      toCurrency,
      categoryId,
      categoryName,
    };

    try {
      await addDoc(collection(db, 'expenses'), transaction);
      setShowSuccess(true);

      setTimeout(() => {
        setShowSuccess(false);
      }, 2000);
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
        return `Credit - ${method.details.last4}`;
      case 'Debit Card':
        return `Debit - ${method.details.last4}`;
      case 'E-Wallet':
        return `E-Wallet - ${method.details.name}`;
      default:
        return `${method.type}`;
    }
  };

  const getPaymentMethodBadgeColor = (type) => {
    switch (type) {
      case 'E-Wallet':
        return '#007bff'; // primary blue
      case 'Debit Card':
        return '#28a745'; // success green
      case 'Credit Card':
        return '#dc3545'; // danger red
      case 'Cash':
      default:
        return '#6c757d'; // secondary gray
    }
  };

  const uniquePaymentMethods = [
    { type: 'Cash', details: {} },
    ...Array.from(new Set([...recentPaymentMethods, ...userPaymentMethods].map(JSON.stringify)))
      .map(JSON.parse)
      .filter(method => method.type !== 'Cash')
  ];

  return (
    <Container className="mt-4 pb-5" style={{ maxWidth: '100%' }}>
      <Row className="mb-3">
        <Col xs={6} className="pe-1">
          <Dropdown>
            <Dropdown.Toggle 
              variant="outline-secondary" 
              id="currency-dropdown"
              style={{ width: '100%' }}
            >
              {fromCurrency}
            </Dropdown.Toggle>
            <Dropdown.Menu style={{ width: '100%' }}>
              {currencyList.map((currency) => (
                <Dropdown.Item key={currency.code} onClick={() => handleCurrencyChange(currency.code)}>
                  {currency.name}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </Col>
        <Col xs={6} className="ps-1">
          <Dropdown>
            <Dropdown.Toggle 
              variant="outline-secondary" 
              id="payment-method-dropdown"
              style={{ 
                width: '100%', 
                backgroundColor: getPaymentMethodBadgeColor(paymentMethod.type),
                color: 'white'
              }}
            >
              {getPaymentMethodTag(paymentMethod)}
            </Dropdown.Toggle>
            <Dropdown.Menu style={{ width: '100%' }}>
              {uniquePaymentMethods.map((method, index) => (
                <Dropdown.Item 
                  key={index} 
                  onClick={() => handlePaymentMethodChange(method)}
                  style={{ backgroundColor: getPaymentMethodBadgeColor(method.type), color: 'white' }}
                >
                  {getPaymentMethodTag(method)}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </Col>
      </Row>
      {userCategories.map((category) => (
        <Row key={category.id} className="mb-3">
          <Col xs={12}>
            <InputGroup>
              <Form.Control
                type="text"
                value={amounts[category.id] || ''}  
                onChange={(e) => handleAmountChange(category.id, e.target.value)}
                placeholder={`Enter amount for ${category.name}`}
              />
              <Button
                variant="primary"
                style={{ backgroundColor: category.color, borderColor: category.color, minWidth: '120px' }}
                onClick={() => handleQuickSubmit(category.id, category.name)}
              >
                {category.name}
              </Button>
            </InputGroup>
            {amounts[category.id] && (
              <small className="text-muted">
                Converted: {getConvertedAmount(parseFloat(amounts[category.id]), fromCurrency, toCurrency).toFixed(2)} {toCurrency}
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