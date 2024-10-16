// General.js

// Define manual conversion rates from MYR to other currencies
const conversionRates = {
  USD: 0.21, // 1 MYR = 0.21 USD
  EUR: 0.20, // 1 MYR = 0.20 EUR
  GBP: 0.17, // 1 MYR = 0.17 GBP
  SGD: 0.31, // 1 MYR = 0.31 SGD
  AUD: 0.33, // 1 MYR = 0.33 AUD
  RMB: 1.52, // 1 MYR = 1.52 RMB (Chinese Yuan)
  THB: 7.57, // 1 MYR = 7.57 THB (Thai Baht)
  IDR: 3290.00, // 1 MYR = 3290.00 IDR (Indonesian Rupiah)
  PHP: 11.94, // 1 MYR = 11.94 PHP (Philippine Peso)
  VND: 5150.00, // 1 MYR = 5150.00 VND (Vietnamese Dong)
  BND: 0.31, // 1 MYR = 0.31 BND (Brunei Dollar)
  KHR: 988.00, // 1 MYR = 988.00 KHR (Cambodian Riel)
  HKD: 1.65, // 1 MYR = 1.65 HKD (Hong Kong Dollar)
  MOP: 1.70, // 1 MYR = 1.70 MOP (Macanese Pataca)
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
  { code: 'MYR', name: 'Malaysian Ringgit', country: 'Malaysia', decimals: 2 },
  { code: 'USD', name: 'US Dollar', country: 'United States', decimals: 2 },
  { code: 'EUR', name: 'Euro', country: 'European Union', decimals: 2 },
  { code: 'GBP', name: 'British Pound', country: 'United Kingdom', decimals: 2 },
  { code: 'SGD', name: 'Singapore Dollar', country: 'Singapore', decimals: 2 },
  { code: 'AUD', name: 'Australian Dollar', country: 'Australia', decimals: 2 },
  { code: 'RMB', name: 'Chinese Yuan', country: 'China', decimals: 2 },
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
// Define a list of categories for your application
export const defaultCategory = [
  { id: 'food', name: 'Food', color: '#FF8C00' },                  // Dark Orange
  { id: 'leisure', name: 'Leisure', color: '#FF6347' },           // Tomato Red
  { id: 'accommodation', name: 'Accommodation', color: '#4682B4' },  // Steel Blue
  { id: 'utilities', name: 'Utilities', color: '#32CD32' },     // Lime Green
  { id: 'transport', name: 'Transport', color: '#FFD700' },     // Gold
  { id: 'grocery', name: 'Grocery', color: '#FFA07A' },         // Light Salmon
  { id: 'sport', name: 'Sport', color: '#20B2AA' },             // Light Sea Green
  { id: 'medical', name: 'Medical', color: '#FF4500' },         // Orange Red
  { id: 'mistake', name: 'Mistake', color: '#DC143C' },         // Crimson
  { id: 'household', name: 'Household', color: '#8A2BE2' },     // Blue Violet
  { id: 'social', name: 'Social', color: '#FF69B4' },           // Hot Pink
  { id: 'donation', name: 'Donation', color: '#B22222' },       // Fire Brick
  { id: 'hiring', name: 'Hiring', color: '#2E8B57' }   ,         // Sea Green
   { id: 'laundry', name: 'Laundry', color: '#87CEEB' },         // Sky Blue
  { id: 'phone_bills', name: 'Phone Bills', color: '#9370DB' }, // Medium Purple
  { id: 'gamble', name: 'Gamble', color: '#FF4500' },           // Orange Red
  { id: 'parents', name: 'Parents', color: '#8B4513' },         // Saddle Brown
  { id: 'kids', name: 'Kids', color: '#FFDAB9' },               // Peach Puff
  { id: 'self_learning', name: 'Self-Learning', color: '#48D1CC' }, // Medium Turquoise
  { id: 'love_partners', name: 'Love Partners', color: '#FFB6C1' }  // Light Pink
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
  // Add more units as needed
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
  // Add more banks as needed
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