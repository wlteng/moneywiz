import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../services/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Container, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [hint, setHint] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: userCredential.user.email,
        hint: hint,
        createdAt: new Date()
      });
      navigate('/');
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
              <h2 className="text-center mb-4" style={{ fontSize: '2rem' }}>Register for Easylog</h2>
              {error && <Alert variant="danger">{error}</Alert>}
              <Form onSubmit={handleRegister}>
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
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontSize: '1.1rem' }}>Confirm Password</Form.Label>
                  <Form.Control 
                    type="password" 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    required 
                    style={inputStyle}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontSize: '1.1rem' }}>Password Hint</Form.Label>
                  <Form.Control 
                    type="text" 
                    value={hint} 
                    onChange={(e) => setHint(e.target.value)} 
                    required 
                    style={inputStyle}
                  />
                </Form.Group>
                <Button variant="primary" type="submit" className="w-100" style={{ height: '50px', fontSize: '1.1rem' }}>
                  Register
                </Button>
              </Form>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default RegisterPage;