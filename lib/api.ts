import axios from 'axios';

const EXCHANGE_RATE_API = 'https://api.exchangerate-api.com/v4/latest/USD';
const CRYPTO_API = 'https://api.coingecko.com/api/v3/simple/price?ids=ethereum,tether,matic-network,usd-coin&vs_currencies=usd';

export const getExchangeRates = async () => {
  try {
    const response = await axios.get(EXCHANGE_RATE_API);
    return response.data.rates;
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    throw error;
  }
};

export const getCryptoRates = async () => {
  try {
    const response = await axios.get(CRYPTO_API);
    return {
      ethereum: response.data.ethereum.usd,
      usdt: response.data.tether.usd,
      polygon: response.data['matic-network'].usd,
      usdc: response.data['usd-coin'].usd
    };
  } catch (error) {
    console.error('Error fetching crypto rates:', error);
    throw error;
  }
};

export const convertCurrency = (amount: number, fromRate: number, toRate: number) => {
  return (amount / fromRate) * toRate;
};