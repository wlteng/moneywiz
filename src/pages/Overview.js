import React, { useEffect, useRef } from 'react';
import { getMonthlySummary } from '../services/expenseService';
import { Container } from 'react-bootstrap';
import { Chart } from 'chart.js/auto';
import { Pie } from 'react-chartjs-2';

const Overview = () => {
  const chartRef = useRef(null);
  const summary = getMonthlySummary(); // Assume this function fetches the summary data

  const data = {
    labels: Object.keys(summary.categoryTotals),
    datasets: [
      {
        label: 'Expenses by Category',
        data: Object.values(summary.categoryTotals),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
        ],
        hoverBackgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
        ],
      },
    ],
  };

  return (
    <Container>
      <h2>Monthly Overview</h2>
      <p>Total Expenses: {summary.total}</p>
      <p>Most Expensive Category: {summary.mostExpensiveCategory}</p>
      <div>
        <Pie data={data} ref={chartRef} />
      </div>
    </Container>
  );
};

export default Overview;