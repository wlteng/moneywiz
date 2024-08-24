import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { currencyList } from '../data/General';

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState(currencyList[0].code);
  const [username, setUsername] = useState('John Doe'); // Replace with actual user data

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleCurrencyChange = (event) => {
    setSelectedCurrency(event.target.value);
    // Save the selected currency to local storage or user profile
  };

  return (
    <header className="bg-light p-3 shadow-sm">
      <div className="d-flex align-items-center">
        <button className="btn btn-outline-primary me-3" onClick={toggleMenu}>
          ☰
        </button>
        <span className="me-auto">Welcome, {username}</span>
        <select
          className="form-select w-auto"
          value={selectedCurrency}
          onChange={handleCurrencyChange}
        >
          {currencyList.map((currency) => (
            <option key={currency.code} value={currency.code}>
              {currency.name}
            </option>
          ))}
        </select>
      </div>

      {menuOpen && (
        <div className="position-fixed top-0 start-0 w-50 h-100 bg-dark text-white p-3">
          <div className="mb-3">
            <img src="logo.png" alt="App Logo" className="img-fluid mb-2" />
          </div>
          <ul className="list-unstyled">
            <li className="mb-2"><Link to="/" className="text-white" onClick={toggleMenu}>Home</Link></li>
            <li className="mb-2"><Link to="/report" className="text-white" onClick={toggleMenu}>Transaction</Link></li>
            <li className="mb-2"><Link to="/report" className="text-white" onClick={toggleMenu}>Report</Link></li>
            <li className="mb-2"><Link to="/profile" className="text-white" onClick={toggleMenu}>Profile</Link></li>
          </ul>
        </div>
      )}
    </header>
  );
};

export default Header;