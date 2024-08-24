import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getTransactionById } from '../services/expenseService';
import { Container, Row, Col } from 'react-bootstrap';

const SingleTransaction = () => {
  const { transactionId } = useParams();
  const [transaction, setTransaction] = useState(null);

  useEffect(() => {
    const fetchTransaction = async () => {
      const data = await getTransactionById(transactionId);
      setTransaction(data);
    };
    fetchTransaction();
  }, [transactionId]);

  if (!transaction) {
    return <p>Loading...</p>;
  }

  return (
    <Container className="mt-4">
      <h2>Transaction Details</h2>
      <Row>
        <Col><strong>Date:</strong> {transaction.date}</Col>
      </Row>
      <Row>
        <Col><strong>Category:</strong> {transaction.category}</Col>
      </Row>
      <Row>
        <Col><strong>Amount:</strong> {transaction.amount}</Col>
      </Row>
      <Row>
        <Col><strong>Payment Method:</strong> {transaction.paymentMethod}</Col>
      </Row>
      <Row>
        <Col><strong>Description:</strong> {transaction.description}</Col>
      </Row>
      <Row className="mt-4">
        <Col>
          <img
            src={transaction.receipt}
            alt="Receipt"
            className="img-fluid"
            style={{ maxHeight: '150px' }}
          />
        </Col>
        <Col>
          <img
            src={transaction.productImage}
            alt="Product"
            className="img-fluid"
            style={{ maxHeight: '150px' }}
          />
        </Col>
      </Row>
    </Container>
  );
};

export default SingleTransaction;