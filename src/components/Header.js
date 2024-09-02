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

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
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
    <>
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'fixed',
        top: '0',
        left: '0',
        right: '0',
        height: '60px',
        backgroundColor: '#f8f9fa',
        zIndex: 1000,
        padding: '0 1rem',
      }}>
        <div style={{ cursor: 'pointer', zIndex: 1001 }} onClick={toggleMenu}>
          <BurgerIcon />
        </div>
        <div style={{
          fontSize: '1.2rem',
          fontWeight: 'bold',
          color: '#000',
          cursor: 'pointer',
        }} onClick={() => navigate('/')}>MoneyWiz</div>
        {user && (
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
          }}>
            <div style={{ cursor: 'pointer', marginLeft: '15px' }} onClick={() => navigate('/transactions')}>
              <TransactionIcon />
            </div>
            <div style={{ cursor: 'pointer', marginLeft: '15px' }} onClick={() => navigate('/report')}>
              <ReportIcon />
            </div>
          </div>
        )}
      </header>
      <Menu 
        left
        isOpen={isMenuOpen}
        onStateChange={handleStateChange}
        customBurgerIcon={false}
        customCrossIcon={false}
        styles={{
          bmBurgerButton: {
            display: 'none',
          },
          bmCrossButton: {
            display: 'none',
          },
          bmMenuWrap: {
            position: 'fixed',
            height: '100%',
            left: 0,
            top: 0,
            zIndex: 1200,
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
            marginBottom: '15px',
            fontSize: '1.2rem',
          },
          bmOverlay: {
            background: 'rgba(0, 0, 0, 0.3)',
            zIndex: 1100,
          },
        }}
        overlayClassName={'overlay'}
      >
        <div style={{
          position: 'absolute',
          right: '15px',
          top: '15px',
          cursor: 'pointer',
          zIndex: 1300,
        }} onClick={closeMenu}>
          <CrossIcon />
        </div>
        {user && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            padding: '10px 0',
            borderBottom: '1px solid #e0e0e0',
            marginBottom: '10px',
          }}>
            <img 
              src={user.photoURL || '/default-avatar.png'} 
              alt="User avatar" 
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                marginRight: '10px',
              }}
            />
            <span style={{ fontSize: '1rem', fontWeight: 'bold' }}>
              {user.displayName || user.email}
            </span>
          </div>
        )}
        {menuItems.map((item) => (
          (!item.requireAuth || user) && (
            <Link 
              key={item.path}
              to={item.path} 
              className="bm-item" 
              onClick={() => handleNavigation(item.path)}
              style={{
                marginBottom: '15px',
                fontSize: '1.2rem',
                textDecoration: 'none',
                color: '#373a47',
              }}
            >
              {item.label}
            </Link>
          )
        ))}
        {!user && (
          <div style={{
            marginTop: 'auto',
            padding: '20px 0',
            display: 'flex',
            justifyContent: 'space-between',
          }}>
            <Link 
              to="/login" 
              style={{
                padding: '10px 20px',
                borderRadius: '5px',
                textDecoration: 'none',
                textAlign: 'center',
                flex: 1,
                margin: '0 5px',
                border: '1px solid #007bff',
                color: '#007bff',
              }}
              onClick={() => handleNavigation('/login')}
            >
              Login
            </Link>
            <Link 
              to="/register" 
              style={{
                padding: '10px 20px',
                borderRadius: '5px',
                textDecoration: 'none',
                textAlign: 'center',
                flex: 1,
                margin: '0 5px',
                backgroundColor: '#007bff',
                color: 'white',
              }}
              onClick={() => handleNavigation('/register')}
            >
              Register
            </Link>
          </div>
        )}
      </Menu>
      {isMenuOpen && <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.3)',
        zIndex: 1100,
      }} onClick={closeMenu} />}
    </>
  );
};

const BurgerIcon = () => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    width: '24px',
    height: '18px',
  }}>
    <div style={{
      width: '24px',
      height: '3px',
      backgroundColor: '#373a47',
      margin: '2px 0',
    }}></div>
    <div style={{
      width: '24px',
      height: '3px',
      backgroundColor: '#373a47',
      margin: '2px 0',
    }}></div>
    <div style={{
      width: '24px',
      height: '3px',
      backgroundColor: '#373a47',
      margin: '2px 0',
    }}></div>
  </div>
);

const CrossIcon = () => (
  <div style={{
    fontSize: '24px',
    color: '#bdc3c7',
    cursor: 'pointer',
  }}>✕</div>
);

const TransactionIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23"></line>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
  </svg>
);

const ReportIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10 9 9 9 8 9"></polyline>
  </svg>
);

export default Header;