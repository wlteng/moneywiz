import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, storage } from '../services/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { Container, Row, Col, Button, Form, Image, ProgressBar } from 'react-bootstrap';
import { FaCloudUploadAlt, FaArrowLeft } from 'react-icons/fa';
import { currencyList, getConvertedAmount } from '../data/General';
import imageCompression from 'browser-image-compression';

const UploadBox = ({ label, onChange, preview, progress }) => (
  <div className="upload-box border rounded p-3 text-center" style={{ height: '150px', cursor: 'pointer' }}>
    <input
      type="file"
      onChange={onChange}
      style={{ display: 'none' }}
      id={`file-input-${label}`}
      accept="image/*"
    />
    <label htmlFor={`file-input-${label}`} style={{ cursor: 'pointer', height: '100%', width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      {preview ? (
        <Image src={preview} alt={`${label} preview`} fluid style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
      ) : (
        <>
          <FaCloudUploadAlt size={30} color="#6c63ff" />
          <p className="mt-2 mb-0" style={{ color: '#6c63ff', fontSize: '0.9rem' }}>{label}</p>
          <p className="text-muted small" style={{ fontSize: '0.7rem' }}>(Max. 25 MB)</p>
        </>
      )}
    </label>
    {progress > 0 && progress < 100 && (
      <ProgressBar now={progress} label={`${progress}%`} style={{ marginTop: '10px' }} />
    )}
  </div>
);

const SingleTransactionEdit = () => {
  const { transactionId } = useParams();
  const navigate = useNavigate();
  const [editedTransaction, setEditedTransaction] = useState(null);
  const [newReceipt, setNewReceipt] = useState(null);
  const [newProductImage, setNewProductImage] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [productImagePreview, setProductImagePreview] = useState(null);
  const [receiptProgress, setReceiptProgress] = useState(0);
  const [productImageProgress, setProductImageProgress] = useState(0);
  const [userCategories, setUserCategories] = useState([]);
  const [userPaymentMethods, setUserPaymentMethods] = useState([]);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [convertedAmount, setConvertedAmount] = useState('');
  const [isPublic, setIsPublic] = useState(false);

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        const docRef = doc(db, 'expenses', transactionId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = { id: docSnap.id, ...docSnap.data() };
          setEditedTransaction(data);
          setReceiptPreview(data.receipt);
          setProductImagePreview(data.productImage);
          setConvertedAmount(data.convertedAmount);
          setIsPublic(data.isPublic || false);

          const transactionDate = new Date(data.date);
          setDate(transactionDate.toISOString().split('T')[0]);
          setTime(transactionDate.toTimeString().split(' ')[0].slice(0, 5));

          const userDocRef = doc(db, 'users', data.userId);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setUserCategories(userData.categories || []);
            setUserPaymentMethods(userData.paymentMethods || []);
          }
        } else {
          console.log("No such transaction document!");
        }
      } catch (error) {
        console.error("Error fetching transaction:", error);
      }
    };

    fetchTransaction();
  }, [transactionId]);

  useEffect(() => {
    const updateConvertedAmount = async () => {
      if (editedTransaction && editedTransaction.amount && editedTransaction.fromCurrency && editedTransaction.toCurrency) {
        const converted = await getConvertedAmount(
          parseFloat(editedTransaction.amount),
          editedTransaction.fromCurrency,
          editedTransaction.toCurrency
        );
        setConvertedAmount(converted.toFixed(2));
        setEditedTransaction(prev => ({ ...prev, convertedAmount: converted.toFixed(2) }));
      }
    };

    updateConvertedAmount();
  }, [editedTransaction?.amount, editedTransaction?.fromCurrency, editedTransaction?.toCurrency]);

  const compressImage = async (file) => {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true
    };
    try {
      const compressedFile = await imageCompression(file, options);
      return compressedFile;
    } catch (error) {
      console.error("Error compressing image:", error);
      return file;
    }
  };

  const handleImageUpload = async (file, setProgress) => {
    if (!file) return null;

    try {
      const compressedFile = await compressImage(file);
      const storageRef = ref(storage, `images/${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, compressedFile);

      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setProgress(Math.round(progress));
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
    } catch (error) {
      console.error("Error in handleImageUpload:", error);
      throw error;
    }
  };

  const handleEdit = async () => {
    try {
      let updatedTransaction = { ...editedTransaction, isPublic };

      const combinedDate = new Date(`${date}T${time}`);
      updatedTransaction.date = combinedDate.toISOString();

      if (newReceipt) {
        const receiptURL = await handleImageUpload(newReceipt, setReceiptProgress);
        updatedTransaction.receipt = receiptURL;
      }

      if (newProductImage) {
        const productImageURL = await handleImageUpload(newProductImage, setProductImageProgress);
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

  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    const category = userCategories.find(cat => cat.id === categoryId);
    setEditedTransaction(prev => ({
      ...prev,
      categoryId: categoryId,
      categoryName: category ? category.name : ''
    }));
  };

  const getPaymentMethodTag = (method) => {
    if (!method || !method.type) return 'Unknown';

    switch (method.type) {
      case 'Cash':
        return 'Cash';
      case 'Credit Card':
        return `credit-${method.details.bank}-${method.details.last4}`;
      case 'Debit Card':
        return `debit-${method.details.bank}-${method.details.last4}`;
      case 'E-Wallet':
        return `E-Wallet: ${method.details.name}`;
      default:
        return `${method.type}`;
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
      case 'Cash':
      default:
        return 'secondary';
    }
  };

  const handlePaymentMethodChange = (method) => {
    setEditedTransaction(prev => ({
      ...prev,
      paymentMethod: method
    }));
  };

  const handleFileChange = async (e, setFile, setPreview, setProgress) => {
    const file = e.target.files[0];
    if (file) {
      setFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);

      try {
        const compressedFile = await compressImage(file);
        setFile(compressedFile);
      } catch (error) {
        console.error("Error compressing image:", error);
      }
    }
  };

  const canShare = editedTransaction?.description && productImagePreview;

  if (!editedTransaction) {
    return <p>Loading...</p>;
  }

  // Ensure 'Cash' is always the first payment method
  const sortedPaymentMethods = [
    { type: 'Cash', details: {} },
    ...userPaymentMethods.filter(method => method.type !== 'Cash')
  ];

  const labelStyle = {
    color: '#00008B',
    fontWeight: 500,
    marginBottom: '0.25rem'
  };

  return (
    <Container className="mt-4 pb-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <Button 
          variant="outline-primary" 
          onClick={() => navigate(-1)} 
          className="d-flex align-items-center"
          style={{ border: '1px solid #007bff', padding: '0.375rem 0.75rem' }}
        >
          <FaArrowLeft className="me-2" /> Back
        </Button>
        <h2 className="m-0">Edit</h2>
        <Button variant="primary" onClick={handleEdit}>
          Save
        </Button>
      </div>

      <Form>
        <Form.Group className="mb-3">
          <Form.Label style={labelStyle}>Description</Form.Label>
          <Form.Control 
            as="textarea" 
            rows={3}
            name="description"
            value={editedTransaction?.description || ''}
            onChange={handleInputChange}
            placeholder="Description"
          />
        </Form.Group>

        <Row className="mb-4 g-2">
          <Col xs={6}>
            <Form.Label style={labelStyle}>Receipt</Form.Label>
            <UploadBox
              label="Receipt"
              onChange={(e) => handleFileChange(e, setNewReceipt, setReceiptPreview, setReceiptProgress)}
              preview={receiptPreview}
              progress={receiptProgress}
            />
          </Col>
          <Col xs={6}>
            <Form.Label style={labelStyle}>Product Image</Form.Label>
            <UploadBox
              label="Product Image"
              onChange={(e) => handleFileChange(e, setNewProductImage, setProductImagePreview, setProductImageProgress)}
              preview={productImagePreview}
              progress={productImageProgress}
            />
          </Col>
        </Row>

        <Row className="mb-3 g-2">
          <Col xs={6}>
            <Form.Label style={labelStyle}>Date</Form.Label>
            <Form.Control 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)}
              className="w-100"
            />
          </Col>
          <Col xs={6}>
            <Form.Label style={labelStyle}>Time</Form.Label>
            <Form.Control 
              type="time" 
              value={time} 
              onChange={(e) => setTime(e.target.value)}
              className="w-100"
            />
          </Col>
        </Row>

        <Form.Group className="mb-3">
          <Form.Label style={labelStyle}>Category</Form.Label>
          <Form.Select 
            value={editedTransaction?.categoryId || ''}
            onChange={handleCategoryChange}
          >
            <option value="">Select Category</option>
            {userCategories.map(category => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </Form.Select>
        </Form.Group>

        <Row className="mb-3 g-2">
          <Col xs={6}>
            <Form.Label style={labelStyle}>Amount</Form.Label>
            <Form.Control 
              type="number" 
              name="amount"
              value={editedTransaction?.amount || ''}
              onChange={handleInputChange}
              placeholder="Amount"
            />
          </Col>
          <Col xs={6}>
            <Form.Label style={labelStyle}>Currency</Form.Label>
            <Form.Select 
              name="fromCurrency"
              value={editedTransaction?.fromCurrency || ''}
              onChange={handleInputChange}
            >
              <option value="">Currency</option>
              {currencyList.map(currency => (
                <option key={currency.code} value={currency.code}>{currency.code}</option>
              ))}
            </Form.Select>
          </Col>
        </Row>

        <Form.Group className="mb-3">
          <Form.Label style={labelStyle}>Converted Amount ({editedTransaction.toCurrency})</Form.Label>
          <Form.Control 
            type="number" 
            name="convertedAmount"
            value={editedTransaction?.convertedAmount || ''}
            onChange={handleInputChange}
            placeholder="Converted Amount"
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label style={labelStyle}>Payment Method</Form.Label>
          <div className="d-flex overflow-auto mb-2 pb-2" style={{ paddingBottom: '10px' }}>
            {sortedPaymentMethods.map((method, index) => (
              <Button
                key={index}
                variant={getPaymentMethodBadgeColor(method.type)}
                onClick={() => handlePaymentMethodChange(method)}
                className={`me-2 ${editedTransaction.paymentMethod.type === method.type ? 'active' : ''}`}
                style={{ flexShrink: 0 }}
              >
                {getPaymentMethodTag(method)}
              </Button>
            ))}
          </div>
          <div className="selected-payment-method mt-2 p-2 border rounded" style={{ backgroundColor: '#f8f9fa', color: '#6c757d' }}>
            Selected: {getPaymentMethodTag(editedTransaction.paymentMethod)}
          </div>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Check 
            type="switch"
            id="public-switch"
            label="Share this transaction publicly"
            checked={isPublic}
            onChange={() => setIsPublic(!isPublic)}
            disabled={!canShare}
          />
          {!canShare && (
            <Form.Text className="text-muted">
              To share this transaction, please add a description and a product image.
            </Form.Text>
          )}
        </Form.Group>
      </Form>
    </Container>
  );
};

export default SingleTransactionEdit;