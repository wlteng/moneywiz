import React, { useState, useEffect } from 'react';
import { auth, db } from '../services/firebase';
import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { currencyList } from '../data/General';
import { Container, Form, Button, Modal, ListGroup, Badge, InputGroup } from 'react-bootstrap';
import { HexColorPicker } from 'react-colorful';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const [mainCurrency, setMainCurrency] = useState('USD');
  const [favoriteCurrencies, setFavoriteCurrencies] = useState([]);
  const [userCategories, setUserCategories] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [showPaymentMethodModal, setShowPaymentMethodModal] = useState(false);
  const [newPaymentMethod, setNewPaymentMethod] = useState({ type: 'Credit Card', details: {} });
  
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedCategoryForColor, setSelectedCategoryForColor] = useState(null);
  const [editingCategoryId, setEditingCategoryId] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        fetchUserData(user.uid);
      } else {
        setUser(null);
        resetUserData();
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchUserData = async (userId) => {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const userData = userSnap.data();
      setMainCurrency(userData.mainCurrency || 'USD');
      setFavoriteCurrencies(userData.favoriteCurrencies || []);
      setUserCategories(userData.categories || []);
      setPaymentMethods(userData.paymentMethods || []);
    } else {
      await setDoc(userRef, {
        mainCurrency: 'USD',
        favoriteCurrencies: [],
        categories: [],
        paymentMethods: []
      });
    }
  };

  const resetUserData = () => {
    setMainCurrency('USD');
    setFavoriteCurrencies([]);
    setUserCategories([]);
    setPaymentMethods([]);
  };

  const handleMainCurrencyChange = async (e) => {
    const currency = e.target.value;
    setMainCurrency(currency);
    if (user) {
      await updateDoc(doc(db, 'users', user.uid), { mainCurrency: currency });
    }
  };

  const handleFavoriteCurrencyChange = async (e) => {
    const currencies = Array.from(e.target.selectedOptions, option => option.value);
    setFavoriteCurrencies(currencies);
    if (user) {
      await updateDoc(doc(db, 'users', user.uid), { favoriteCurrencies: currencies });
    }
  };

  const handleAddCategory = async () => {
    if (newCategory.trim() && user) {
      const updatedCategories = [
        ...userCategories,
        { id: Date.now().toString(), name: newCategory.trim(), color: '#000000' }
      ];
      setUserCategories(updatedCategories);
      await updateDoc(doc(db, 'users', user.uid), { categories: updatedCategories });
      setNewCategory('');
      setShowCategoryModal(false);
    }
  };

  const handleEditCategory = async (id, newName) => {
    const updatedCategories = userCategories.map(category => 
      category.id === id ? { ...category, name: newName } : category
    );
    setUserCategories(updatedCategories);
    await updateDoc(doc(db, 'users', user.uid), { categories: updatedCategories });
    setEditingCategoryId(null);
  };

  const handleCategoryColorChange = async (color) => {
    const updatedCategories = userCategories.map(category => 
      category.id === selectedCategoryForColor.id ? { ...category, color: color } : category
    );
    setUserCategories(updatedCategories);
    await updateDoc(doc(db, 'users', user.uid), { categories: updatedCategories });
  };

  const handleAddPaymentMethod = async () => {
    if (user) {
      const updatedMethods = [...paymentMethods, newPaymentMethod];
      setPaymentMethods(updatedMethods);
      await updateDoc(doc(db, 'users', user.uid), { paymentMethods: updatedMethods });
      setShowPaymentMethodModal(false);
      setNewPaymentMethod({ type: 'Credit Card', details: {} });
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      setError(error.message);
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
      default:
        return 'secondary';
    }
  };

  return (
    <Container className="mt-4">
      <h2>Profile</h2>
      {user ? (
        <>
          <p>Logged in as: {user.email}</p>
          <Button variant="danger" onClick={handleLogout} className="mb-3">Logout</Button>
          
          <h3>Currency Settings</h3>
          <Form.Group className="mb-3">
            <Form.Label>Main Currency</Form.Label>
            <Form.Select value={mainCurrency} onChange={handleMainCurrencyChange}>
              {currencyList.map(currency => (
                <option key={currency.code} value={currency.code}>{currency.name}</option>
              ))}
            </Form.Select>
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Favorite Currencies</Form.Label>
            <Form.Select multiple value={favoriteCurrencies} onChange={handleFavoriteCurrencyChange}>
              {currencyList.map(currency => (
                <option key={currency.code} value={currency.code}>{currency.name}</option>
              ))}
            </Form.Select>
          </Form.Group>
          
          <h3>Categories</h3>
          <ListGroup className="mb-3">
            {userCategories.map((category) => (
              <ListGroup.Item key={category.id} className="d-flex justify-content-between align-items-center">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div 
                    style={{ 
                      width: '20px', 
                      height: '20px', 
                      backgroundColor: category.color, 
                      marginRight: '10px',
                      border: '1px solid #000'
                    }} 
                  />
                  {editingCategoryId === category.id ? (
                    <InputGroup>
                      <Form.Control
                        type="text"
                        defaultValue={category.name}
                        onBlur={(e) => handleEditCategory(category.id, e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleEditCategory(category.id, e.target.value);
                          }
                        }}
                      />
                    </InputGroup>
                  ) : (
                    <span onClick={() => setEditingCategoryId(category.id)}>{category.name}</span>
                  )}
                </div>
                <Button
                  variant="light"
                  size="sm"
                  onClick={() => {
                    setSelectedCategoryForColor(category);
                    setShowColorPicker(true);
                  }}
                >
                  Edit Color
                </Button>
              </ListGroup.Item>
            ))}
          </ListGroup>
          <Button onClick={() => setShowCategoryModal(true)}>Add Category</Button>
          
          <h3 className="mt-3">Payment Methods</h3>
          <ListGroup className="mb-3">
            {paymentMethods.map((method, index) => (
              <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
                <Badge bg={getPaymentMethodBadgeColor(method.type)}>{method.type}</Badge>
                <span>{method.details.bank} - {method.details.last4}</span>
              </ListGroup.Item>
            ))}
          </ListGroup>
          <Button onClick={() => setShowPaymentMethodModal(true)}>Add Payment Method</Button>
        </>
      ) : (
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </Form.Group>
          <Button variant="primary" onClick={handleLogin} className="me-2">Login</Button>
          <Button variant="secondary" onClick={handleRegister} className="me-2">Register</Button>
          <Button variant="info" onClick={handleGoogleLogin}>Login with Google</Button>
        </Form>
      )}

      {error && <p className="text-danger mt-3">{error}</p>}

      <Modal show={showCategoryModal} onHide={() => setShowCategoryModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Category</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Control
            type="text"
            placeholder="Enter category name"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCategoryModal(false)}>Close</Button>
          <Button variant="primary" onClick={handleAddCategory}>Add Category</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showPaymentMethodModal} onHide={() => setShowPaymentMethodModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Payment Method</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Type</Form.Label>
            <Form.Select 
              value={newPaymentMethod.type} 
              onChange={(e) => setNewPaymentMethod({...newPaymentMethod, type: e.target.value})}
            >
              <option value="Credit Card">Credit Card</option>
              <option value="Debit Card">Debit Card</option>
              <option value="E-Wallet">E-Wallet</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Bank Name</Form.Label>
            <Form.Control 
              type="text" 
              placeholder="Enter bank name"
              onChange={(e) => setNewPaymentMethod({...newPaymentMethod, details: {...newPaymentMethod.details, bank: e.target.value}})}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Last 4 digits</Form.Label>
            <Form.Control 
              type="text" 
              placeholder="Enter last 4 digits"
              maxLength="4"
              onChange={(e) => setNewPaymentMethod({...newPaymentMethod, details: {...newPaymentMethod.details, last4: e.target.value}})}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPaymentMethodModal(false)}>Close</Button>
          <Button variant="primary" onClick={handleAddPaymentMethod}>Add Payment Method</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showColorPicker} onHide={() => setShowColorPicker(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Choose Color for {selectedCategoryForColor?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <HexColorPicker 
            color={selectedCategoryForColor?.color} 
            onChange={handleCategoryColorChange}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowColorPicker(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Profile;