import React from 'react';
import { Link } from 'react-router-dom';
import { categoryList } from '../data/General';
import { Container, Row, Col } from 'react-bootstrap';

const Home = () => {
  return (
    <Container className="mt-4">
      <h1 className="text-center">Choose a Category</h1>
      <Row className="mt-4">
        {categoryList.map(category => (
          <Col xs={6} className="mb-3" key={category.id}>
            <Link to={`/keyboard/${category.id}`} className="btn btn-primary w-100">
              {category.name}
            </Link>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default Home;