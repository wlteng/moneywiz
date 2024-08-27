import React, { useState } from 'react';
import { Accordion, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const TransactionMobile = ({ groupedTransactions, categoryList }) => {
  const [activeKey, setActiveKey] = useState(null);

  const getPaymentMethodBadgeColor = (type) => {
    if (!type) return 'secondary';
    switch (type.toLowerCase()) {
      case 'e-wallet': return 'primary';
      case 'debit card': return 'success';
      case 'credit card': return 'danger';
      case 'cash': return 'secondary';
      default: return 'secondary';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      day: date.getDate(),
      month: date.toLocaleString('default', { month: 'short' }),
      year: date.getFullYear()
    };
  };

  return (
    <div>
      {Object.entries(groupedTransactions).map(([date, transactions]) => (
        <div key={date}>
          <h5 className="mt-3 mb-2">{date}</h5>
          {transactions.map((transaction) => {
            const { day, month, year } = formatDate(transaction.date);
            return (
              <Accordion key={transaction.id} activeKey={activeKey} onSelect={(k) => setActiveKey(k === activeKey ? null : k)}>
                <Accordion.Item eventKey={transaction.id}>
                  <Accordion.Header>
                    <div className="d-flex justify-content-between align-items-center w-100">
                      <div className="d-flex align-items-center">
                        <div className="me-3 text-center">
                          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{day}</div>
                          <div style={{ fontSize: '0.8rem' }}>{month}</div>
                        </div>
                        <div>
                          <Badge bg="info">{categoryList.find(cat => cat.id === transaction.categoryId)?.name || 'N/A'}</Badge>
                          <Badge 
                            bg={getPaymentMethodBadgeColor(transaction.paymentMethod.type)}
                            className="ms-2"
                          >
                            {transaction.paymentMethod.type}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-end">
                        <div>{parseFloat(transaction.amount).toFixed(2)} {transaction.fromCurrency}</div>
                        <small className="text-muted">
                          {new Date(transaction.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </small>
                      </div>
                    </div>
                  </Accordion.Header>
                  <Accordion.Body>
                    <p><strong>Description:</strong> {transaction.description}</p>
                    <p><strong>Converted Amount:</strong> {parseFloat(transaction.convertedAmount).toFixed(2)} {transaction.toCurrency}</p>
                    <p><strong>Payment Method:</strong> {transaction.paymentMethod.type}</p>
                    {transaction.paymentMethod.type !== 'Cash' && (
                      <p><strong>Payment Details:</strong> {transaction.paymentMethod.bank} - {transaction.paymentMethod.last4}</p>
                    )}
                    <Link to={`/transaction/${transaction.id}`} className="btn btn-outline-primary btn-sm">View Details</Link>
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default TransactionMobile;