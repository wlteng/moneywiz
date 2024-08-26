import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Modal, Button, DropdownButton, Dropdown } from 'react-bootstrap';
import { FaInfoCircle } from 'react-icons/fa';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [filterMonth, setFilterMonth] = useState('');
  const [filterCurrency, setFilterCurrency] = useState('');

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'expenses'));
        const fetchedTransactions = [];
        querySnapshot.forEach((doc) => {
          fetchedTransactions.push({ id: doc.id, ...doc.data() });
        });
        console.log('Fetched transactions:', fetchedTransactions);
        setTransactions(fetchedTransactions);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      }
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

  const handleShowPaymentDetails = (payment) => {
    setSelectedPayment(payment);
    setShowPaymentModal(true);
  };

  const handleClosePaymentModal = () => {
    setShowPaymentModal(false);
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

  const getMonthlyTotal = (transactions) => {
    return transactions.reduce((total, transaction) => total + parseFloat(transaction.convertedAmount), 0).toFixed(2);
  };

  const monthHeaderStyle = {
    backgroundColor: '#2c3e50',
    color: 'white',
  };

  console.log('Rendering Transactions component');
  console.log('Grouped transactions:', groupedTransactions);

  return (
    <div className="container mt-4">
      <h2>Transactions</h2>

      <div className="mb-4 d-flex justify-content-end">
        <DropdownButton
          variant="outline-secondary"
          title={filterMonth || 'All months'}
          id="input-group-dropdown-1"
          className="me-2"
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

      {Object.keys(groupedTransactions).length > 0 ? (
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Date</th>
              <th>Time</th>
              <th>Input</th>
              <th>{localStorage.getItem('mainCurrency')}</th>
              <th>Method</th>
              <th>Desc</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(groupedTransactions).map((monthYear, idx) => (
              <React.Fragment key={idx}>
                <tr style={monthHeaderStyle}>
                  <td colSpan="5" className="fw-bold">{monthYear}</td>
                  <td className="text-end">{getMonthlyTotal(groupedTransactions[monthYear])} {localStorage.getItem('mainCurrency')}</td>
                </tr>
                {groupedTransactions[monthYear].map((transaction) => (
                  <tr key={transaction.id}>
                    <td>{new Date(transaction.date).toLocaleDateString()}</td>
                    <td>{new Date(transaction.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                    <td>{parseFloat(transaction.amount).toFixed(2)} {transaction.fromCurrency}</td>
                    <td>{parseFloat(transaction.convertedAmount).toFixed(2)}</td>
                    <td>
                      <span 
                        style={{ cursor: 'pointer', textDecoration: 'underline' }}
                        onClick={() => handleShowPaymentDetails(transaction.paymentMethod)}
                      >
                        {transaction.paymentMethod.type === 'Cash' ? 'Cash' : `Card: ${transaction.paymentMethod.last4}`}
                      </span>
                    </td>
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
      ) : (
        <p>No transactions found.</p>
      )}

      {/* Modal for Description */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Body>{selectedTransaction?.description || 'No description available'}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal for Payment Details */}
      <Modal show={showPaymentModal} onHide={handleClosePaymentModal}>
        <Modal.Body>
          <h5>Payment Details</h5>
          <p>Type: {selectedPayment?.type}</p>
          {selectedPayment?.type !== 'Cash' && (
            <>
              <p>Card: **** **** **** {selectedPayment?.last4}</p>
              <p>Bank: {selectedPayment?.bank}</p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClosePaymentModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Transactions;