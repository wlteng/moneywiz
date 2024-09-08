import React, { useState } from 'react';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../services/firebase';
import { Container, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (error) {
      if (error.code === 'auth/wrong-password') {
        setError('Incorrect password. Please try again.');
      } else if (error.code === 'auth/user-not-found') {
        setError('No account found with this email. Please register.');
      } else {
        setError(error.message);
      }
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Password reset email sent. Please check your inbox.');
    } catch (error) {
      setError(error.message);
    }
  };

  const inputStyle = {
    height: '50px',
    fontSize: '1.1rem'
  };

  return (
    <div style={{ backgroundColor: '#e4d4cc', minHeight: '100vh', paddingTop: '20px' }}>
      <Container>
        <Row className="justify-content-center">
          <Col md={6}>
            <Button 
              variant="link" 
              className="mb-3 p-0" 
              onClick={() => navigate('/')} 
              style={{ 
                fontSize: '1.1rem', 
                color: 'rgb(193, 129, 98)', 
                textDecoration: 'none' 
              }}
            >
              <FaArrowLeft /> Back
            </Button>
            <div className="bg-white p-4 rounded shadow">
              <h2 className="text-center mb-4" style={{ fontSize: '2rem' }}>Login to Easylog</h2>
              {error && <Alert variant="danger">{error}</Alert>}
              {message && <Alert variant="success">{message}</Alert>}
              <Form onSubmit={handleEmailLogin}>
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontSize: '1.1rem' }}>Email</Form.Label>
                  <Form.Control 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                    style={inputStyle}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontSize: '1.1rem' }}>Password</Form.Label>
                  <Form.Control 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                    style={inputStyle}
                  />
                </Form.Group>
                <Button variant="primary" type="submit" className="w-100 mb-3" style={{ height: '50px', fontSize: '1.1rem' }}>
                  Login
                </Button>
              </Form>
              <Button variant="link" onClick={handleForgotPassword} className="w-100" style={{ fontSize: '1.1rem' }}>
                Forgot Password?
              </Button>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default LoginPage;