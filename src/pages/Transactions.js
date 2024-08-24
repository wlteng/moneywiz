import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getTransactions } from '../services/expenseService';
import { Container, Table, Form } from 'react-bootstrap';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);

  useEffect(() => {
    const fetchTransactions = async () => {
      const data = await getTransactions(filterMonth);
      setTransactions(data);
    };
    fetchTransactions();
  }, [filterMonth]);

  return (
    <Container className="mt-4">
      <h2>Transactions</h2>
      <Form.Select
        className="mb-4"
        value={filterMonth}
        onChange={(e) => setFilterMonth(e.target.value)}
      >
        {[...Array(12)].map((_, i) => (
          <option key={i + 1} value={i + 1}>
            {new Date(0, i).toLocaleString('default', { month: 'long' })}
          </option>
        ))}
      </Form.Select>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Date</th>
            <th>Category</th>
            <th>Amount</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.id}>
              <td>{transaction.date}</td>
              <td>{transaction.category}</td>
              <td>{transaction.amount}</td>
              <td>
                <Link to={`/transaction/${transaction.id}`}>View</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default Transactions;