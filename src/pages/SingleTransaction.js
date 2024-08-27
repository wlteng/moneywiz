import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Container, Row, Col, Button, Modal } from 'react-bootstrap';
import { FaArrowLeft, FaTimes } from 'react-icons/fa';

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
        setTransaction({ id: docSnap.id, ...docSnap.data() });
      } else {
        console.log("No such document!");
      }
    };
    fetchTransaction();
  }, [transactionId]);

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
      <Button variant="outline-primary" onClick={() => navigate(-1)} className="mb-3">
        <FaArrowLeft /> Back
      </Button>
      
      <h2>Transaction Details</h2>
      <Row>
        <Col><strong>Date:</strong> {new Date(transaction.date).toLocaleString()}</Col>
      </Row>
      <Row>
        <Col><strong>Category:</strong> {transaction.categoryName}</Col>
      </Row>
      <Row>
        <Col><strong>Amount:</strong> {transaction.amount} {transaction.fromCurrency}</Col>
      </Row>
      <Row>
        <Col><strong>Converted Amount:</strong> {transaction.convertedAmount} {transaction.toCurrency}</Col>
      </Row>
      <Row>
        <Col><strong>Payment Method:</strong> {transaction.paymentMethod.type}</Col>
      </Row>
      {transaction.paymentMethod.type !== 'Cash' && (
        <Row>
          <Col><strong>Payment Details:</strong> {transaction.paymentMethod.bank} - {transaction.paymentMethod.last4}</Col>
        </Row>
      )}
      <Row>
        <Col><strong>Description:</strong> {transaction.description}</Col>
      </Row>
      <Row className="mt-4">
        <Col>
          <h5>Receipt</h5>
          {transaction.receipt ? (
            <img
              src={transaction.receipt}
              alt="Receipt"
              className="img-fluid"
              style={{ maxHeight: '300px', cursor: 'pointer' }}
              onClick={() => setShowReceiptModal(true)}
            />
          ) : (
            <p>No receipt available</p>
          )}
        </Col>
        <Col>
          <h5>Product Image</h5>
          {transaction.productImage ? (
            <img
              src={transaction.productImage}
              alt="Product"
              className="img-fluid"
              style={{ maxHeight: '300px', cursor: 'pointer' }}
              onClick={() => setShowProductImageModal(true)}
            />
          ) : (
            <p>No product image available</p>
          )}
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