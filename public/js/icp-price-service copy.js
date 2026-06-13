import { TIMEFRAME } from './trading/timeframe-config.js';

// Constants
const API_URL = "https://api.dexscreener.com/latest/dex/pairs/icp/mohjv-bqaaa-aaaag-qjyia-cai";

// In-memory database
let database = {
    lastUpdate: TIMEFRAME.getCurrentTimestamp(),
    currentPrice: null,
    candlesticks: [],
    currentCandlestick: null,
    metadata: {
        version: '1.0.0',
        timeframe: `${TIMEFRAME.minutes}m`,
    }
};

async function fetchPriceData() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching price data:', error);
        return null;
    }
}

function calculatePrice(priceNative) {
    return parseFloat(priceNative);
}

function addPriceData(price, timestamp) {
    if (!database.currentCandlestick || 
        timestamp >= database.currentCandlestick.timestamp + TIMEFRAME.minutes * 60 * 1000) {
        if (database.currentCandlestick) {
            database.candlesticks.push(database.currentCandlestick);
        }
        database.currentCandlestick = {
            timestamp,
            open: price,
            high: price,
            low: price,
            close: price,
            volume: 0
        };
    } else {
        database.currentCandlestick.high = Math.max(database.currentCandlestick.high, price);
        database.currentCandlestick.low = Math.min(database.currentCandlestick.low, price);
        database.currentCandlestick.close = price;
    }
}

async function updatePriceData() {
    const data = await fetchPriceData();
    if (!data || !data.pair) {
        console.error('Invalid price data received');
        return;
    }

    const price = calculatePrice(data.pair.priceNative);
    const timestamp = Date.now();

    database.currentPrice = price;
    database.lastUpdate = timestamp;
    addPriceData(price, timestamp);

    return database;
}

// Export functions and data for external use
export const ICPPriceService = {
    database,
    updatePriceData,
    fetchPriceData,
    calculatePrice
};

// Start updating price data
setInterval(updatePriceData, TIMEFRAME.minutes * 60 * 1000);
updatePriceData(); // Initial update
