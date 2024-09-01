import React, { useState, useEffect } from 'react';
import { Container, Form, Button, ListGroup, Modal, Alert, InputGroup, Badge } from 'react-bootstrap';
import { auth, db } from '../services/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { currencyList } from '../data/General';
import { HexColorPicker } from 'react-colorful'; // Import HexColorPicker
import { FaPlus } from 'react-icons/fa';

const InitialSetup = () => {
  const [user, setUser] = useState(null);
  const [mainCurrency, setMainCurrency] = useState('USD');
  const [favoriteCurrencies, setFavoriteCurrencies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editCategoryIndex, setEditCategoryIndex] = useState(null);
  const [newCategory, setNewCategory] = useState({ name: '', color: '#000000' });

  const [showPaymentMethodModal, setShowPaymentMethodModal] = useState(false);
  const [editPaymentMethodIndex, setEditPaymentMethodIndex] = useState(null);
  const [newPaymentMethod, setNewPaymentMethod] = useState({ type: 'Credit Card', details: {} });

  const [showPlatformModal, setShowPlatformModal] = useState(false);
  const [editPlatformIndex, setEditPlatformIndex] = useState(null);
  const [newPlatform, setNewPlatform] = useState('');

  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedCategoryForColor, setSelectedCategoryForColor] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        fetchUserData(user.uid);
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchUserData = async (userId) => {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userData = userSnap.data();
        setMainCurrency(userData.mainCurrency || 'USD');
        setFavoriteCurrencies(userData.favoriteCurrencies || []);
        setCategories(userData.categories || []);
        setPaymentMethods(userData.paymentMethods || []);
        setPlatforms(userData.investmentPlatforms || []);
      }
    } catch (err) {
      setError('Failed to fetch user data');
    }
  };

  const handleMainCurrencyChange = (e) => {
    setMainCurrency(e.target.value);
  };

  const handleFavoriteCurrencyChange = (e) => {
    const currencies = Array.from(e.target.selectedOptions, option => option.value);
    setFavoriteCurrencies(currencies);
  };

  const handleSave = async () => {
    try {
      if (user) {
        await updateDoc(doc(db, 'users', user.uid), {
          mainCurrency,
          favoriteCurrencies,
          categories,
          paymentMethods,
          investmentPlatforms: platforms
        });
        setSuccess('Settings saved successfully');
      }
    } catch (err) {
      setError('Failed to save settings');
    }
  };

  const handleEditCategory = (index) => {
    setEditCategoryIndex(index);
    setNewCategory(categories[index]);
    setShowCategoryModal(true);
  };

  const handleAddOrUpdateCategory = () => {
    let updatedCategories;
    if (editCategoryIndex !== null) {
      updatedCategories = [...categories];
      updatedCategories[editCategoryIndex] = newCategory;
    } else {
      updatedCategories = [...categories, { ...newCategory, id: Date.now().toString() }];
    }
    setCategories(updatedCategories);
    setShowCategoryModal(false);
    setNewCategory({ name: '', color: '#000000' });
    setEditCategoryIndex(null);
  };

  const handleEditPaymentMethod = (index) => {
    setEditPaymentMethodIndex(index);
    setNewPaymentMethod(paymentMethods[index]);
    setShowPaymentMethodModal(true);
  };

  const handleAddOrUpdatePaymentMethod = () => {
    let updatedMethods;
    if (editPaymentMethodIndex !== null) {
      updatedMethods = [...paymentMethods];
      updatedMethods[editPaymentMethodIndex] = newPaymentMethod;
    } else {
      updatedMethods = [...paymentMethods, newPaymentMethod];
    }
    setPaymentMethods(updatedMethods);
    setShowPaymentMethodModal(false);
    setNewPaymentMethod({ type: 'Credit Card', details: {} });
    setEditPaymentMethodIndex(null);
  };

  const handleEditPlatform = (index) => {
    setEditPlatformIndex(index);
    setNewPlatform(platforms[index]);
    setShowPlatformModal(true);
  };

  const handleAddOrUpdatePlatform = () => {
    let updatedPlatforms;
    if (editPlatformIndex !== null) {
      updatedPlatforms = [...platforms];
      updatedPlatforms[editPlatformIndex] = newPlatform;
    } else {
      updatedPlatforms = [...platforms, newPlatform];
    }
    setPlatforms(updatedPlatforms);
    setShowPlatformModal(false);
    setNewPlatform('');
    setEditPlatformIndex(null);
  };

  const handleDelete = (item, type) => {
    setItemToDelete({ item, type });
    setShowDeleteConfirmModal(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      if (itemToDelete.type === 'category') {
        setCategories(categories.filter(cat => cat !== itemToDelete.item));
      } else if (itemToDelete.type === 'paymentMethod') {
        setPaymentMethods(paymentMethods.filter(method => method !== itemToDelete.item));
      } else if (itemToDelete.type === 'platform') {
        setPlatforms(platforms.filter(platform => platform !== itemToDelete.item));
      }
    }
    setShowDeleteConfirmModal(false);
    setItemToDelete(null);
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
      <h2>Initial Setup</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Form>
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

        <div className="d-flex justify-content-between align-items-center">
  <h3 className="mt-3">Categories</h3>
  <Button onClick={() => setShowCategoryModal(true)}>
    <FaPlus />
  </Button>
</div>
        <ListGroup className="mb-3">
          {categories.map((category, index) => (
            <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
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
                {category.name}
              </div>
              <div>
                <Button variant="light" size="sm" onClick={() => handleEditCategory(index)} className="me-2">Edit</Button>
                <Button variant="danger" size="sm" onClick={() => handleDelete(category, 'category')}>Delete</Button>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>

        <div className="d-flex justify-content-between align-items-center">
  <h3 className="mt-3">Payment Methods</h3>
  <Button onClick={() => setShowPaymentMethodModal(true)}>
    <FaPlus />
  </Button>
</div>
        <ListGroup className="mb-3">
          {paymentMethods.map((method, index) => (
            <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
              <div>
                <Badge bg={getPaymentMethodBadgeColor(method.type)}>{method.type}</Badge> - 
                {method.details.last4 ? ` ${method.details.last4} - ${method.details.bank}` : ` ${method.details.name}`}
              </div>
              <div>
                <Button variant="light" size="sm" onClick={() => handleEditPaymentMethod(index)} className="me-2">Edit</Button>
                <Button variant="danger" size="sm" onClick={() => handleDelete(method, 'paymentMethod')}>Delete</Button>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>

        <div className="d-flex justify-content-between align-items-center">
  <h3 className="mt-3">Investment Platforms</h3>
  <Button onClick={() => setShowPlatformModal(true)}>
    <FaPlus />
  </Button>
</div>
        <ListGroup className="mb-3">
          {platforms.map((platform, index) => (
            <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
              {platform}
              <div>
                <Button variant="light" size="sm" onClick={() => handleEditPlatform(index)} className="me-2">Edit</Button>
                <Button variant="danger" size="sm" onClick={() => handleDelete(platform, 'platform')}>Delete</Button>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>

        <div style={{ textAlign: 'center', marginTop: '20px', marginBottom: '20px' }}>
          <Button
            variant="primary"
            onClick={handleSave}
            style={{
              width: '100%',
              padding: '10px 20px',
              fontSize: '16px',
              borderRadius: '4px',
            }}
          >
            Save All Settings
          </Button>
        </div>
      </Form>

      {/* Modals */}
      <Modal show={showCategoryModal} onHide={() => setShowCategoryModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editCategoryIndex !== null ? 'Edit Category' : 'Add Category'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Category Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter category name"
              value={newCategory.name}
              onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Category Color</Form.Label>
            <InputGroup>
              <Form.Control
                type="text"
                value={newCategory.color}
                onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
              />
              <InputGroup.Text>
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    backgroundColor: newCategory.color,
                    border: '1px solid #000',
                  }}
                />
              </InputGroup.Text>
            </InputGroup>
            <Button
              variant="light"
              onClick={() => {
                setSelectedCategoryForColor(newCategory);
                setShowColorPicker(true);
              }}
              className="mt-2"
            >
              Pick Color
            </Button>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCategoryModal(false)}>Close</Button>
          <Button variant="primary" onClick={handleAddOrUpdateCategory}>
            {editCategoryIndex !== null ? 'Update Category' : 'Add Category'}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showPaymentMethodModal} onHide={() => setShowPaymentMethodModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editPaymentMethodIndex !== null ? 'Edit Payment Method' : 'Add Payment Method'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Type</Form.Label>
            <Form.Select 
              value={newPaymentMethod.type} 
              onChange={(e) => setNewPaymentMethod({ ...newPaymentMethod, type: e.target.value, details: {} })}
            >
              <option value="Credit Card">Credit Card</option>
              <option value="Debit Card">Debit Card</option>
              <option value="E-Wallet">E-Wallet</option>
            </Form.Select>
          </Form.Group>
          {newPaymentMethod.type !== 'E-Wallet' && (
            <>
              <Form.Group className="mb-3">
                <Form.Label>Bank Name</Form.Label>
                <Form.Control 
                  type="text" 
                  placeholder="Enter bank name"
                  value={newPaymentMethod.details.bank || ''}
                  onChange={(e) => setNewPaymentMethod({
                    ...newPaymentMethod, 
                    details: { 
                      ...newPaymentMethod.details, 
                      bank: e.target.value 
                    }
                  })}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Last 4 digits</Form.Label>
                <Form.Control 
                  type="text" 
                  placeholder="Enter last 4 digits"
                  maxLength="4"
                  value={newPaymentMethod.details.last4 || ''}
                  onChange={(e) => setNewPaymentMethod({
                    ...newPaymentMethod, 
                    details: { 
                      ...newPaymentMethod.details, 
                      last4: e.target.value 
                    }
                  })}
                />
              </Form.Group>
            </>
          )}
          {newPaymentMethod.type === 'Credit Card' && (
            <Form.Group className="mb-3">
              <Form.Label>Card Name</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Enter card name"
                value={newPaymentMethod.details.name || ''}
                onChange={(e) => setNewPaymentMethod({
                  ...newPaymentMethod, 
                  details: { 
                    ...newPaymentMethod.details, 
                    name: e.target.value 
                  }
                })}
              />
            </Form.Group>
          )}
          {newPaymentMethod.type === 'E-Wallet' && (
            <Form.Group className="mb-3">
              <Form.Label>Wallet Name</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Enter wallet name"
                value={newPaymentMethod.details.name || ''}
                onChange={(e) => setNewPaymentMethod({
                  ...newPaymentMethod, 
                  details: { 
                    ...newPaymentMethod.details, 
                    name: e.target.value 
                  }
                })}
              />
            </Form.Group>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPaymentMethodModal(false)}>Close</Button>
          <Button variant="primary" onClick={handleAddOrUpdatePaymentMethod}>
            {editPaymentMethodIndex !== null ? 'Update Payment Method' : 'Add Payment Method'}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showPlatformModal} onHide={() => setShowPlatformModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editPlatformIndex !== null ? 'Edit Investment Platform' : 'Add Investment Platform'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Control
            type="text"
            placeholder="Enter platform name"
            value={newPlatform}
            onChange={(e) => setNewPlatform(e.target.value)}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPlatformModal(false)}>Close</Button>
          <Button variant="primary" onClick={handleAddOrUpdatePlatform}>
            {editPlatformIndex !== null ? 'Update Platform' : 'Add Platform'}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showDeleteConfirmModal} onHide={() => setShowDeleteConfirmModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this item?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteConfirmModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={confirmDelete}>Delete</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showColorPicker} onHide={() => setShowColorPicker(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Choose Color for {selectedCategoryForColor?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <HexColorPicker 
            color={selectedCategoryForColor?.color} 
            onChange={(color) => {
              setNewCategory({...newCategory, color });
            }}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowColorPicker(false)}>Close</Button>
                  <Button variant="primary" onClick={() => {
  const updatedCategories = categories.map(category => 
    category.id === selectedCategoryForColor?.id ? { ...category, color: selectedCategoryForColor.color } : category
  );
  setCategories(updatedCategories);
  setShowColorPicker(false);
}}>
  Save Color
</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default InitialSetup;