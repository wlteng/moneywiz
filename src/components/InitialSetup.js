import React, { useState, useEffect } from 'react';
import { Container, Form, ListGroup, Modal, Alert, InputGroup, Badge, Button } from 'react-bootstrap';
import { auth, db } from '../services/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { currencyList, defaultCategory, investmentPlatforms } from '../data/General';
import { HexColorPicker } from 'react-colorful';
import { FaPlus, FaEdit, FaTrash, FaUpload } from 'react-icons/fa';

const InitialSetup = () => {
  const [user, setUser] = useState(null);
  const [mainCurrency, setMainCurrency] = useState('USD');
  const [favoriteCurrencies, setFavoriteCurrencies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [tags, setTags] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editCategoryIndex, setEditCategoryIndex] = useState(null);
  const [newCategory, setNewCategory] = useState({ name: '', color: '#000000' });

  const [showPaymentMethodModal, setShowPaymentMethodModal] = useState(false);
  const [editPaymentMethodIndex, setEditPaymentMethodIndex] = useState(null);
  const [newPaymentMethod, setNewPaymentMethod] = useState({ 
    type: 'Credit Card', 
    details: {},
    linkedCard: null
  });

  const [showPlatformModal, setShowPlatformModal] = useState(false);
  const [editPlatformIndex, setEditPlatformIndex] = useState(null);
  const [newPlatform, setNewPlatform] = useState('');

  const [showTagModal, setShowTagModal] = useState(false);
  const [editTagIndex, setEditTagIndex] = useState(null);
  const [newTag, setNewTag] = useState('');

  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedCategoryForColor, setSelectedCategoryForColor] = useState(null);

  const [showLoadCategoriesModal, setShowLoadCategoriesModal] = useState(false);
  const [categoriesToLoad, setCategoriesToLoad] = useState([]);

  const [showLoadPlatformsModal, setShowLoadPlatformsModal] = useState(false);
  const [platformsToLoad, setPlatformsToLoad] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('');

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
        setTags(userData.tags || []);
        
        // Set the selected country based on the main currency
        const currencyInfo = currencyList.find(c => c.code === userData.mainCurrency);
        setSelectedCountry(currencyInfo ? currencyInfo.country : '');
      }
    } catch (err) {
      setError('Failed to fetch user data');
    }
  };

  const saveUserData = async (data) => {
    try {
      if (user) {
        await updateDoc(doc(db, 'users', user.uid), data);
        setSuccess('Settings updated successfully');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError('Failed to save settings');
    }
  };

  const handleMainCurrencyChange = (e) => {
    const newMainCurrency = e.target.value;
    setMainCurrency(newMainCurrency);
    
    // Update selected country when main currency changes
    const currencyInfo = currencyList.find(c => c.code === newMainCurrency);
    setSelectedCountry(currencyInfo ? currencyInfo.country : '');
    
    saveUserData({ mainCurrency: newMainCurrency });
  };

  const handleFavoriteCurrencyChange = (e) => {
    const newFavoriteCurrencies = Array.from(e.target.selectedOptions, option => option.value);
    setFavoriteCurrencies(newFavoriteCurrencies);
    saveUserData({ favoriteCurrencies: newFavoriteCurrencies });
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
    saveUserData({ categories: updatedCategories });
    setShowCategoryModal(false);
    setNewCategory({ name: '', color: '#000000' });
    setEditCategoryIndex(null);
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
    saveUserData({ paymentMethods: updatedMethods });
    setShowPaymentMethodModal(false);
    setNewPaymentMethod({ type: 'Credit Card', details: {}, linkedCard: null });
    setEditPaymentMethodIndex(null);
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
    saveUserData({ investmentPlatforms: updatedPlatforms });
    setShowPlatformModal(false);
    setNewPlatform('');
    setEditPlatformIndex(null);
  };

  const handleAddOrUpdateTag = () => {
    let updatedTags;
    if (editTagIndex !== null) {
      updatedTags = [...tags];
      updatedTags[editTagIndex] = newTag;
    } else {
      updatedTags = [...tags, newTag];
    }
    setTags(updatedTags);
    saveUserData({ tags: updatedTags });
    setShowTagModal(false);
    setNewTag('');
    setEditTagIndex(null);
  };

  const handleDelete = (item, type) => {
    setItemToDelete({ item, type });
    setShowDeleteConfirmModal(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      let updatedData;
      if (itemToDelete.type === 'category') {
        updatedData = categories.filter(cat => cat !== itemToDelete.item);
        setCategories(updatedData);
        saveUserData({ categories: updatedData });
      } else if (itemToDelete.type === 'paymentMethod') {
        updatedData = paymentMethods.filter(method => method !== itemToDelete.item);
        setPaymentMethods(updatedData);
        saveUserData({ paymentMethods: updatedData });
      } else if (itemToDelete.type === 'platform') {
        updatedData = platforms.filter(platform => platform !== itemToDelete.item);
        setPlatforms(updatedData);
        saveUserData({ investmentPlatforms: updatedData });
      } else if (itemToDelete.type === 'tag') {
        updatedData = tags.filter(tag => tag !== itemToDelete.item);
        setTags(updatedData);
        saveUserData({ tags: updatedData });
      }
    }
    setShowDeleteConfirmModal(false);
    setItemToDelete(null);
  };

  const getPaymentMethodBadgeColor = (type) => {
    switch (type) {
      case 'E-Wallet': return 'primary';
      case 'Debit Card': return 'success';
      case 'Credit Card': return 'danger';
      case 'Platform': return 'warning';
      case 'Cash': return 'secondary';
      default: return 'secondary';
    }
  };

  const getPaymentMethodDisplay = (method) => {
    if (method.type === 'Platform') {
      return `${method.details.name} (${method.linkedCard})`;
    }
    if (method.type === 'E-Wallet') {
      return method.details.name;
    }
    if (method.type === 'Credit Card' || method.type === 'Debit Card') {
      return `${method.type}: ${method.details.bank} - ${method.details.last4}`;
    }
    return method.type;
  };

  const handleLoadCategories = () => {
    const categoriesToLoad = defaultCategory.map(defaultCat => {
      const existingCategory = categories.find(cat => cat.id === defaultCat.id);
      return {
        ...defaultCat,
        selected: !!existingCategory,
        existing: !!existingCategory
      };
    });
    setCategoriesToLoad(categoriesToLoad);
    setShowLoadCategoriesModal(true);
  };

  const handleLoadSelectedCategories = () => {
    const selectedCategories = categoriesToLoad.filter(cat => cat.selected && !cat.existing);
    const updatedCategories = [...categories, ...selectedCategories];
    setCategories(updatedCategories);
    saveUserData({ categories: updatedCategories });
    setShowLoadCategoriesModal(false);
  };

  const handleLoadPlatforms = () => {
    const platformsToLoad = investmentPlatforms.find(country => country.country === selectedCountry)?.platforms || [];
    setPlatformsToLoad(platformsToLoad.map(platform => ({
      name: platform,
      selected: platforms.includes(platform),
      existing: platforms.includes(platform)
    })));
    setShowLoadPlatformsModal(true);
  };

  const handleLoadSelectedPlatforms = () => {
    const selectedPlatforms = platformsToLoad.filter(platform => platform.selected && !platform.existing).map(platform => platform.name);
    const updatedPlatforms = [...platforms, ...selectedPlatforms];
    setPlatforms(updatedPlatforms);
    saveUserData({ investmentPlatforms: updatedPlatforms });
    setShowLoadPlatformsModal(false);
  };

  return (
    <Container className="mt-4">
      {success && (
        <Alert 
          variant="success" 
          style={{
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            padding: '10px 20px',
            borderRadius: '5px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
          }}
        >
          {success}
        </Alert>
      )}

      <h2>Initial Setup</h2>
      {error && <Alert variant="danger">{error}</Alert>}

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
          <div>
            <FaUpload onClick={handleLoadCategories} style={{ cursor: 'pointer', marginRight: '10px' }} />
            <FaPlus onClick={() => setShowCategoryModal(true)} style={{ cursor: 'pointer' }} />
          </div>
        </div>
        <ListGroup className="mb-3">
          {categories.map((category, index) => (
            <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div
                  style={{
                    width: '30px',
                    height: '30px',
                    backgroundColor: `${category.color}B3`,
                    marginRight: '10px',
                    borderRadius: '4px'
                  }}
                />
                {category.name}
              </div>
              <div>
                <Button variant="outline-primary" size="sm" onClick={() => {
                  setEditCategoryIndex(index);
                  setNewCategory(categories[index]);
                  setShowCategoryModal(true);
                }} className="me-2">
                  <FaEdit />
                </Button>
                <Button variant="outline-danger" size="sm" onClick={() => handleDelete(category, 'category')}>
                  <FaTrash />
                </Button>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>

        <div className="d-flex justify-content-between align-items-center">
          <h3 className="mt-3">Payment Methods</h3>
          <FaPlus onClick={() => setShowPaymentMethodModal(true)} style={{ cursor: 'pointer' }} />
        </div>
        <ListGroup className="mb-3">
          {paymentMethods.map((method, index) => (
            <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
              <Badge bg={getPaymentMethodBadgeColor(method.type)}>
                {getPaymentMethodDisplay(method)}
              </Badge>
              <div>
                <Button variant="outline-primary" size="sm" onClick={() => {
                  setEditPaymentMethodIndex(index);
                  setNewPaymentMethod(paymentMethods[index]);
                  setShowPaymentMethodModal(true);
                }} className="me-2">
                  <FaEdit />
                </Button>
                <Button variant="outline-danger" size="sm" onClick={() => handleDelete(method, 'paymentMethod')}>
                  <FaTrash />
                </Button>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>

        <div className="d-flex justify-content-between align-items-center">
          <h3 className="mt-3">Investment Platforms</h3>
          <div>
            <FaUpload onClick={handleLoadPlatforms} style={{ cursor: 'pointer', marginRight: '10px' }} />
            <FaPlus onClick={() => setShowPlatformModal(true)} style={{ cursor: 'pointer' }} />
          </div>
        </div>
        <ListGroup className="mb-3">
          {platforms.map((platform, index) => (
            <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
              {platform}
              <div>
                <Button variant="outline-primary" size="sm" onClick={() => {
                  setEditPlatformIndex(index);
                  setNewPlatform(platforms[index]);
                  setShowPlatformModal(true);
                }} className="me-2">
                  <FaEdit />
                </Button>
                <Button variant="outline-danger" size="sm" onClick={() => handleDelete(platform, 'platform')}>
                  <FaTrash />
                </Button>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>

        <div className="d-flex justify-content-between align-items-center">
          <h3 className="mt-3">Tags</h3>
          <FaPlus onClick={() => setShowTagModal(true)} style={{ cursor: 'pointer' }} />
        </div>
        <ListGroup className="mb-3">
          {tags.map((tag, index) => (
            <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
              {tag}
              <div>
                <Button variant="outline-primary" size="sm" onClick={() => {
                  setEditTagIndex(index);
                  setNewTag(tags[index]);
                  setShowTagModal(true);
                }} className="me-2">
                  <FaEdit />
                </Button>
                <Button variant="outline-danger" size="sm" onClick={() => handleDelete(tag, 'tag')}>
                  <FaTrash />
                </Button>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
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
                    cursor: 'pointer',
                    borderRadius: '4px'
                  }}
                  onClick={() => {
                    setSelectedCategoryForColor(newCategory);
                    setShowColorPicker(true);
                  }}
                />
              </InputGroup.Text>
            </InputGroup>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCategoryModal(false)}>Close</Button>
          <Button variant="primary" onClick={handleAddOrUpdateCategory}>
            {editCategoryIndex !== null ? 'Update' : 'Add'}
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
              onChange={(e) => setNewPaymentMethod({ ...newPaymentMethod, type: e.target.value, details: {}, linkedCard: null })}
            >
              <option value="Credit Card">Credit Card</option>
              <option value="Debit Card">Debit Card</option>
              <option value="E-Wallet">E-Wallet</option>
              <option value="Platform">Platform</option>
            </Form.Select>
          </Form.Group>
          {newPaymentMethod.type !== 'E-Wallet' && newPaymentMethod.type !== 'Platform' && (
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
          {(newPaymentMethod.type === 'E-Wallet' || newPaymentMethod.type === 'Platform') && (
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Enter name"
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
          {newPaymentMethod.type === 'Platform' && (
            <Form.Group className="mb-3">
              <Form.Label>Linked Card</Form.Label>
              <Form.Select
                value={newPaymentMethod.linkedCard || ''}
                onChange={(e) => setNewPaymentMethod({
                  ...newPaymentMethod,
                  linkedCard: e.target.value
                })}
              >
                <option value="">Select a linked card</option>
                {paymentMethods.filter(method => method.type === 'Credit Card' || method.type === 'Debit Card').map((card, index) => (
                  <option key={index} value={`${card.type}-${card.details.last4}`}>
                    {`${card.type}: ${card.details.bank} - ${card.details.last4}`}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPaymentMethodModal(false)}>Close</Button>
          <Button variant="primary" onClick={handleAddOrUpdatePaymentMethod}>
            {editPaymentMethodIndex !== null ? 'Update' : 'Add'}
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
            {editPlatformIndex !== null ? 'Update' : 'Add'}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showTagModal} onHide={() => setShowTagModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editTagIndex !== null ? 'Edit Tag' : 'Add Tag'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Control
            type="text"
            placeholder="Enter tag name"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowTagModal(false)}>Close</Button>
          <Button variant="primary" onClick={handleAddOrUpdateTag}>
            {editTagIndex !== null ? 'Update' : 'Add'}
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
            saveUserData({ categories: updatedCategories });
            setShowColorPicker(false);
          }}>
            Save Color
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showLoadCategoriesModal} onHide={() => setShowLoadCategoriesModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Load Categories</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {categoriesToLoad.map((category, index) => (
            <Form.Check 
              key={index}
              type="checkbox"
              id={`category-${category.id}`}
              label={category.name}
              checked={category.selected}
              disabled={category.existing}
              onChange={() => {
                const updatedCategories = [...categoriesToLoad];
                updatedCategories[index].selected = !updatedCategories[index].selected;
                setCategoriesToLoad(updatedCategories);
              }}
            />
          ))}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowLoadCategoriesModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleLoadSelectedCategories}>Load Selected</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showLoadPlatformsModal} onHide={() => setShowLoadPlatformsModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Load Investment Platforms</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Country</Form.Label>
            <Form.Select 
              value={selectedCountry} 
              onChange={(e) => {
                setSelectedCountry(e.target.value);
                const platformsToLoad = investmentPlatforms.find(country => country.country === e.target.value)?.platforms || [];
                setPlatformsToLoad(platformsToLoad.map(platform => ({
                  name: platform,
                  selected: platforms.includes(platform),
                  existing: platforms.includes(platform)
                })));
              }}
            >
              <option value="">Select a country</option>
              {investmentPlatforms.map((country, index) => (
                <option key={index} value={country.country}>{country.country}</option>
              ))}
            </Form.Select>
          </Form.Group>
          {platformsToLoad.map((platform, index) => (
            <Form.Check 
              key={index}
              type="checkbox"
              id={`platform-${index}`}
              label={platform.name}
              checked={platform.selected}
              disabled={platform.existing}
              onChange={() => {
                const updatedPlatforms = [...platformsToLoad];
                updatedPlatforms[index].selected = !updatedPlatforms[index].selected;
                setPlatformsToLoad(updatedPlatforms);
              }}
            />
          ))}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowLoadPlatformsModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleLoadSelectedPlatforms}>Load Selected</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default InitialSetup;