// General.js

// This function is now a placeholder and should not be used directly.
// It's kept here for reference on how the conversion was previously done.
export const getConvertedAmount = (amount, fromCurrency, toCurrency) => {
  console.warn('getConvertedAmount in General.js is deprecated. Use convertCurrency from conversionService.js instead.');
  return amount; // Returns the original amount without conversion
};

// Define a list of currencies for dropdowns or other uses
export const currencyList = [
  { code: 'MYR', name: 'Malaysian Ringgit', country: 'Malaysia', decimals: 2 },
  { code: 'USD', name: 'US Dollar', country: 'United States', decimals: 2 },
  { code: 'EUR', name: 'Euro', country: 'European Union', decimals: 2 },
  { code: 'GBP', name: 'British Pound', country: 'United Kingdom', decimals: 2 },
  { code: 'SGD', name: 'Singapore Dollar', country: 'Singapore', decimals: 2 },
  { code: 'AUD', name: 'Australian Dollar', country: 'Australia', decimals: 2 },
  { code: 'CNY', name: 'Chinese Yuan', country: 'China', decimals: 2 },
  { code: 'THB', name: 'Thai Baht', country: 'Thailand', decimals: 1 },
  { code: 'IDR', name: 'Indonesian Rupiah', country: 'Indonesia', decimals: 0 },
  { code: 'PHP', name: 'Philippine Peso', country: 'Philippines', decimals: 1 },
  { code: 'VND', name: 'Vietnamese Dong', country: 'Vietnam', decimals: 0 },
  { code: 'BND', name: 'Brunei Dollar', country: 'Brunei', decimals: 2 },
  { code: 'KHR', name: 'Cambodian Riel', country: 'Cambodia', decimals: 0 },
  { code: 'HKD', name: 'Hong Kong Dollar', country: 'Hong Kong', decimals: 2 },
  { code: 'MOP', name: 'Macanese Pataca', country: 'Macau', decimals: 2 },
];

export const getCurrencyDecimals = (currencyCode) => {
  const currency = currencyList.find(c => c.code === currencyCode);
  return currency ? currency.decimals : 2; // Default to 2 decimal places if not found
};

// The rest of the constants and functions remain unchanged
export const defaultCategory = [
  { id: 'food', name: 'Food', color: '#FF8C00' },
  { id: 'leisure', name: 'Leisure', color: '#FF6347' },
  { id: 'accommodation', name: 'Accommodation', color: '#4682B4' },
  { id: 'utilities', name: 'Utilities', color: '#32CD32' },
  { id: 'transport', name: 'Transport', color: '#FFD700' },
  { id: 'grocery', name: 'Grocery', color: '#FFA07A' },
  { id: 'sport', name: 'Sport', color: '#20B2AA' },
  { id: 'medical', name: 'Medical', color: '#FF4500' },
  { id: 'mistake', name: 'Mistake', color: '#DC143C' },
  { id: 'household', name: 'Household', color: '#8A2BE2' },
  { id: 'social', name: 'Social', color: '#FF69B4' },
  { id: 'donation', name: 'Donation', color: '#B22222' },
  { id: 'hiring', name: 'Hiring', color: '#2E8B57' },
  { id: 'laundry', name: 'Laundry', color: '#87CEEB' },
  { id: 'phone_bills', name: 'Phone Bills', color: '#9370DB' },
  { id: 'gamble', name: 'Gamble', color: '#FF4500' },
  { id: 'parents', name: 'Parents', color: '#8B4513' },
  { id: 'kids', name: 'Kids', color: '#FFDAB9' },
  { id: 'self_learning', name: 'Self-Learning', color: '#48D1CC' },
  { id: 'love_partners', name: 'Love Partners', color: '#FFB6C1' }
];

export const paymentTypes = [
  'Cash',
  'Credit Card',
  'Debit Card',
  'E-Wallet',
];

export const wallets = [
  { country: 'Malaysia', name: 'TouchnGo' },
  { country: 'Singapore', name: 'PayLah' },
];

export const creditCards = [
  { bank: 'Public Bank', type: 'Visa', last4: '3412', name: 'Platinum' },
  { bank: 'HSBC', type: 'MasterCard', last4: '1234', name: 'Gold' },
];

export const debitCards = [
  { bank: 'RHB', type: 'Visa', last4: '5678' },
  { bank: 'Maybank', type: 'MasterCard', last4: '9101' },
];

export const investmentPlatforms = [
  { country: 'Malaysia', platforms: ['Luno', 'Remitano', 'eToro', 'Binance', 'Webull', 'Moomoo'] },
  { country: 'Singapore', platforms: ['Tiger Brokers', 'Saxo Markets', 'Moomoo', 'FSMOne', 'OCBC Securities', 'DBS Vickers', 'Binance', 'Kraken', 'Coinbase'] },
  { country: 'Vietnam', platforms: ['Binance', 'Remitano', 'VNDIRECT', 'SSI Securities', 'HSC', 'Coinbase', 'Kraken', 'Moomoo'] }
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
];

export const banks = [
  'Public Bank',
  'HSBC',
  'RHB',
  'Maybank',
  'CIMB',
  'AmBank',
  'Hong Leong Bank',
  'Standard Chartered',
  'UOB',
  'OCBC Bank',
];

export const shopCategories = [
  'Grocery',
  'Fashion',
  'Electronics',
  'Home & Garden',
  'Health & Beauty',
  'Sports',
  'Toys & Games',
  'Automotive',
  'Pets',
  'Food & Beverage',
  'Jewelry ',
  'Travel',
  'Services',
  'E-wallet',
  'Other'
];