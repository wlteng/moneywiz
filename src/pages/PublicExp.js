import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Modal, Nav } from 'react-bootstrap';
import { collection, query, where, getDocs, orderBy, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import { FaCheckCircle, FaFlag, FaHeart } from 'react-icons/fa';
import { AiOutlineClose } from 'react-icons/ai';  // For the close button
import './PublicExp.css';  // Importing the CSS file

const PublicExp = () => {
  const [publicTransactions, setPublicTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [mainCurrency, setMainCurrency] = useState('USD');
  const [showModal, setShowModal] = useState(false);
  const [activeImage, setActiveImage] = useState(null);
  const [activeTab, setActiveTab] = useState('product');

  useEffect(() => {
    const fetchPublicTransactions = async () => {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setMainCurrency(userSnap.data().mainCurrency || 'USD');
        }
      }

      const q = query(
        collection(db, 'expenses'),
        where('isPublic', '==', true),
        orderBy('date', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const transactions = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPublicTransactions(transactions);

      const uniqueCategories = [...new Set(transactions.map(t => t.categoryName))];
      setCategories(['All', ...uniqueCategories]);
    };

    fetchPublicTransactions();
  }, []);

  const filteredTransactions = selectedCategory === 'All'
    ? publicTransactions
    : publicTransactions.filter(t => t.categoryName === selectedCategory);

  const formatDate = (dateString) => {
    if (!dateString) return 'Invalid date';

    const date = new window.Date(dateString);  // Ensure global Date object is used
    if (isNaN(date.getTime())) return 'Invalid date';  // Handle invalid dates

    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;  // Output in format "12 Sep 2024"
  };

  const formatAmount = (amount, currency) => {
    const decimals = 2;  // Use a default of 2 decimals
    return parseFloat(amount).toFixed(decimals);
  };

  // Conversion amount calculation (placeholder logic)
  const convertAmount = (amount, fromCurrency, toCurrency = 'USD') => {
    const conversionRate = 1.2;  // Example conversion rate
    return (amount * conversionRate).toFixed(2);
  };

  const handleImageClick = (transaction) => {
    setActiveImage(transaction);
    setShowModal(true);
    setActiveTab('product');
  };

  return (
    <Container className="public-exp-container mt-4">
      <div className="public-exp-header">
        <h5>Public Expenses</h5>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="public-exp-select"
        >
          <option value="All">Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      <Row xs={1} md={2} lg={3}>
        {filteredTransactions.map((transaction) => (
          <Col key={transaction.id}>
            <div className="public-exp-card">
              <div className="public-exp-card-content">
                <div className="public-exp-text-content">
                  <div className="public-exp-category">
                    {transaction.categoryName}
                    <span className="public-exp-amount">
                      {convertAmount(transaction.amount, transaction.fromCurrency, mainCurrency)} {mainCurrency}
                    </span>
                  </div>
                  <h3 className="public-exp-title">{transaction.description}</h3>
                  <div className="public-exp-date-amount">
                    <span className="public-exp-date">{formatDate(transaction.date)}</span>
                    <div className="public-exp-icons">
                      <FaHeart className="public-exp-like" /> 20  {/* Like count */}
                      <FaFlag className="public-exp-flag" />  {/* Report flag */}
                    </div>
                  </div>
                </div>
                <div className="public-exp-image-container" onClick={() => handleImageClick(transaction)}>
                  <img 
                    className="public-exp-image"
                    src={transaction.productImage || 'placeholder-image-url'} 
                    alt="Product" 
                  />
                  {transaction.receipt && <FaCheckCircle className="public-exp-verify-badge" />}
                </div>
              </div>
            </div>
          </Col>
        ))}
      </Row>

      <Modal show={showModal} onHide={() => setShowModal(false)} className="public-exp-modal">
        <AiOutlineClose className="public-exp-close-button" onClick={() => setShowModal(false)} />
        <Modal.Body>
          <Nav variant="tabs" className="public-exp-tabs mb-3">
            <Nav.Item>
              <Nav.Link 
                active={activeTab === 'product'} 
                onClick={() => setActiveTab('product')}
                className={`public-exp-tab ${activeTab === 'product' ? 'active' : ''}`}
              >
                Product
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link 
                active={activeTab === 'receipt'} 
                onClick={() => setActiveTab('receipt')}
                className={`public-exp-tab ${activeTab === 'receipt' ? 'active' : ''}`}
                disabled={!activeImage?.receipt}
              >
                Receipt
              </Nav.Link>
            </Nav.Item>
          </Nav>
          <img 
            className="public-exp-modal-image"
            src={activeTab === 'product' ? activeImage?.productImage : activeImage?.receipt} 
            alt={activeTab === 'product' ? "Product" : "Receipt"} 
          />
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default PublicExp;