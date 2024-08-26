import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { paymentTypes, getConvertedAmount, currencyList } from '../data/General';
import { Container, Form, Button, InputGroup, DropdownButton, Dropdown, Row, Col } from 'react-bootstrap';
import { db } from '../services/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { auth } from '../services/firebase';

const paymentImages = {
  Cash: 'path/to/cash.png',
  'Credit Card': 'path/to/credit-card.png',
  'Debit Card': 'path/to/debit-card.png',
  'E-Wallet': 'path/to/wallet.png',
};

const Keyboard = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [convertedAmount, setConvertedAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState(paymentTypes[0] || '');
  const [description, setDescription] = useState('');
  const [receipt, setReceipt] = useState(null);
  const [productImage, setProductImage] = useState(null);
  const [fromCurrency, setFromCurrency] = useState(localStorage.getItem('lastChosenCurrency') || currencyList[0].code);
  const [toCurrency, setToCurrency] = useState(localStorage.getItem('mainCurrency') || 'USD');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  const [showSuccess, setShowSuccess] = useState(false);
  const [user, setUser] = useState(null);
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

  const handlePaymentMethodChange = (selectedMethod) => {
    setPaymentMethod(selectedMethod);
  };

  const handleDateChange = (e) => {
    setDate(e.target.value);
  };

  const handleTimeChange = (e) => {
    setTime(e.target.value);
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

      if (!amount || !paymentMethod || !date || !time) {
        console.log('Missing required fields');
        alert("Please fill in all required fields");
        return;
      }

      const transactionDate = new Date(`${date}T${time}`);
      const transaction = {
        amount: parseFloat(amount).toFixed(2),
        convertedAmount,
        paymentMethod,
        description,
        receipt,
        productImage,
        date: transactionDate.toISOString(),
        fromCurrency,
        toCurrency,
        categoryId,
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
    <Container className="mt-4" style={{ paddingTop: '20px', maxWidth: '100%' }}>
      <Form onSubmit={handleSubmit}>
        <div>
          <InputGroup>
            <Form.Control
              type="text"
              value={amount}
              onChange={handleAmountChange}
              ref={amountInputRef}
              style={{ zIndex: 1, height: 'auto' }}
            />
            <DropdownButton
              as={InputGroup.Append}
              variant="outline-secondary"
              title={fromCurrency}
              id="input-group-dropdown-2"
              style={{ height: 'auto' }}
            >
              {currencyList.map((currency) => (
                <Dropdown.Item key={currency.code} onClick={() => handleCurrencyChange(currency.code)}>
                  {currency.name}
                </Dropdown.Item>
              ))}
            </DropdownButton>
          </InputGroup>
        </div>
        <div className="mb-4">
          <small>Converted: {convertedAmount || '0.00'} {toCurrency}</small>
        </div>

        <Row className="mb-4">
          <Col xs={6} className="pr-1">
            <Form.Control 
              type="date" 
              value={date} 
              onChange={handleDateChange}
              style={{ height: '38px' }}
            />
          </Col>
          <Col xs={6} className="pl-1">
            <Form.Control 
              type="time" 
              value={time} 
              onChange={handleTimeChange}
              style={{ height: '38px' }}
            />
          </Col>
        </Row>

        <div className="mb-4">
          <Row>
            {paymentTypes.map((method, index) => (
              <Col key={index} xs={3} className="text-center" onClick={() => handlePaymentMethodChange(method)}>
                <img
                  src={paymentImages[method]}
                  alt={method}
                  style={{ width: '60px', height: '60px', borderRadius: '50%', cursor: 'pointer' }}
                />
                <h6 className="mt-2">{method}</h6>
              </Col>
            ))}
          </Row>
        </div>

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

        <div className="mb-4">
          <Form.Group>
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Form.Group>
        </div>

        <div className="mb-4">
          <Form.Group>
            <Form.Label>Receipt</Form.Label>
            <Form.Control type="file" onChange={(e) => setReceipt(e.target.files[0])} />
          </Form.Group>
          <Form.Group>
            <Form.Label>Product Image</Form.Label>
            <Form.Control type="file" onChange={(e) => setProductImage(e.target.files[0])} />
          </Form.Group>
        </div>
        <Button variant="primary" type="submit">Submit</Button>
      </Form>
    </Container>
  );
};

export default Keyboard;