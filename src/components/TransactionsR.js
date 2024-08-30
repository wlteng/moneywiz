import React from 'react';
import { Modal, Button, DropdownButton, Dropdown, Badge } from 'react-bootstrap';
import { FaCalendarAlt, FaMoneyBillWave, FaTags, FaFileAlt, FaImage } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const TransactionsR = ({
  groupedTransactions,
  uniqueMonths,
  uniqueCurrencies,
  categoryList,
  filterMonth,
  filterCurrency,
  filterCategory,
  handleMonthChange,
  handleCurrencyChange,
  handleCategoryChange,
  handleShowPaymentDetails,
  showPaymentModal,
  handleClosePaymentModal,
  selectedPayment
}) => {
  const getPaymentMethodBadgeColor = (type) => {
    if (!type) {
      console.warn('Payment method type is undefined or null');
      return 'secondary';
    }

    switch (type.toLowerCase()) {
      case 'e-wallet':
      case 'ewallet':
        return 'primary';
      case 'debit card':
      case 'debitcard':
        return 'success';
      case 'credit card':
      case 'creditcard':
        return 'danger';
      case 'cash':
        return 'secondary';
      default:
        console.warn(`Unknown payment method type: ${type}`);
        return 'secondary';
    }
  };

  const getMonthlyTotal = (transactions) => {
    return transactions.reduce((total, transaction) => total + parseFloat(transaction.convertedAmount), 0).toFixed(2);
  };

  const monthHeaderStyle = {
    backgroundColor: '#2c3e50',
    color: 'white',
  };

  return (
    <div className="container mt-4">
      <h2>Transactions</h2>

      <div className="mb-4 d-flex justify-content-end flex-wrap">
        <DropdownButton
          variant="outline-secondary"
          title={<FaCalendarAlt />}
          id="input-group-dropdown-1"
          className="me-2 mb-2"
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
          title={<FaMoneyBillWave />}
          id="input-group-dropdown-2"
          className="me-2 mb-2"
        >
          <Dropdown.Item onClick={() => handleCurrencyChange('')}>All currencies</Dropdown.Item>
          {uniqueCurrencies.map((currency, index) => (
            <Dropdown.Item key={index} onClick={() => handleCurrencyChange(currency)}>
              {currency}
            </Dropdown.Item>
          ))}
        </DropdownButton>

        <DropdownButton
          variant="outline-secondary"
          title={<FaTags />}
          id="input-group-dropdown-3"
          className="mb-2"
        >
          <Dropdown.Item onClick={() => handleCategoryChange('')}>All categories</Dropdown.Item>
          {categoryList.map((category, index) => (
            <Dropdown.Item key={index} onClick={() => handleCategoryChange(category.id)}>
              {category.name}
            </Dropdown.Item>
          ))}
        </DropdownButton>
      </div>

      {Object.keys(groupedTransactions).length > 0 ? (
        <div className="table-responsive">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Date</th>
                <th>Time</th>
                <th>Input</th>
                <th>{localStorage.getItem('mainCurrency')}</th>
                <th>Method</th>
                <th>Category</th>
                <th>More</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(groupedTransactions).map((monthYear, idx) => (
                <React.Fragment key={idx}>
                  <tr style={monthHeaderStyle}>
                    <td colSpan="7" className="fw-bold">
                      {monthYear} ({localStorage.getItem('mainCurrency')} {getMonthlyTotal(groupedTransactions[monthYear])})
                    </td>
                  </tr>
                  {groupedTransactions[monthYear].map((transaction) => (
                    <tr key={transaction.id}>
                      <td>{new Date(transaction.date).toLocaleDateString()}</td>
                      <td>{new Date(transaction.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                      <td>
                        <Link to={`/transaction/${transaction.id}`} style={{ color: 'rgb(27, 145, 184)', fontWeight: 'bold',textDecoration: 'none' }}>
                          {parseFloat(transaction.amount).toFixed(2)} {transaction.fromCurrency}
                        </Link>
                      </td>
                      <td>
                        <Link to={`/transaction/${transaction.id}`} style={{ color: 'rgb(27, 145, 184)', fontWeight: 'bold',textDecoration: 'none' }}>
                          {parseFloat(transaction.convertedAmount).toFixed(2)}
                        </Link>
                      </td>
                      <td>
                        <Badge
                          bg={getPaymentMethodBadgeColor(transaction.paymentMethod.type)}
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleShowPaymentDetails(transaction.paymentMethod)}
                        >
                          {transaction.paymentMethod.type === 'Cash' ? 'Cash' : 
                           transaction.paymentMethod.type === 'E-Wallet' ? transaction.paymentMethod.name :
                           `${transaction.paymentMethod.type}: ${transaction.paymentMethod.last4}`}
                        </Badge>
                      </td>
                      <td>{categoryList.find(cat => cat.id === transaction.categoryId)?.name || 'N/A'}</td>
                      <td>
                        {transaction.description && <FaFileAlt className="me-2" />}
                        {(transaction.receipt || transaction.productImage) && <FaImage />}
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No transactions found.</p>
      )}

      {/* Modal for Payment Details */}
      <Modal show={showPaymentModal} onHide={handleClosePaymentModal} centered>
        <Modal.Body>
          <h5>Payment Details</h5>
          <p>Type: {selectedPayment?.type}</p>
          {selectedPayment?.type === 'Cash' && (
            <p>Currency: {selectedPayment?.currency}</p>
          )}
          {selectedPayment?.type === 'E-Wallet' && (
            <p>Name: {selectedPayment?.name}</p>
          )}
          {(selectedPayment?.type === 'Credit Card' || selectedPayment?.type === 'Debit Card') && (
            <>
              <p>Card: **** **** **** {selectedPayment?.last4}</p>
              <p>Bank: {selectedPayment?.bank}</p>
              {selectedPayment?.type === 'Credit Card' && <p>Card Name: {selectedPayment?.name}</p>}
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

export default TransactionsR;