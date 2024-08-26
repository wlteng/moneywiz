import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Modal, Button, DropdownButton, Dropdown } from 'react-bootstrap';
import { FaInfoCircle } from 'react-icons/fa';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filterMonth, setFilterMonth] = useState('');
  const [filterCurrency, setFilterCurrency] = useState('');

  useEffect(() => {
    const fetchTransactions = async () => {
      const querySnapshot = await getDocs(collection(db, 'expenses'));
      const fetchedTransactions = [];
      querySnapshot.forEach((doc) => {
        fetchedTransactions.push({ id: doc.id, ...doc.data() });
      });
      setTransactions(fetchedTransactions);
    };

    fetchTransactions();
  }, []);

  const handleShowDescription = (transaction) => {
    setSelectedTransaction(transaction);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleMonthChange = (month) => {
    setFilterMonth(month);
  };

  const handleCurrencyChange = (currency) => {
    setFilterCurrency(currency);
  };

  const uniqueMonths = [
    ...new Set(
      transactions.map((transaction) =>
        new Date(transaction.date).toLocaleString('default', { month: 'long', year: 'numeric' })
      )
    ),
  ];

  const uniqueCurrencies = [...new Set(transactions.map((transaction) => transaction.fromCurrency))];

  const filteredTransactions = transactions.filter((transaction) => {
    const transactionDate = new Date(transaction.date);
    const monthMatches = filterMonth
      ? transactionDate.toLocaleString('default', { month: 'long', year: 'numeric' }) === filterMonth
      : true;
    const currencyMatches = filterCurrency ? transaction.fromCurrency === filterCurrency : true;
    return monthMatches && currencyMatches;
  });

  const groupedTransactions = filteredTransactions.reduce((acc, transaction) => {
    const transactionDate = new Date(transaction.date);
    const monthYear = transactionDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    if (!acc[monthYear]) {
      acc[monthYear] = [];
    }
    acc[monthYear].push(transaction);
    return acc;
  }, {});

  return (
    <div className="container mt-4">
      <h2>Transactions</h2>

      {/* Filters */}
      <div className="mb-4 d-flex justify-content-end"> {/* Align dropdowns to the right */}
        <DropdownButton
          variant="outline-secondary"
          title={filterMonth || 'All months'}
          id="input-group-dropdown-1"
          className="mr-2"
        >
          <Dropdown.Item onClick={() => handleMonthChange('')}>All months</Dropdown.Item>
          {uniqueMonths.map((month, index) => (
            <Dropdown.Item key={index} onClick={() => handleMonthChange(month)}>
              {month}
            </Dropdown.Item>
          ))}
        </DropdownButton>

        <DropdownButton
          variant="outline-secondary"
          title={filterCurrency || 'Input Currency'}
          id="input-group-dropdown-2"
        >
          <Dropdown.Item onClick={() => handleCurrencyChange('')}>All currencies</Dropdown.Item>
          {uniqueCurrencies.map((currency, index) => (
            <Dropdown.Item key={index} onClick={() => handleCurrencyChange(currency)}>
              {currency}
            </Dropdown.Item>
          ))}
        </DropdownButton>
      </div>

      <table className="table table-striped">
        <thead>
          <tr>
            <th>Date</th>
            <th>Time</th>
            <th>Input Amount</th>
            <th>Amount ({localStorage.getItem('mainCurrency')})</th>
            <th>Method</th>
            <th>Desc</th> {/* Changed to "Desc" */}
          </tr>
        </thead>
        <tbody>
          {Object.keys(groupedTransactions).map((monthYear, idx) => (
            <React.Fragment key={idx}>
              <tr>
                <td colSpan="6" className="font-weight-bold">{monthYear}</td> {/* Group by month and year */}
              </tr>
              {groupedTransactions[monthYear].map((transaction) => (
                <tr key={transaction.id}>
                  <td>{new Date(transaction.date).toLocaleDateString()}</td>
                  <td>{new Date(transaction.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td> {/* Date and Time */}
                  <td>{parseFloat(transaction.amount).toFixed(2)} {transaction.fromCurrency}</td> {/* 2 decimal points */}
                  <td>{parseFloat(transaction.convertedAmount).toFixed(2)}</td> {/* 2 decimal points */}
                  <td>{transaction.paymentMethod}</td>
                  <td>
                    <FaInfoCircle
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleShowDescription(transaction)}
                    />
                  </td>
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>

      {/* Modal for Description */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Description</Modal.Title>
        </Modal.Header>
        <Modal.Body>{selectedTransaction?.description || 'No description available'}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Transactions;