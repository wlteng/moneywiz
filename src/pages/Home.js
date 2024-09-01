import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { auth, db } from '../services/firebase';
import { doc, getDoc, addDoc, collection } from 'firebase/firestore';
import HomeInput from '../components/HomeInput';

const Home = () => {
  const [userCategories, setUserCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quickInputEnabled, setQuickInputEnabled] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState(localStorage.getItem('lastChosenCurrency') || 'USD');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState({ type: 'Cash' });
  const [amount, setAmount] = useState('');
  const [recentPaymentMethods, setRecentPaymentMethods] = useState([]);
  const [userPaymentMethods, setUserPaymentMethods] = useState([]);

  useEffect(() => {
    const fetchUserCategories = async () => {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          setUserCategories(userData.categories || []);
          setRecentPaymentMethods(userData.recentPaymentMethods || []);
          setUserPaymentMethods(userData.paymentMethods || []);
          setQuickInputEnabled(userData.settings?.quickInputEnabled || false); // Fetch quick input setting
        }
      }
      setLoading(false);
    };

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchUserCategories();
      } else {
        setUserCategories([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

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
      // Optionally reset the state or show success feedback
    } catch (error) {
      console.error('Error submitting transaction:', error);
    }
  };

  if (loading) {
    return <Container className="mt-4"><h2>Loading...</h2></Container>;
  }

  return (
    <Container className="mt-4">
      <h1 className="text-center">Home</h1>
      
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