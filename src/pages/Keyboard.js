import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { paymentTypes, getConvertedAmount } from '../data/General';
import { Container, Form, Button } from 'react-bootstrap';
import { db } from '../services/firebase';
import { saveTransactionLocally, syncTransactions } from '../services/offlineService';

const Keyboard = () => {
  const { categoryId } = useParams();
  const [amount, setAmount] = useState('');
  const [convertedAmount, setConvertedAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState(paymentTypes[0]);
  const [description, setDescription] = useState('');
  const [receipt, setReceipt] = useState(null);
  const [productImage, setProductImage] = useState(null);
  const [fromCurrency] = useState('USD'); // Example: user input currency
  const [toCurrency] = useState('MYR');   // Example: user's preferred currency

  useEffect(() => {
    const convertCurrency = async () => {
      if (amount) {
        console.log(`Converting ${amount} ${fromCurrency} to ${toCurrency}`);
        const converted = await getConvertedAmount(amount, fromCurrency, toCurrency);
        console.log(`Converted amount: ${converted}`);
        setConvertedAmount(converted);
      }
    };
    convertCurrency();
  }, [amount, fromCurrency, toCurrency]);

  const handleAmountChange = (e) => {
    setAmount(e.target.value);
  };

  const handleSubmit = async () => {
    const transaction = {
      amount,
      convertedAmount,
      paymentMethod,
      description,
      receipt,
      productImage,
      date: new Date().toISOString(),
      fromCurrency,
      toCurrency,
    };

    try {
      // Try to save online first
      await db.collection('expenses').add(transaction);
    } catch (error) {
      console.error('Failed to save online:', error);
      // Save offline if online saving fails
      await saveTransactionLocally(transaction);
    }
  };

  // Sync transactions when the app comes online
  useEffect(() => {
    window.addEventListener('online', syncTransactions);
    return () => {
      window.removeEventListener('online', syncTransactions);
    };
  }, []);

  return (
    <Container className="mt-4">
      <div className="mb-4">
        <h2>
          {amount || '0.00'} {fromCurrency}
        </h2>
        <small>
          Converted: {convertedAmount || '0.00'} {toCurrency}
        </small>
      </div>
      <div className="mb-4">
        <Form.Group>
          <Form.Control
            type="text"
            value={amount}
            onChange={handleAmountChange}
            placeholder="Enter amount"
          />
        </Form.Group>
      </div>
      <div className="mb-4">
        <Form.Group>
          <Form.Label>Payment Method</Form.Label>
          <Form.Select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
            {paymentTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </Form.Select>
        </Form.Group>
      </div>
      <div className="mb-4">
        <Form.Group>
          <Form.Label>Description</Form.Label>
          <Form.Control as="textarea" rows={3} value={description} onChange={e => setDescription(e.target.value)} />
        </Form.Group>
      </div>
      <div className="mb-4">
        <Form.Group>
          <Form.Label>Receipt</Form.Label>
          <Form.Control type="file" onChange={e => setReceipt(e.target.files[0])} />
        </Form.Group>
        <Form.Group>
          <Form.Label>Product Image</Form.Label>
          <Form.Control type="file" onChange={e => setProductImage(e.target.files[0])} />
        </Form.Group>
      </div>
      <Button variant="primary" onClick={handleSubmit}>Submit</Button>
    </Container>
  );
};

export default Keyboard;