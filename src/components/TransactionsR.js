import React from 'react';
import { Table, Button, DropdownButton, Dropdown, Badge, Modal } from 'react-bootstrap';
import { FaRedo, FaCalendarAlt, FaMoneyBillWave, FaTags, FaCreditCard, FaFileAlt, FaImage } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const TransactionsR = ({
  groupedTransactions,
  userCategories,
  uniqueMonths,
  uniqueCurrencies,
  uniquePaymentMethods,
  filterMonth,
  filterCurrency,
  filterCategory,
  filterPaymentMethod,
  handleMonthChange,
  handleCurrencyChange,
  handleCategoryChange,
  handlePaymentMethodChange,
  handleShowPaymentDetails,
  showPaymentModal,
  handleClosePaymentModal,
  selectedPayment,
  resetFilters
}) => {
  const getPaymentMethodBadgeColor = (type) => {
    switch (type.toLowerCase()) {
      case 'e-wallet': return 'primary';
      case 'debit card': return 'success';
      case 'credit card': return 'danger';
      case 'cash': return 'secondary';
      default: return 'secondary';
    }
  };

  const getMonthlyTotal = (transactions) => {
    return transactions.reduce((total, t) => total + parseFloat(t.convertedAmount), 0).toFixed(2);
  };

  return (
    <div className="container mt-4">
      <h2>Transactions</h2>
      <div className="mb-4 d-flex justify-content-end">
        <Button variant="outline-secondary" onClick={resetFilters} className="me-2">
          <FaRedo /> Reset
        </Button>
        <DropdownButton
          variant="outline-secondary"
          title={<><FaCalendarAlt /> {filterMonth || 'Month'}</>}
          className="me-2"
        >
          <Dropdown.Item onClick={() => handleMonthChange('')}>All months</Dropdown.Item>
          {uniqueMonths.map((month, index) => (
            <Dropdown.Item key={index} onClick={() => handleMonthChange(month)}>{month}</Dropdown.Item>
          ))}
        </DropdownButton>
        <DropdownButton
          variant="outline-secondary"
          title={<><FaMoneyBillWave /> {filterCurrency || 'Currency'}</>}
          className="me-2"
        >
          <Dropdown.Item onClick={() => handleCurrencyChange('')}>All currencies</Dropdown.Item>
          {uniqueCurrencies.map((currency, index) => (
            <Dropdown.Item key={index} onClick={() => handleCurrencyChange(currency)}>{currency}</Dropdown.Item>
          ))}
        </DropdownButton>
        <DropdownButton
          variant="outline-secondary"
          title={<><FaTags /> {userCategories.find(c => c.id === filterCategory)?.name || 'Category'}</>}
          className="me-2"
        >
          <Dropdown.Item onClick={() => handleCategoryChange('')}>All categories</Dropdown.Item>
          {userCategories.map((category) => (
            <Dropdown.Item key={category.id} onClick={() => handleCategoryChange(category.id)}>{category.name}</Dropdown.Item>
          ))}
        </DropdownButton>
        <DropdownButton
          variant="outline-secondary"
          title={<><FaCreditCard /> {filterPaymentMethod || 'Payment Method'}</>}
        >
          <Dropdown.Item onClick={() => handlePaymentMethodChange('')}>All methods</Dropdown.Item>
          {uniquePaymentMethods.map((method, index) => (
            <Dropdown.Item key={index} onClick={() => handlePaymentMethodChange(method)}>{method}</Dropdown.Item>
          ))}
        </DropdownButton>
      </div>

      {Object.entries(groupedTransactions).map(([monthYear, transactions]) => (
        <div key={monthYear}>
          <h3>{monthYear} - Total: {getMonthlyTotal(transactions)} {localStorage.getItem('mainCurrency')}</h3>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Converted Amount</th>
                <th>Payment Method</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td>{new Date(transaction.date).toLocaleDateString()}</td>
                  <td>
                    {userCategories.find(c => c.id === transaction.categoryId)?.name}
                    {transaction.description && <FaFileAlt className="ms-2" />}
                    {(transaction.receipt || transaction.productImage) && <FaImage className="ms-2" />}
                  </td>
                  <td>{transaction.amount} {transaction.fromCurrency}</td>
                  <td>{transaction.convertedAmount} {transaction.toCurrency}</td>
                  <td>
                    <Badge
                      bg={getPaymentMethodBadgeColor(transaction.paymentMethod.type)}
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleShowPaymentDetails(transaction.paymentMethod)}
                    >
                      {transaction.paymentMethod.type}
                    </Badge>
                  </td>
                  <td>
                    <Link to={`/transaction/${transaction.id}`}>View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      ))}

      <Modal show={showPaymentModal} onHide={handleClosePaymentModal}>
        <Modal.Header closeButton>
          <Modal.Title>Payment Method Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedPayment && (
            <>
              <p><strong>Type:</strong> {selectedPayment.type}</p>
              {selectedPayment.type === 'Cash' && (
                <p><strong>Currency:</strong> {selectedPayment.currency}</p>
              )}
              {selectedPayment.type === 'E-Wallet' && (
                <p><strong>Name:</strong> {selectedPayment.details.name}</p>
              )}
              {(selectedPayment.type === 'Credit Card' || selectedPayment.type === 'Debit Card') && (
                <>
                  <p><strong>Bank:</strong> {selectedPayment.details.bank}</p>
                  <p><strong>Last 4 digits:</strong> {selectedPayment.details.last4}</p>
                  {selectedPayment.type === 'Credit Card' && (
                    <p><strong>Card Name:</strong> {selectedPayment.details.name}</p>
                  )}
                </>
              )}
            </>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default TransactionsR;