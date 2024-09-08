import React from 'react';
import { Button, Container, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../services/firebase';
import { FaGoogle } from 'react-icons/fa';

const NonLoginHome = () => {
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate('/');
    } catch (error) {
      console.error("Google login error:", error);
    }
  };

  const buttonStyle = {
    height: '60px',
    fontSize: '1.2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  return (
    <Container fluid className="vh-100 d-flex flex-column justify-content-center align-items-center" style={{ backgroundColor: '#e4d4cc' }}>
      <div className="text-center mb-4">
        <img src="../img/logo512.png" alt="Logo" style={{ maxWidth: '200px', maxHeight: '200px' }} />
      </div>
      <h1 className="mb-4" style={{ fontSize: '2rem' }}>Welcome to Easylog</h1>
      <Row className="w-100 justify-content-center">
        <Col xs={12} md={4} className="mb-3 mb-md-0">
          <Button 
            variant="primary" 
            onClick={() => navigate('/register')} 
            className="w-100" 
            style={buttonStyle}
          >
            Register
          </Button>
        </Col>
        <Col xs={12} md={4} className="mb-3 mb-md-0">
          <Button 
            variant="outline-primary" 
            onClick={() => navigate('/login')} 
            className="w-100" 
            style={buttonStyle}
          >
            Email Login
          </Button>
        </Col>
        <Col xs={12} md={4}>
          <Button 
            variant="danger" 
            onClick={handleGoogleLogin} 
            className="w-100" 
            style={buttonStyle}
          >
            <FaGoogle className="me-2" />
            Login with Google
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default NonLoginHome;