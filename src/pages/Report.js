import React, { useState } from 'react';
import { Container, Tabs, Tab } from 'react-bootstrap';
import ReportExp from '../components/ReportExp';
import ReportInvest from '../components/ReportInvest';
import ReportDebt from '../components/ReportDebt';

const Report = () => {
  const [key, setKey] = useState('expenses');

  return (
    <Container>
      <h1 className="my-4">Report</h1>
      <Tabs
        id="report-tabs"
        activeKey={key}
        onSelect={(k) => setKey(k)}
        className="mb-3"
      >
        <Tab eventKey="expenses" title="Expenses">
          <ReportExp />
        </Tab>
        <Tab eventKey="investments" title="Investments">
          <ReportInvest />
        </Tab>
        <Tab eventKey="debts" title="Debts">
          <ReportDebt />
        </Tab>
      </Tabs>
    </Container>
  );
};

export default Report;