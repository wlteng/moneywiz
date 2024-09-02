import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, storage } from '../services/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { Container, Row, Col, Button, Form, Image } from 'react-bootstrap';
import { FaArrowLeft } from 'react-icons/fa';
import { currencyList, getConvertedAmount } from '../data/General';

const SingleTransactionEdit = () => {
  const { transactionId } = useParams();
  const navigate = useNavigate();
  const [editedTransaction, setEditedTransaction] = useState(null);
  const [newReceipt, setNewReceipt] = useState(null);
  const [newProductImage, setNewProductImage] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [productImagePreview, setProductImagePreview] = useState(null);
  const [userCategories, setUserCategories] = useState([]);
  const [userPaymentMethods, setUserPaymentMethods] = useState([]);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [convertedAmount, setConvertedAmount] = useState('');

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        console.log('Fetching transaction:', transactionId);
        const docRef = doc(db, 'expenses', transactionId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = { id: docSnap.id, ...docSnap.data() };
          console.log('Fetched transaction data:', data);
          setEditedTransaction(data);
          setReceiptPreview(data.receipt);
          setProductImagePreview(data.productImage);
          setConvertedAmount(data.convertedAmount);

          // Set date and time
          const transactionDate = new Date(data.date);
          setDate(transactionDate.toISOString().split('T')[0]);
          setTime(transactionDate.toTimeString().split(' ')[0].slice(0, 5));

          // Fetch user data (categories and payment methods)
          const userDocRef = doc(db, 'users', data.userId);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            console.log('Fetched user data:', userData);
            setUserCategories(userData.categories || []);
            setUserPaymentMethods(userData.paymentMethods || []);
          } else {
            console.log('No user data found');
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
      console.log('Starting edit process');
      let updatedTransaction = { ...editedTransaction };
      console.log('Initial updatedTransaction:', updatedTransaction);

      // Combine date and time
      const combinedDate = new Date(`${date}T${time}`);
      updatedTransaction.date = combinedDate.toISOString();
      console.log('Updated date:', updatedTransaction.date);

      if (newReceipt) {
        const receiptURL = await handleImageUpload(newReceipt, () => {});
        updatedTransaction.receipt = receiptURL;
        console.log('Updated receipt URL:', receiptURL);
      }

      if (newProductImage) {
        const productImageURL = await handleImageUpload(newProductImage, () => {});
        updatedTransaction.productImage = productImageURL;
        console.log('Updated product image URL:', productImageURL);
      }

      console.log('Final updatedTransaction before save:', updatedTransaction);
      await updateDoc(doc(db, 'expenses', transactionId), updatedTransaction);
      console.log('Transaction updated successfully');
      navigate(`/transaction/${transactionId}`);
    } catch (error) {
      console.error("Error updating transaction:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(`Input changed: ${name} = ${value}`);
    setEditedTransaction(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    const category = userCategories.find(cat => cat.id === categoryId);
    console.log('Category changed:', category);
    setEditedTransaction(prev => ({
      ...prev,
      categoryId: categoryId,
      categoryName: category ? category.name : ''
    }));
  };

  // Modified: Updated getPaymentMethodTag function
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
    console.log('Payment method changed:', method);
    setEditedTransaction(prev => ({
      ...prev,
      paymentMethod: method
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
      console.log('File changed:', file.name);
    }
  };

  // Combine and deduplicate payment methods
  const uniquePaymentMethods = [
    { type: 'Cash', details: {} },
    ...Array.from(new Set([...userPaymentMethods].map(JSON.stringify)))
      .map(JSON.parse)
      .filter(method => method.type !== 'Cash')
  ];

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
        <Row>
          <Col>
            <Form.Group className="mb-3">
              <Form.Label>Date</Form.Label>
              <Form.Control type="date" 
                value={date}
                onChange={(e) => {
                  console.log('Date changed:', e.target.value);
                  setDate(e.target.value);
                }}
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group className="mb-3">
              <Form.Label>Time</Form.Label>
              <Form.Control 
                type="time" 
                value={time}
                onChange={(e) => {
                  console.log('Time changed:', e.target.value);
                  setTime(e.target.value);
                }}
              />
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mb-3">
          <Form.Label>Category</Form.Label>
          <Form.Select 
            value={editedTransaction?.categoryId || ''}
            onChange={handleCategoryChange}
          >
            {userCategories.map(category => (
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
          <Form.Label>Converted Amount ({editedTransaction.toCurrency})</Form.Label>
          <Form.Control 
            type="text" 
            value={convertedAmount}
            readOnly
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Payment Method</Form.Label>
          {/* Modified: Added padding-bottom to the payment method sliding section */}
          <div className="d-flex overflow-auto mb-2 pb-2" style={{ paddingBottom: '10px' }}>
            {uniquePaymentMethods.map((method, index) => (
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
          <div className="selected-payment-method mt-2 p-2 border rounded">
            Selected: {getPaymentMethodTag(editedTransaction.paymentMethod)}
          </div>
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