import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, storage } from '../services/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { Container, Row, Col, Button, Form, Image } from 'react-bootstrap';
import { FaArrowLeft } from 'react-icons/fa';
import { categoryList, currencyList, paymentTypes, creditCards, debitCards, wallets } from '../data/General';

const SingleTransactionEdit = () => {
  const { transactionId } = useParams();
  const navigate = useNavigate();
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
        setEditedTransaction(data);
        setReceiptPreview(data.receipt);
        setProductImagePreview(data.productImage);
      } else {
        console.log("No such document!");
      }
    };
    fetchTransaction();
  }, [transactionId]);

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
      navigate(`/transaction/${transactionId}`);
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

  const getPaymentMethodValue = (method) => {
    if (method.type === 'Cash') return 'Cash|Cash';
    if (method.type === 'Credit Card' || method.type === 'Debit Card') {
      return `${method.type}|${method.bank} - ${method.last4}`;
    }
    if (method.type === 'E-Wallet') return `E-Wallet|${method.name}`;
    return '';
  };

  if (!editedTransaction) {
    return <p>Loading...</p>;
  }

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <Button variant="outline-primary" onClick={() => navigate(`/transaction/${transactionId}`)}>
          <FaArrowLeft /> Back
        </Button>
        <h2>Edit Transaction</h2>
        <div></div> {/* Empty div for flex spacing */}
      </div>

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

        <div className="d-flex justify-content-end mt-4">
          <Button variant="secondary" onClick={() => navigate(`/transaction/${transactionId}`)} className="me-2">
            Cancel
          </Button>
          <Button variant="primary" onClick={handleEdit}>
            Save Changes
          </Button>
        </div>
      </Form>
    </Container>
  );
};

export default SingleTransactionEdit;