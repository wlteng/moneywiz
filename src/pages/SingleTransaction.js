import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Container, Row, Col, Button, Modal, Alert } from 'react-bootstrap';
import { FaArrowLeft, FaTimes, FaEdit, FaTrash, FaReceipt, FaImage } from 'react-icons/fa';

const ImagePlaceholder = ({ icon: Icon, text }) => (
  <div 
    style={{
      width: '100%',
      height: '300px',
      backgroundColor: '#f8f9fa',
      borderRadius: '10px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      color: '#6c757d',
      border: '2px dashed #ced4da'
    }}
  >
    <Icon size={48} />
    <p className="mt-2 text-center">{text}</p>
  </div>
);

const SingleTransaction = () => {
  const { transactionId } = useParams();
  const [transaction, setTransaction] = useState(null);
  const navigate = useNavigate();
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showProductImageModal, setShowProductImageModal] = useState(false);

  useEffect(() => {
    const fetchTransaction = async () => {
      const docRef = doc(db, 'expenses', transactionId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = { id: docSnap.id, ...docSnap.data() };
        setTransaction(data);
      } else {
        console.log("No such document!");
      }
    };
    fetchTransaction();
  }, [transactionId]);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      try {
        await deleteDoc(doc(db, 'expenses', transactionId));
        navigate('/transactions');
      } catch (error) {
        console.error("Error deleting transaction:", error);
      }
    }
  };

  const getPaymentMethodDetails = (method) => {
    if (method.type === 'Cash') return 'Cash';
    if (method.type === 'E-Wallet') return `${method.type}: ${method.details.name}`;
    if (method.type === 'Credit Card' || method.type === 'Debit Card') {
      return (
        <>
          {method.type}
          <br />
          <span className="text-muted">{method.details.bank} - {method.details.last4}</span>
        </>
      );
    }
    return 'Unknown payment method';
  };

  if (!transaction) {
    return <p>Loading...</p>;
  }

  const ImageModal = ({ show, onHide, imageUrl, alt }) => (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Body className="text-center p-0">
        <img src={imageUrl} alt={alt} style={{ maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain' }} />
        <Button variant="link" className="position-absolute top-0 end-0 text-white" onClick={onHide}>
          <FaTimes size={24} />
        </Button>
      </Modal.Body>
    </Modal>
  );

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <Button variant="outline-primary" onClick={() => navigate('/transactions')}>
          <FaArrowLeft /> Back
        </Button>
        <div>
          <Button variant="warning" onClick={() => navigate(`/transaction/${transactionId}/edit`)} className="me-2">
            <FaEdit />
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            <FaTrash />
          </Button>
        </div>
      </div>

      <h2 className="mb-4">Transaction Details</h2>

      <Row className="mb-2">
        <Col><strong>Date:</strong> {new Date(transaction.date).toLocaleString()}</Col>
      </Row>
      <Row className="mb-2">
        <Col><strong>Category:</strong> {transaction.categoryName}</Col>
      </Row>
      <Row className="mb-2">
        <Col><strong>Amount:</strong> {transaction.amount} {transaction.fromCurrency}</Col>
      </Row>
      <Row className="mb-2">
        <Col><strong>Converted Amount:</strong> {transaction.convertedAmount} {transaction.toCurrency}</Col>
      </Row>
      <Row className="mb-2">
        <Col>
          <strong>Payment Method:</strong> 
          <div>{getPaymentMethodDetails(transaction.paymentMethod)}</div>
        </Col>
      </Row>
      <Row className="mb-4">
        <Col>
          <strong>Description:</strong> 
          {transaction.description ? (
            transaction.description
          ) : (
            <Alert variant="warning" className="mt-2">
              No description provided
            </Alert>
          )}
        </Col>
      </Row>
      <Row className="mt-4">
        <Col xs={12} lg={6} className="mb-3 mb-lg-0">
          <h5>Receipt</h5>
          <div style={{ height: '300px', width: '100%', overflow: 'hidden', borderRadius: '10px' }}>
            {transaction.receipt ? (
              <img
                src={transaction.receipt}
                alt="Receipt"
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover', 
                  cursor: 'pointer'
                }}
                onClick={() => setShowReceiptModal(true)}
              />
            ) : (
              <ImagePlaceholder icon={FaReceipt} text="No receipt available" />
            )}
          </div>
        </Col>
        <Col xs={12} lg={6}>
          <h5>Product Image</h5>
          <div style={{ height: '300px', width: '100%', overflow: 'hidden', borderRadius: '10px' }}>
            {transaction.productImage ? (
              <img
                src={transaction.productImage}
                alt="Product"
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover', 
                  cursor: 'pointer'
                }}
                onClick={() => setShowProductImageModal(true)}
              />
            ) : (
              <ImagePlaceholder icon={FaImage} text="No product image available" />
            )}
          </div>
        </Col>
      </Row>

      <ImageModal 
        show={showReceiptModal} 
        onHide={() => setShowReceiptModal(false)} 
        imageUrl={transaction.receipt} 
        alt="Receipt" 
      />

      <ImageModal 
        show={showProductImageModal} 
        onHide={() => setShowProductImageModal(false)} 
        imageUrl={transaction.productImage} 
        alt="Product" 
      />
    </Container>
  );
};

export default SingleTransaction;