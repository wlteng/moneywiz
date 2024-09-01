import React from 'react';
import { Table, Button, DropdownButton, Dropdown, Badge } from 'react-bootstrap';
import { FaRedo, FaCalendarAlt, FaMoneyBillWave, FaTags, FaCreditCard, FaFileAlt, FaImage } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { getCurrencyDecimals } from '../data/General';

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
  resetFilters,
  mainCurrency,
  getMonthlyTotal,
}) => {
  const navigate = useNavigate();

  const getPaymentMethodBadgeColor = (paymentMethod) => {
    if (!paymentMethod || !paymentMethod.type) {
      console.warn('Invalid payment method:', paymentMethod);
      return 'secondary';
    }

    const type = paymentMethod.type.toLowerCase();
    switch (type) {
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
        return 'secondary';
    }
  };

  const getPaymentMethodDisplay = (paymentMethod) => {
    if (!paymentMethod || !paymentMethod.type) {
      console.warn('Invalid payment method:', paymentMethod);
      return 'Unknown';
    }

    const { type, details } = paymentMethod;
    switch (type.toLowerCase()) {
      case 'cash':
        return 'Cash';
      case 'e-wallet':
      case 'ewallet':
        return details?.name || 'E-Wallet';
      case 'credit card':
      case 'debit card':
        return `${type}: ${details?.last4 || 'XXXX'}`;
      default:
        return type;
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
    const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    return `${day} ${month}, ${time}`;
  };

  const handleRowClick = (transactionId) => {
    navigate(`/transaction/${transactionId}`);
  };

  const formatAmount = (amount, currency) => {
    const decimals = getCurrencyDecimals(currency);
    return parseFloat(amount).toFixed(decimals);
  };

  const truncateDescription = (description, maxLength = 30) => {
    return description.length > maxLength ? `${description.substring(0, maxLength)}...` : description;
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
          <h3>{monthYear} - Total: {getMonthlyTotal(transactions)} {mainCurrency}</h3>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th style={{ width: '120px' }}>Date</th>
                <th style={{ width: '150px' }}>Category</th>
                <th style={{ width: '150px' }}>Amount</th>
                <th style={{ width: '120px' }}>{mainCurrency}</th>
                <th style={{ width: '160px' }}>Payment Method</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id} onClick={() => handleRowClick(transaction.id)} style={{ cursor: 'pointer' }}>
                  <td>{formatDateTime(transaction.date)}</td>
                  <td>{userCategories.find(c => c.id === transaction.categoryId)?.name}</td>
                  <td>{formatAmount(transaction.amount, transaction.fromCurrency)} {transaction.fromCurrency}</td>
                  <td>{formatAmount(transaction.convertedAmount, mainCurrency)}</td>
                  <td>
                    <Badge bg={getPaymentMethodBadgeColor(transaction.paymentMethod)}>
                      {getPaymentMethodDisplay(transaction.paymentMethod)}
                    </Badge>
                  </td>
                  <td>
                    {transaction.description && <FaFileAlt className="me-1" />}
                    {(transaction.receipt || transaction.productImage) && <FaImage className="me-1" />}
                    {truncateDescription(transaction.description || 'No description')}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      ))}
    </div>
  );
};

export default TransactionsR;