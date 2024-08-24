import axios from 'axios';

const API_KEY = 'b511944e5000abfcf886497904ff9016'; // Replace with your actual API key
const API_URL = `https://api.exchangeratesapi.io/latest?access_key=${API_KEY}`;

export const getConvertedAmount = async (amount, fromCurrency, toCurrency) => {
  try {
    const response = await axios.get(`${API_URL}&base=${fromCurrency}&symbols=${toCurrency}`);
    const rate = response.data.rates[toCurrency];
    return amount * rate;
  } catch (error) {
    console.error('Currency conversion failed:', error);
    return amount; // Fallback to original amount if conversion fails
  }
};

export const categoryList = [
  { id: 1, name: 'Food' },
  { id: 2, name: 'Transport' },
  { id: 3, name: 'Shopping' },
  // Add more categories here
];

export const paymentTypes = ['Cash', 'Wallet', 'Credit Card'];

export const wallets = [
  { country: 'Malaysia', name: 'TouchnGo' },
  // Add more wallets here
];

export const creditCards = [
  { bank: 'Public Bank', type: 'Visa', last4: '3412', name: 'Platinum' },
  // Add more credit cards here
];

export const currencyList = [
  { code: 'USD', name: 'US Dollar' },
  { code: 'MYR', name: 'Malaysian Ringgit' },
  // Add more currencies here
];

