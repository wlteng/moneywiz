import React from 'react';
import Overview from './Overview';
import Transactions from './Transactions';
import { Nav, Container, Row, Col } from 'react-bootstrap';
import { Link, Route, Routes } from 'react-router-dom';

const Report = () => {
  return (
    <Container className="mt-4">
      <Nav variant="tabs" defaultActiveKey="overview">
        <Nav.Item>
          <Nav.Link as={Link} to="overview">Overview</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link as={Link} to="transactions">Transactions</Nav.Link>
        </Nav.Item>
      </Nav>
      <Row className="mt-4">
        <Col>
          <Routes>
            <Route path="overview" element={<Overview />} />
            <Route path="transactions" element={<Transactions />} />
          </Routes>
        </Col>
      </Row>
    </Container>
  );
};

export default Report;