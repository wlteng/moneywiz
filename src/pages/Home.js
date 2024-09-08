import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Button, Form } from 'react-bootstrap';
import { auth, db } from '../services/firebase';
import { doc, getDoc, updateDoc, addDoc, collection } from 'firebase/firestore';
import HomeInput from '../components/HomeInput';

const Home = ({ user }) => {
  const [userCategories, setUserCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quickInputEnabled, setQuickInputEnabled] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState(localStorage.getItem('lastChosenCurrency') || 'USD');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState({ type: 'Cash' });
  const [amount, setAmount] = useState('');
  const [recentPaymentMethods, setRecentPaymentMethods] = useState([]);
  const [userPaymentMethods, setUserPaymentMethods] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          setUserCategories(userData.categories || []);
          setRecentPaymentMethods(userData.recentPaymentMethods || []);
          setUserPaymentMethods(userData.paymentMethods || []);
          setQuickInputEnabled(userData.settings?.quickInputEnabled || false);
        }
      }
      setLoading(false);
    };

    fetchUserData();
  }, [user]);

  const handleQuickInputChange = async (event) => {
    const isEnabled = event.target.checked;
    setQuickInputEnabled(isEnabled);
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { 'settings.quickInputEnabled': isEnabled });
    }
  };

  const handleCurrencyChange = (currency) => {
    setSelectedCurrency(currency);
    localStorage.setItem('lastChosenCurrency', currency);
  };

  const handlePaymentMethodChange = (method) => {
    setSelectedPaymentMethod(method);
  };

  const handleAmountChange = (e) => {
    setAmount(e.target.value);
  };

  const handleCategorySubmit = async (transaction) => {
    try {
      await addDoc(collection(db, 'expenses'), transaction);
      console.log('Transaction submitted:', transaction);
    } catch (error) {
      console.error('Error submitting transaction:', error);
    }
  };

  if (loading) {
    return <Container className="mt-4"><h2>Loading...</h2></Container>;
  }

  return (
    <Container className="mt-4">
      <style>
        {`
          .form-switch {
            display: flex;
            align-items: center;
            padding-left: 40px;
          }
          .form-switch .form-check-input {
            height: 1.5rem;
            width: 3rem;
            margin-right: 0.5rem;
          }
          .form-switch .form-check-label {
            margin-bottom: 0;
          }
          .dropdown-toggle {
            background-color: rgb(181, 201, 219) !important;
            border: none !important;
            border-radius: 1rem !important;
          }
          .form-control::placeholder {
            color: #cccccc;
          }
        `}
      </style>
      {user && (
        <Form.Check 
          type="switch"
          id="quick-input-switch"
          label="Quick Input"
          checked={quickInputEnabled}
          onChange={handleQuickInputChange}
          className="mb-3"
        />
      )}
      {quickInputEnabled ? (
        <HomeInput
          userCategories={userCategories}
          handleCurrencyChange={handleCurrencyChange}
          handlePaymentMethodChange={handlePaymentMethodChange}
          handleAmountChange={handleAmountChange}
          amount={amount}
          selectedCurrency={selectedCurrency}
          selectedPaymentMethod={selectedPaymentMethod}
          handleSubmitQuick={handleCategorySubmit}
          recentPaymentMethods={recentPaymentMethods}
          userPaymentMethods={userPaymentMethods}
        />
      ) : (
        <>
          <h2 className="text-center">Choose a Category</h2>
          {userCategories.length > 0 ? (
            <Row className="mt-4">
              {userCategories.map(category => (
                <Col xs={6} className="mb-3" key={category.id}>
                  <Link to={`/keyboard/${category.id}`} style={{ textDecoration: 'none' }}>
                    <Button 
                      className="w-100" 
                      style={{ backgroundColor: category.color, borderColor: category.color }}
                    >
                      {category.name}
                    </Button>
                  </Link>
                </Col>
              ))}
            </Row>
          ) : (
            <p className="text-center mt-4">No categories found. Please add categories in your profile.</p>
          )}
        </>
      )}
    </Container>
  );
};

export default Home;