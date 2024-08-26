import React, { useState, useEffect } from 'react';
import { auth } from '../services/firebase';
import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { currencyList } from '../data/General';
import { Container, Form, Button } from 'react-bootstrap';

const Profile = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mainCurrency, setMainCurrency] = useState(localStorage.getItem('mainCurrency') || 'USD');
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        const storedCurrency = localStorage.getItem('mainCurrency');
        if (storedCurrency) {
          setMainCurrency(storedCurrency);
        }
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleCurrencyChange = (event) => {
    const selectedCurrency = event.target.value;
    setMainCurrency(selectedCurrency);
    localStorage.setItem('mainCurrency', selectedCurrency);
  };

  const handleEmailLogin = async () => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      setUser(result.user);
      setError('');
    } catch (error) {
      console.error('Email login failed:', error.message);
      setError(`Email login failed: ${error.message}`);
    }
  };

  const handleRegister = async () => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      setUser(result.user);
      setError('');
    } catch (error) {
      console.error('Registration failed:', error.message);
      setError(`Registration failed: ${error.message}`);
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
      setError('');
    } catch (error) {
      console.error('Google login failed:', error.message);
      setError(`Google login failed: ${error.message}`);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setError('');
    } catch (error) {
      console.error('Logout failed:', error.message);
      setError(`Logout failed: ${error.message}`);
    }
  };

  return (
    <Container className="mt-4">
      <h2>Profile</h2>
      {user ? (
        <div>
          <p>Logged in as {user.displayName || user.email}</p>
          <Button variant="danger" onClick={handleLogout} className="mb-3">
            Logout
          </Button>
          <Form.Group controlId="currencySelect">
            <Form.Label>Select Main Currency:</Form.Label>
            <Form.Select value={mainCurrency} onChange={handleCurrencyChange}>
              {currencyList.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </div>
      ) : (
        <div>
          <Button variant="primary" onClick={handleGoogleLogin} className="mb-3">
            Login with Google
          </Button>
          <Form.Group controlId="emailLogin">
            <Form.Control
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mb-2"
            />
            <Form.Control
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mb-3"
            />
            <Button variant="success" onClick={handleEmailLogin} className="me-2">
              Login with Email
            </Button>
            <Button variant="secondary" onClick={handleRegister}>
              Register
            </Button>
          </Form.Group>
        </div>
      )}
      {error && <p className="text-danger mt-3">{error}</p>}
    </Container>
  );
};

export default Profile;