import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Alert, Form } from 'react-bootstrap';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db, auth } from '../services/firebase';

const ReportExp = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const mainCurrency = localStorage.getItem('mainCurrency') || 'USD';

  useEffect(() => {
    const fetchTransactions = async () => {
      const user = auth.currentUser;
      if (user) {
        const q = query(
          collection(db, 'expenses'),
          where("userId", "==", user.uid),
          orderBy('date', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const fetchedTransactions = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTransactions(fetchedTransactions);
        setFilteredTransactions(fetchedTransactions);
      }
    };

    fetchTransactions();
  }, []);

  useEffect(() => {
    if (selectedMonth) {
      const filtered = transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return transactionDate.getFullYear() === parseInt(selectedMonth.split('-')[0]) &&
               transactionDate.getMonth() === parseInt(selectedMonth.split('-')[1]) - 1;
      });
      setFilteredTransactions(filtered);
    } else {
      setFilteredTransactions(transactions);
    }
  }, [selectedMonth, transactions]);

  const getMonthOptions = () => {
    const months = [...new Set(transactions.map(transaction => {
      const date = new Date(transaction.date);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }))];
    return months.sort((a, b) => b.localeCompare(a));
  };

  const getTotalByCurrency = () => {
    const totals = filteredTransactions.reduce((acc, transaction) => {
      const currency = transaction.fromCurrency;
      if (!acc[currency]) {
        acc[currency] = 0;
      }
      acc[currency] += parseFloat(transaction.amount);
      return acc;
    }, {});

    const alertVariants = ['primary', 'success', 'warning', 'danger', 'info'];
    return Object.entries(totals).map(([currency, amount], index) => (
      <Alert key={currency} variant={alertVariants[index % alertVariants.length]} className="mb-2">
        <strong>{currency}:</strong> {amount.toFixed(2)}
      </Alert>
    ));
  };

  const getTotalByCategory = () => {
    const totals = filteredTransactions.reduce((acc, transaction) => {
      const category = transaction.categoryName;
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += parseFloat(transaction.convertedAmount);
      return acc;
    }, {});

    const alertVariants = ['success', 'info', 'warning', 'danger', 'primary'];
    return Object.entries(totals).map(([category, amount], index) => (
      <Alert key={category} variant={alertVariants[index % alertVariants.length]} className="mb-2">
        <strong>{category}:</strong> {amount.toFixed(2)} {mainCurrency}
      </Alert>
    ));
  };

  const getTotalByPaymentMethod = () => {
    const totals = filteredTransactions.reduce((acc, transaction) => {
      const method = transaction.paymentMethod.type;
      if (!acc[method]) {
        acc[method] = 0;
      }
      acc[method] += parseFloat(transaction.convertedAmount);
      return acc;
    }, {});

    const alertVariants = ['info', 'success', 'warning', 'danger', 'primary'];
    return Object.entries(totals).map(([method, amount], index) => (
      <Alert key={method} variant={alertVariants[index % alertVariants.length]} className="mb-2">
        <strong>{method}:</strong> {amount.toFixed(2)} {mainCurrency}
      </Alert>
    ));
  };

  const getTotalPayment = () => {
    const total = filteredTransactions.reduce((acc, transaction) => {
      return acc + parseFloat(transaction.convertedAmount);
    }, 0);

    const date = selectedMonth ? new Date(selectedMonth) : new Date();
    const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });

    return (
      <Alert variant="info" className="mb-2">
        <strong>{monthYear}:</strong> {total.toFixed(2)} {mainCurrency}
      </Alert>
    );
  };

  const getChartData = () => {
    const dailyTotals = filteredTransactions.reduce((acc, transaction) => {
      const date = new Date(transaction.date).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date] += parseFloat(transaction.convertedAmount);
      return acc;
    }, {});

    return Object.entries(dailyTotals)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, amount]) => ({ date, amount }));
  };

  const chartData = getChartData();

  return (
    <Container className="mt-4">
      <Row className="mb-3">
        <Col>
          <Form.Group>
            <Form.Label>Select Month:</Form.Label>
            <Form.Control 
              as="select" 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              <option value="">All Months</option>
              {getMonthOptions().map(month => (
                <option key={month} value={month}>
                  {new Date(month).toLocaleString('default', { month: 'long', year: 'numeric' })}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
        </Col>
      </Row>
      <Row>
        <Col>
          {getTotalPayment()}
        </Col>
      </Row>
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
          <h3>Total by Payment Method</h3>
          {getTotalByPaymentMethod()}
        </Col>
      </Row>
      <Row className="mt-4">
        <Col>
          <Alert variant="light">
            <h3>Daily Expense Trend ({mainCurrency})</h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="amount" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </Alert>
        </Col>
      </Row>
    </Container>
  );
};

export default ReportExp;