import React from 'react';
import { Modal, Button, DropdownButton, Dropdown, Badge } from 'react-bootstrap';
import { FaInfoCircle, FaCalendarAlt, FaMoneyBillWave, FaTags } from 'react-icons/fa';

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
  handleShowDescription,
  handleShowPaymentDetails,
  showModal,
  showPaymentModal,
  handleCloseModal,
  handleClosePaymentModal,
  selectedTransaction,
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
                <th>Desc</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(groupedTransactions).map((monthYear, idx) => (
                <React.Fragment key={idx}>
                  <tr style={monthHeaderStyle}>
                    <td colSpan="3" className="fw-bold">{monthYear}</td>
                    <td colSpan="4" className="fw-bold text-end">
                      Total {localStorage.getItem('mainCurrency')} {getMonthlyTotal(groupedTransactions[monthYear])}
                    </td>
                  </tr>
                  {groupedTransactions[monthYear].map((transaction) => (
                    <tr key={transaction.id}>
                      <td>{new Date(transaction.date).toLocaleDateString()}</td>
                      <td>{new Date(transaction.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                      <td>{parseFloat(transaction.amount).toFixed(2)} {transaction.fromCurrency}</td>
                      <td>{parseFloat(transaction.convertedAmount).toFixed(2)}</td>
                      <td>
                        <Badge
                          bg={getPaymentMethodBadgeColor(transaction.paymentMethod.type)}
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleShowPaymentDetails(transaction.paymentMethod)}
                        >
                          {transaction.paymentMethod.type === 'Cash' ? 'Cash' : `${transaction.paymentMethod.type}: ${transaction.paymentMethod.last4}`}
                        </Badge>
                      </td>
                      <td>{categoryList.find(cat => cat.id === transaction.categoryId)?.name || 'N/A'}</td>
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
        </div>
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

export default TransactionsR;