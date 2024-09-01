import React, { useState } from 'react';
import { Container, Form, Button, InputGroup, Dropdown, Row, Col, DropdownButton } from 'react-bootstrap';
import { getConvertedAmount, currencyList } from '../data/General';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/firebase';

const HomeInput = ({
  userCategories,
  recentPaymentMethods,
  userPaymentMethods,
}) => {
  const navigate = useNavigate();
  const [amounts, setAmounts] = useState({});  
  const [paymentMethod, setPaymentMethod] = useState({ type: 'Cash', details: { type: 'Cash' } });
  const [fromCurrency, setFromCurrency] = useState(localStorage.getItem('lastChosenCurrency') || 'SGD');
  const [toCurrency] = useState(localStorage.getItem('mainCurrency') || 'MYR');
  const [showSuccess, setShowSuccess] = useState(false);

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
      amount: amount.toFixed(2),
      categoryId,
      categoryName,
      convertedAmount,
      date: now.toISOString().split('T')[0],
      time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      fromCurrency,
      paymentMethod: {
        details: {
          type: paymentMethod.details.type,
          name: paymentMethod.details.name || null,
          last4: paymentMethod.details.last4 || null,
          bank: paymentMethod.details.bank || null,
        }
      },
      toCurrency,
      userId: user.uid,
      description: "",
      receipt: null,
      productImage: null,
    };

    console.log('Transaction to be submitted:', transaction);  // Add this line for debugging

    try {
      await addDoc(collection(db, 'expenses'), transaction);
      console.log('Transaction submitted successfully');
      setShowSuccess(true);

      setTimeout(() => {
        setShowSuccess(false);
        navigate('/transactions');
      }, 2000);
    } catch (error) {
      console.error('Error submitting transaction:', error);
    }
  };

  const getPaymentMethodTag = (method) => {
    if (!method || !method.details || !method.details.type) return 'Unknown';
    switch (method.details.type.toLowerCase()) {
      case 'cash':
        return 'Cash';
      case 'credit card':
        return `Credit-${method.details.last4 || 'XXXX'}`;
      case 'debit card':
        return `Debit-${method.details.last4 || 'XXXX'}`;
      case 'e-wallet':
        return method.details.name || 'E-Wallet';
      default:
        return `${method.details.type}`;
    }
  };

  return (
    <Container className="mt-4 pb-5" style={{ maxWidth: '100%' }}>
      <Row>
        <Col>
          <DropdownButton
            as={InputGroup.Prepend}
            variant="outline-secondary"
            title={fromCurrency}
            id="input-group-dropdown-1"
          >
            {currencyList.map((currency) => (
              <Dropdown.Item key={currency.code} onClick={() => handleCurrencyChange(currency.code)}>
                {currency.name}
              </Dropdown.Item>
            ))}
          </DropdownButton>
        </Col>
        <Col>
          <DropdownButton
            variant="outline-secondary"
            title={getPaymentMethodTag(paymentMethod)}
            id="input-group-dropdown-2"
          >
            {[...recentPaymentMethods, ...userPaymentMethods].map((method, index) => (
              <Dropdown.Item key={index} onClick={() => handlePaymentMethodChange(method)}>
                {getPaymentMethodTag(method)}
              </Dropdown.Item>
            ))}
          </DropdownButton>
        </Col>
      </Row>
      <Row className="mt-3">
        {userCategories.map((category) => (
          <Col xs={12} key={category.id} className="mb-3">
            <InputGroup>
              <Form.Control
                type="text"
                value={amounts[category.id] || ''}  
                onChange={(e) => handleAmountChange(category.id, e.target.value)}
                placeholder={`Enter amount for ${category.name}`}
              />
              <Button
                variant="primary"
                style={{ backgroundColor: category.color, borderColor: category.color, minWidth: '200px' }}
                onClick={() => handleQuickSubmit(category.id, category.name)}
              >
                {category.name}
              </Button>
            </InputGroup>
          </Col>
        ))}
      </Row>

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