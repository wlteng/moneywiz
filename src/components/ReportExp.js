import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Alert, Form } from 'react-bootstrap';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import { convertCurrency } from '../services/conversionService';

const ReportExp = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [mainCurrency, setMainCurrency] = useState(localStorage.getItem('mainCurrency') || 'USD');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalByCurrency, setTotalByCurrency] = useState([]);
  const [totalByCategory, setTotalByCategory] = useState([]);
  const [totalByPaymentMethod, setTotalByPaymentMethod] = useState([]);
  const [totalPayment, setTotalPayment] = useState(null);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      setError(null);
      try {
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
      } catch (error) {
        console.error('Error fetching transactions:', error);
        setError('Failed to fetch transactions. Please try again later.');
      } finally {
        setLoading(false);
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

  useEffect(() => {
    const calculateTotals = async () => {
      const currencyTotals = {};
      const categoryTotals = {};
      const paymentMethodTotals = {};
      let total = 0;
      const dailyTotals = {};

      for (const transaction of filteredTransactions) {
        const convertedAmount = await convertCurrency(parseFloat(transaction.amount), transaction.fromCurrency, mainCurrency);
        
        // Total by currency
        if (!currencyTotals[transaction.fromCurrency]) {
          currencyTotals[transaction.fromCurrency] = 0;
        }
        currencyTotals[transaction.fromCurrency] += parseFloat(transaction.amount);

        // Total by category
        if (!categoryTotals[transaction.categoryName]) {
          categoryTotals[transaction.categoryName] = 0;
        }
        categoryTotals[transaction.categoryName] += convertedAmount;

        // Total by payment method
        const methodType = transaction.paymentMethod.type;
        if (!paymentMethodTotals[methodType]) {
          paymentMethodTotals[methodType] = 0;
        }
        paymentMethodTotals[methodType] += convertedAmount;

        // Total payment
        total += convertedAmount;

        // Daily totals for chart
        const date = new Date(transaction.date).toISOString().split('T')[0];
        if (!dailyTotals[date]) {
          dailyTotals[date] = 0;
        }
        dailyTotals[date] += convertedAmount;
      }

      setTotalByCurrency(Object.entries(currencyTotals).map(([currency, amount]) => ({ currency, amount })));
      setTotalByCategory(Object.entries(categoryTotals).map(([category, amount]) => ({ category, amount })));
      setTotalByPaymentMethod(Object.entries(paymentMethodTotals).map(([method, amount]) => ({ method, amount })));
      setTotalPayment(total);
      setChartData(Object.entries(dailyTotals)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([date, amount]) => ({ date, amount })));
    };

    calculateTotals();
  }, [filteredTransactions, mainCurrency]);

  const getMonthOptions = () => {
    const months = [...new Set(transactions.map(transaction => {
      const date = new Date(transaction.date);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }))];
    return months.sort((a, b) => b.localeCompare(a));
  };

  if (loading) {
    return <Container className="mt-4"><h2>Loading...</h2></Container>;
  }

  if (error) {
    return <Container className="mt-4"><Alert variant="danger">{error}</Alert></Container>;
  }

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
          <Alert variant="info" className="mb-2">
            <strong>Total Payment:</strong> {totalPayment?.toFixed(2)} {mainCurrency}
          </Alert>
        </Col>
      </Row>
      <Row>
        <Col md={4}>
          <h3>Total by Currency</h3>
          {totalByCurrency.map(({ currency, amount }, index) => (
            <Alert key={currency} variant={['primary', 'success', 'warning', 'danger', 'info'][index % 5]} className="mb-2">
              <strong>{currency}:</strong> {amount.toFixed(2)}
            </Alert>
          ))}
        </Col>
        <Col md={4}>
          <h3>Total by Category</h3>
          {totalByCategory.map(({ category, amount }, index) => (
            <Alert key={category} variant={['success', 'info', 'warning', 'danger', 'primary'][index % 5]} className="mb-2">
              <strong>{category}:</strong> {amount.toFixed(2)} {mainCurrency}
            </Alert>
          ))}
        </Col>
        <Col md={4}>
          <h3>Total by Payment Method</h3>
          {totalByPaymentMethod.map(({ method, amount }, index) => (
            <Alert key={method} variant={['info', 'success', 'warning', 'danger', 'primary'][index % 5]} className="mb-2">
              <strong>{method}:</strong> {amount.toFixed(2)} {mainCurrency}
            </Alert>
          ))}
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