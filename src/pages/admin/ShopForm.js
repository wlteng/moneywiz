import React, { useState, useEffect } from 'react';
import { Form, Button, Container, ListGroup, Modal, Image, Row, Col } from 'react-bootstrap';
import { shopCategories } from '../../data/General'; // Corrected import path
import { db, storage } from '../../services/firebase'; // Assuming you have a firebase.js file with these exports
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { FaStore, FaEdit, FaTrash, FaPlus } from 'react-icons/fa'; // Import icons

const ShopForm = () => {
  const [shops, setShops] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [newShop, setNewShop] = useState({
    name: '',
    logo: null,
    description: '',
    category: ''
  });
  const [filterCategory, setFilterCategory] = useState('');

  useEffect(() => {
    fetchShops();
  }, []);

  const fetchShops = async () => {
    const shopsCollection = collection(db, 'shops');
    const shopSnapshot = await getDocs(shopsCollection);
    const shopList = shopSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setShops(shopList);
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'logo') {
      setNewShop({ ...newShop, [name]: files[0] });
    } else {
      setNewShop({ ...newShop, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let logoUrl = newShop.logo;

    if (newShop.logo instanceof File) {
      const storageRef = ref(storage, `shopLogos/${newShop.logo.name}`);
      await uploadBytes(storageRef, newShop.logo);
      logoUrl = await getDownloadURL(storageRef);
    }

    const shopData = {
      name: newShop.name,
      logo: logoUrl,
      description: newShop.description,
      category: newShop.category
    };

    if (editIndex !== null) {
      const shopRef = doc(db, 'shops', shops[editIndex].id);
      await updateDoc(shopRef, shopData);
    } else {
      await addDoc(collection(db, 'shops'), shopData);
    }

    setNewShop({ name: '', logo: null, description: '', category: '' });
    setShowModal(false);
    fetchShops(); // Refresh the shops list
  };

  const handleEdit = (index) => {
    setNewShop(shops[index]);
    setEditIndex(index);
    setShowModal(true);
  };

  const handleDelete = async (index) => {
    const shopId = shops[index].id;
    await deleteDoc(doc(db, 'shops', shopId));
    fetchShops(); // Refresh the shops list
  };

  const filteredShops = filterCategory
    ? shops.filter(shop => shop.category === filterCategory)
    : shops;

  return (
    <Container>
      <style>
        {`
          @media (max-width: 768px) {
            .btn-icon {
              background: none;
              border: none;
              color: #007bff;
              padding: 0;
            }
            .btn-icon:hover, .btn-icon:focus {
              color: #0056b3;
              background: none;
            }
            .btn-icon .btn-text {
              display: none;
            }
            .btn-icon.btn-danger {
              color: #dc3545;
            }
            .btn-icon.btn-danger:hover, .btn-icon.btn-danger:focus {
              color: #a71d2a;
            }
            .mobile-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .mobile-title {
              margin: 0;
            }
          }
        `}
      </style>
      <Row className="my-4 align-items-center mobile-header">
        <Col>
          <h2 className="mobile-title">Shops</h2>
        </Col>
        <Col xs="auto">
          <Form.Select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="me-2"
          >
            <option value="">All Categories</option>
            {shopCategories.map((category, index) => (
              <option key={index} value={category}>
                {category}
              </option>
            ))}
          </Form.Select>
        </Col>
        <Col xs="auto">
          <Button variant="primary" onClick={() => setShowModal(true)} className="btn-icon">
            <FaPlus />
            <span className="btn-text">Add New Shop</span>
          </Button>
        </Col>
      </Row>

      <ListGroup>
        {filteredShops.map((shop, index) => (
          <ListGroup.Item key={shop.id} className="d-flex align-items-center">
            {shop.logo ? (
              <Image 
                src={shop.logo} 
                roundedCircle 
                width={50} 
                height={50} 
                className="me-3"
                alt={`${shop.name} logo`}
              />
            ) : (
              <div className="me-3" style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                backgroundColor: '#f0f0f0',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <FaStore size={25} color="#888" />
              </div>
            )}
            <div className="flex-grow-1">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">{shop.name}</h5>
                <div>
                  <Button variant="info" className="me-2 btn-icon" onClick={() => handleEdit(index)}>
                    <FaEdit />
                    <span className="btn-text">Edit</span>
                  </Button>
                  <Button variant="danger" className="btn-icon" onClick={() => handleDelete(index)}>
                    <FaTrash />
                    <span className="btn-text">Delete</span>
                  </Button>
                </div>
              </div>
              <p className="mb-0">{shop.description}</p>
              <small>Category: {shop.category}</small>
            </div>
          </ListGroup.Item>
        ))}
      </ListGroup>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editIndex !== null ? 'Edit Shop' : 'Add New Shop'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Shop Name</Form.Label>
              <Form.Control 
                type="text" 
                name="name" 
                value={newShop.name} 
                onChange={handleInputChange} 
                required 
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Logo</Form.Label>
              <Form.Control 
                type="file" 
                name="logo" 
                onChange={handleInputChange} 
                accept="image/*"
              />
              {newShop.logo && (
                <Image 
                  src={newShop.logo instanceof File ? URL.createObjectURL(newShop.logo) : newShop.logo} 
                  thumbnail 
                  className="mt-2" 
                  style={{ maxWidth: '100px' }} 
                  alt="Shop logo preview"
                />
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control 
                as="textarea" 
                name="description" 
                value={newShop.description} 
                onChange={handleInputChange} 
                required 
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Select 
                name="category" 
                value={newShop.category} 
                onChange={handleInputChange} 
                required
              >
                <option value="">Select a category</option>
                {shopCategories.map((category, index) => (
                  <option key={index} value={category}>
                    {category}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Button variant="primary" type="submit">
              {editIndex !== null ? 'Update Shop' : 'Add Shop'}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default ShopForm;