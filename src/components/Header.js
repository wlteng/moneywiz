import React, { useState, useCallback } from 'react';
import { slide as Menu } from 'react-burger-menu';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Header = ({ user }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = useCallback((path) => {
    navigate(path);
    setIsMenuOpen(false);
  }, [navigate]);

  const handleStateChange = useCallback((state) => {
    setIsMenuOpen(state.isOpen);
  }, []);

  const toggleMenu = useCallback(() => {
    setIsMenuOpen(prev => !prev);
  }, []);

  React.useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const menuItems = [
    { path: '/', label: 'Home' },
    { path: '/transactions', label: 'Transactions', requireAuth: true },
    { path: '/investments', label: 'Investments', requireAuth: true },
    { path: '/debts', label: 'Debts', requireAuth: true },
    { path: '/report', label: 'Report', requireAuth: true },
    { path: '/profile', label: 'Profile', requireAuth: true },
    { path: '/settings', label: 'Settings', requireAuth: true },
    { path: '/initial-setup', label: 'Initial Setup', requireAuth: true },
  ];

  return (
    <header style={headerStyles}>
      {!isMenuOpen && (
        <div style={burgerButtonStyles} onClick={toggleMenu}>
          <BurgerIcon />
        </div>
      )}
      <Menu 
        left
        isOpen={isMenuOpen}
        onStateChange={handleStateChange}
        customBurgerIcon={false}
        customCrossIcon={<CrossIcon />}
        styles={menuStyles}
      >
        {menuItems.map((item) => (
          (!item.requireAuth || user) && (
            <Link 
              key={item.path}
              to={item.path} 
              className="bm-item" 
              onClick={() => handleNavigation(item.path)}
            >
              {item.label}
            </Link>
          )
        ))}
        {!user && (
          <div style={authContainerStyles}>
            <Link 
              to="/login" 
              style={loginButtonStyles} 
              onClick={() => handleNavigation('/login')}
            >
              Login
            </Link>
            <Link 
              to="/register" 
              style={registerButtonStyles} 
              onClick={() => handleNavigation('/register')}
            >
              Register
            </Link>
          </div>
        )}
      </Menu>
      <div style={logoStyles} onClick={() => navigate('/')}>MoneyWiz</div>
    </header>
  );
};


const BurgerIcon = () => (
  <div style={burgerIconStyles}>
    <div style={barStyles}></div>
    <div style={barStyles}></div>
    <div style={barStyles}></div>
  </div>
);

const CrossIcon = () => (
  <div style={crossIconStyles}>✕</div>
);

export default Header;

const authContainerStyles = {
  marginTop: 'auto',
  padding: '20px 0',
  display: 'flex',
  justifyContent: 'space-between',
};

const buttonBaseStyles = {
  padding: '10px 20px',
  borderRadius: '5px',
  textDecoration: 'none',
  textAlign: 'center',
  flex: 1,
  margin: '0 5px',
};

const loginButtonStyles = {
  ...buttonBaseStyles,
  border: '1px solid #007bff',
  color: '#007bff',
};

const registerButtonStyles = {
  ...buttonBaseStyles,
  backgroundColor: '#007bff',
  color: 'white',
};


const headerStyles = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  position: 'sticky',
  top: '0',
  height: '60px',
  width: '100%',
  backgroundColor: '#f8f9fa',
  zIndex: 1000,
};

const logoStyles = {
  fontSize: '1.5rem',
  fontWeight: 'bold',
  color: '#000',
  textAlign: 'center',
  width: '100%',
};

const burgerButtonStyles = {
  position: 'absolute',
  left: '1rem',
  top: '50%',
  transform: 'translateY(-50%)',
  zIndex: 1001,
  cursor: 'pointer',
};

const burgerIconStyles = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  width: '24px',
  height: '18px',
};

const barStyles = {
  width: '24px',
  height: '3px',
  backgroundColor: '#373a47',
  margin: '2px 0',
};

const crossIconStyles = {
  fontSize: '24px',
  color: '#bdc3c7',
  cursor: 'pointer',
};

const menuStyles = {
  bmBurgerButton: {
    display: 'none', // Hide default burger button
  },
  bmCrossButton: {
    height: '24px',
    width: '24px',
    top: '15px',
    right: '15px',
  },
  bmCross: {
    background: '#bdc3c7',
  },
  bmMenuWrap: {
    position: 'fixed',
    height: '100%',
    left: 0,
    top: 0,
  },
  bmMenu: {
    background: '#f8f9fa',
    padding: '2.5em 1.5em 0',
    fontSize: '1.15em',
  },
  bmItemList: {
    color: '#373a47',
    padding: '0.8em',
    display: 'flex',
    flexDirection: 'column',
  },
  bmItem: {
    display: 'inline-block',
    textDecoration: 'none',
    color: '#373a47',
    marginBottom: '10px',
    fontSize: '1.2rem',
  },
  bmOverlay: {
    background: 'rgba(0, 0, 0, 0.3)',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    position: 'fixed',
    zIndex: 1000,
  },
};