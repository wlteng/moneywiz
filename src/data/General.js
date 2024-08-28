// General.js

// Define manual conversion rates from MYR to other currencies
const conversionRates = {
  USD: 0.22, // 1 MYR = 0.22 USD
  EUR: 0.20, // 1 MYR = 0.20 EUR
  GBP: 0.18, // 1 MYR = 0.18 GBP
  SGD: 0.31, // 1 MYR = 0.31 SGD
  AUD: 0.34, // 1 MYR = 0.34 AUD
  // Add more currencies as needed
};

export const getConvertedAmount = (amount, fromCurrency, toCurrency) => {
  try {
    console.log(`Converting ${amount} ${fromCurrency} to ${toCurrency}`);

    if (fromCurrency === 'MYR') {
      const rate = conversionRates[toCurrency];
      if (!rate) throw new Error(`Conversion rate for ${toCurrency} not found.`);
      const convertedAmount = amount * rate;
      console.log(`Conversion Rate: ${rate}`);
      console.log(`Converted Amount: ${convertedAmount}`);
      return convertedAmount;
    } else if (toCurrency === 'MYR') {
      const rate = conversionRates[fromCurrency];
      if (!rate) throw new Error(`Conversion rate for ${fromCurrency} not found.`);
      const convertedAmount = amount / rate;
      console.log(`Conversion Rate: ${rate}`);
      console.log(`Converted Amount: ${convertedAmount}`);
      return convertedAmount;
    } else {
      throw new Error('Conversion must involve MYR.');
    }
  } catch (error) {
    console.error('Error in manual conversion:', error);
    return amount; // Fallback to the original amount if conversion fails
  }
};

// Define a list of currencies for dropdowns or other uses
export const currencyList = [
  { code: 'MYR', name: 'Malaysian Ringgit' },
  { code: 'USD', name: 'US Dollar' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British Pound' },
  { code: 'SGD', name: 'Singapore Dollar' },
  { code: 'AUD', name: 'Australian Dollar' },
];

// Define a list of categories for your application
export const categoryList = [
  { id: 'food', name: 'Food' },
  { id: 'transportation', name: 'Transportation' },
  { id: 'accommodation', name: 'Accommodation' },
  { id: 'entertainment', name: 'Entertainment' },
  { id: 'shopping', name: 'Shopping' },
  { id: 'utilities', name: 'Utilities' },
  // Add more categories as needed
];

// Simplified payment types
export const paymentTypes = [
  'Cash',
  'Credit Card',
  'Debit Card',
  'E-Wallet',
];

// Define a list of wallets
export const wallets = [
  { country: 'Malaysia', name: 'TouchnGo' },
  { country: 'Singapore', name: 'PayLah' },
  // Add more wallets here
];

// Define a list of credit cards
export const creditCards = [
  { bank: 'Public Bank', type: 'Visa', last4: '3412', name: 'Platinum' },
  { bank: 'HSBC', type: 'MasterCard', last4: '1234', name: 'Gold' },
  // Add more credit cards here
];

// Define a list of debit cards
export const debitCards = [
  { bank: 'RHB', type: 'Visa', last4: '5678' },
  { bank: 'Maybank', type: 'MasterCard', last4: '9101' },
  // Add more debit cards here
];

export const investmentPlatforms = [
  'Robinhood',
  'E*TRADE',
  'Fidelity',
  'Charles Schwab',
  'TD Ameritrade',
  'Interactive Brokers',
  'Vanguard',
  'Merrill Edge',
  'Webull',
  'Coinbase',
  'Binance',
  'Kraken',
  // Add more platforms as needed
];

export const investmentTypes = [
  'Share',
  'Crypto',
  'Commodity',
  'Asset',
  'Pension'
];

export const investmentStyles = [
  { value: 'short', label: 'Short-term', description: 'Sell when some earning' },
  { value: 'longterm', label: 'Long-term', description: 'Sell when there is large increase and seems like it going to decrease' },
  { value: 'never', label: 'Never sell', description: 'Never sell, like pension fund' }
];

export const unitOptions = [
  'share',
  'gram',
  'litre',
  'ounce',
  'kilogram',
  'unit',
  // Add more units as needed
];
