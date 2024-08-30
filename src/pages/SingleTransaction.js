import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, storage } from '../services/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { Container, Row, Col, Button, Modal, Form, Image } from 'react-bootstrap';
import { FaArrowLeft, FaTimes, FaEdit, FaTrash } from 'react-icons/fa';
import { categoryList, currencyList, paymentTypes, creditCards, debitCards, wallets } from '../data/General';

const SingleTransaction = () => {
  const { transactionId } = useParams();
  const [transaction, setTransaction] = useState(null);
  const navigate = useNavigate();
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showProductImageModal, setShowProductImageModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editedTransaction, setEditedTransaction] = useState(null);
  const [newReceipt, setNewReceipt] = useState(null);
  const [newProductImage, setNewProductImage] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [productImagePreview, setProductImagePreview] = useState(null);

  useEffect(() => {
    const fetchTransaction = async () => {
      const docRef = doc(db, 'expenses', transactionId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = { id: docSnap.id, ...docSnap.data() };
        setTransaction(data);
        setEditedTransaction(data);
        setReceiptPreview(data.receipt);
        setProductImagePreview(data.productImage);
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

  const handleImageUpload = async (file, setProgress) => {
    if (!file) return null;

    const storageRef = ref(storage, `images/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(progress);
        },
        (error) => {
          console.error('Upload error:', error);
          reject(error);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        }
      );
    });
  };

  const handleEdit = async () => {
    try {
      let updatedTransaction = { ...editedTransaction };

      if (newReceipt) {
        const receiptURL = await handleImageUpload(newReceipt, () => {});
        updatedTransaction.receipt = receiptURL;
      }

      if (newProductImage) {
        const productImageURL = await handleImageUpload(newProductImage, () => {});
        updatedTransaction.productImage = productImageURL;
      }

      await updateDoc(doc(db, 'expenses', transactionId), updatedTransaction);
      setTransaction(updatedTransaction);
      setShowEditModal(false);
    } catch (error) {
      console.error("Error updating transaction:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedTransaction(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePaymentMethodChange = (e) => {
    const [type, value] = e.target.value.split('|');
    let paymentMethod = { type };

    if (type === 'Credit Card' || type === 'Debit Card') {
      const [bank, last4] = value.split('-');
      paymentMethod = { ...paymentMethod, bank: bank.trim(), last4: last4.trim() };
    } else if (type === 'E-Wallet') {
      paymentMethod = { ...paymentMethod, name: value };
    }

    setEditedTransaction(prev => ({
      ...prev,
      paymentMethod
    }));
  };

  const handleFileChange = (e, setFile, setPreview) => {
    const file = e.target.files[0];
    if (file) {
      setFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
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

  const getPaymentMethodValue = (method) => {
    if (method.type === 'Cash') return 'Cash|Cash';
    if (method.type === 'Credit Card' || method.type === 'Debit Card') {
      return `${method.type}|${method.bank} - ${method.last4}`;
    }
    if (method.type === 'E-Wallet') return `E-Wallet|${method.name}`;
    return '';
  };

  return (
    <Container className="mt-4">
      <Button variant="outline-primary" onClick={() => navigate(-1)} className="mb-3">
        <FaArrowLeft /> Back
      </Button>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Transaction Details</h2>
        <div>
          <Button variant="warning" onClick={() => setShowEditModal(true)} className="me-2">
            <FaEdit /> Edit
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            <FaTrash /> Delete
          </Button>
        </div>
      </div>

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
        <Col><strong>Payment Method:</strong> {transaction.paymentMethod.type === 'Cash' ? 'Cash' :
          transaction.paymentMethod.type === 'E-Wallet' ? transaction.paymentMethod.name :
          `${transaction.paymentMethod.type}: ${transaction.paymentMethod.last4}`}
        </Col>
      </Row>
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

      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Transaction</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Date</Form.Label>
              <Form.Control 
                type="datetime-local" 
                name="date"
                value={editedTransaction?.date ? new Date(editedTransaction.date).toISOString().slice(0, 16) : ''}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Select 
                name="categoryId"
                value={editedTransaction?.categoryId || ''}
                onChange={handleInputChange}
              >
                {categoryList.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </Form.Select>
            </Form.Group>

            <Row>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Amount</Form.Label>
                  <Form.Control 
                    type="number" 
                    name="amount"
                    value={editedTransaction?.amount || ''}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Currency</Form.Label>
                  <Form.Select 
                    name="fromCurrency"
                    value={editedTransaction?.fromCurrency || ''}
                    onChange={handleInputChange}
                  >
                    {currencyList.map(currency => (
                      <option key={currency.code} value={currency.code}>{currency.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Payment Method</Form.Label>
              <Form.Select 
                value={getPaymentMethodValue(editedTransaction?.paymentMethod)}
                onChange={handlePaymentMethodChange}
              >
                <option value="Cash|Cash">Cash</option>
                {creditCards.map((card, index) => (
                  <option key={`credit-${index}`} value={`Credit Card|${card.bank} - ${card.last4}`}>
                    Credit Card: {card.bank} - {card.last4}
                  </option>
                ))}
                {debitCards.map((card, index) => (
                  <option key={`debit-${index}`} value={`Debit Card|${card.bank} - ${card.last4}`}>
                    Debit Card: {card.bank} - {card.last4}
                  </option>
                ))}
                {wallets.map((wallet, index) => (
                  <option key={`wallet-${index}`} value={`E-Wallet|${wallet.name}`}>
                    E-Wallet: {wallet.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={3}
                name="description"
                value={editedTransaction?.description || ''}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Receipt</Form.Label>
              <Form.Control 
                type="file"
                onChange={(e) => handleFileChange(e, setNewReceipt, setReceiptPreview)}
              />
              {receiptPreview && (
                <Image src={receiptPreview} alt="Receipt preview" fluid className="mt-2" style={{ maxHeight: '200px' }} />
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Product Image</Form.Label>
              <Form.Control 
                type="file"
                onChange={(e) => handleFileChange(e, setNewProductImage, setProductImagePreview)}
              />
              {productImagePreview && (
                <Image src={productImagePreview} alt="Product image preview" fluid className="mt-2" style={{ maxHeight: '200px' }} />
              )}
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleEdit}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default SingleTransaction;