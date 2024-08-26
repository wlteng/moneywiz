import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { paymentTypes, getConvertedAmount, currencyList, creditCards, debitCards, wallets, categoryList } from '../data/General';
import { Container, Form, Button, InputGroup, DropdownButton, Dropdown, Row, Col, Badge } from 'react-bootstrap';
import { db } from '../services/firebase';
import { collection, addDoc, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { auth } from '../services/firebase';

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
        setRecentPaymentMethods(methods);
      }
    };
    fetchRecentPaymentMethods();
  }, [user]);

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

  const getPaymentMethodTag = (method) => {
    if (!method || !method.type) {
      return ''; // or any default value or error handling you prefer
    }

    if (method.type === 'Cash') {
      return `cash-${method.currency || fromCurrency}`;
    } else if (method.type === 'Credit Card' || method.type === 'Debit Card') {
      return `${method.bank}-${method.last4}`;
    } else {
      return `${method.type.toLowerCase().replace(' ', '')}-${method.bank || method.currency || fromCurrency}`;
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

  return (
    <Container className="mt-4" style={{ maxWidth: '100%' }}>
      <div className="overflow-auto" style={{ whiteSpace: 'nowrap', height: '60px' }}>
        {recentPaymentMethods.map((method, index) => (
          <Button 
            key={index} 
            variant={getPaymentMethodBadgeColor(method.type)}
            style={{ margin: '0 5px', cursor: 'pointer', color: '#fff' }}
            onClick={() => setPaymentMethod(method)}
          >
            {getPaymentMethodTag(method)}
          </Button>
        ))}
      </div>

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
              variant={`bg-${getPaymentMethodBadgeColor(paymentMethod.type)}`}
              title={fromCurrency}
              id="input-group-dropdown-2"
              style={{ height: 'auto', border: 'none', backgroundColor: getPaymentMethodBadgeColor(paymentMethod.type), color: 'white' }}
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
          <Col xs={6} className="pe-1">
            <Form.Control 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)}
              style={{ height: '38px' }}
            />
          </Col>
          <Col xs={6} className="ps-1">
            <Form.Control 
              type="time" 
              value={time} 
              onChange={(e) => setTime(e.target.value)}
              style={{ height: '38px' }}
            />
          </Col>
        </Row>

        

        <div className="mb-4">
        <strong>Selected Category: </strong>
        <Badge bg="info">{selectedCategory.name}</Badge>
      </div>

      <div className="mb-4">
        <Row>
          {paymentTypes.map((type, index) => (
            <Col key={index} xs={6} className="mb-2">
              <DropdownButton
                variant={getPaymentMethodBadgeColor(type)}
                title={type}
                id={`payment-dropdown-${index}`}
                className="w-100"
              >
                {type === 'Cash' && (
                  <Dropdown.Item onClick={() => handlePaymentMethodChange({ type: 'Cash' })}>
                    Cash
                  </Dropdown.Item>
                )}
                {type === 'Credit Card' && creditCards.map((card, cardIndex) => (
                  <Dropdown.Item key={cardIndex} onClick={() => handlePaymentMethodChange({...card, type: 'Credit Card'})}>
                    {card.bank} - {card.last4}
                  </Dropdown.Item>
                ))}
                {type === 'Debit Card' && debitCards.map((card, cardIndex) => (
                  <Dropdown.Item key={cardIndex} onClick={() => handlePaymentMethodChange({...card, type: 'Debit Card'})}>
                    {card.bank} - {card.last4}
                  </Dropdown.Item>
                ))}
                {type === 'E-Wallet' && wallets.map((wallet, walletIndex) => (
                  <Dropdown.Item key={walletIndex} onClick={() => handlePaymentMethodChange({...wallet, type: 'E-Wallet'})}>
                    {wallet.name} ({wallet.country})
                  </Dropdown.Item>
                ))}
              </DropdownButton>
            </Col>
          ))}
        </Row>
      </div>

      <div className="mb-4">
        <strong>Selected Payment Method: </strong>
        <Badge bg={getPaymentMethodBadgeColor(paymentMethod.type)}>
          {paymentMethod.type === 'Cash' ? `${paymentMethod.type}-${fromCurrency}` : `${paymentMethod.type}: ${paymentMethod.last4}`}
        </Badge>
      </div>

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

export default Keyboard;