import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../services/firebase';

const ReportExp = () => {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      const q = query(collection(db, 'expenses'), orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      const fetchedTransactions = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTransactions(fetchedTransactions);
    };

    fetchTransactions();
  }, []);

  const getTotalByCurrency = () => {
    const totals = transactions.reduce((acc, transaction) => {
      const currency = transaction.fromCurrency;
      if (!acc[currency]) {
        acc[currency] = 0;
      }
      acc[currency] += parseFloat(transaction.amount);
      return acc;
    }, {});

    return Object.entries(totals).map(([currency, amount]) => (
      <p key={currency}>{currency}: {amount.toFixed(2)}</p>
    ));
  };

  const getTotalByCategory = () => {
    const totals = transactions.reduce((acc, transaction) => {
      const category = transaction.categoryName;
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += parseFloat(transaction.convertedAmount);
      return acc;
    }, {});

    return Object.entries(totals).map(([category, amount]) => (
      <p key={category}>{category}: {amount.toFixed(2)} {localStorage.getItem('mainCurrency')}</p>
    ));
  };

  const getTotalByMonth = () => {
    const totals = transactions.reduce((acc, transaction) => {
      const date = new Date(transaction.date);
      const monthYear = `${date.getFullYear()}-${date.getMonth() + 1}`;
      if (!acc[monthYear]) {
        acc[monthYear] = 0;
      }
      acc[monthYear] += parseFloat(transaction.convertedAmount);
      return acc;
    }, {});

    return Object.entries(totals)
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([monthYear, amount]) => (
        <p key={monthYear}>{monthYear}: {amount.toFixed(2)} {localStorage.getItem('mainCurrency')}</p>
      ));
  };

  const chartData = getTotalByMonth();

  return (
    <Container>
      
      <Row>
        <Col md={4}>
          <h3>Total by Currency</h3>
          {getTotalByCurrency()}
        </Col>
        <Col md={4}>
          <h3>Total by Category</h3>
          {getTotalByCategory()}
        </Col>
        <Col md={4}>
          <h3>Total by Month</h3>
          {getTotalByMonth()}
        </Col>
      </Row>
      <Row>
        <Col>
          <h3>Expense Trend</h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="monthYear" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="amount" stroke="#8884d8" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </Col>
      </Row>
    </Container>
  );
};

export default ReportExp;