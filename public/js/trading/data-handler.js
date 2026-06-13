import { dataConfig } from './chart-config.js';

export class DataHandler {
    constructor() {
        this.data = [];
        this.listeners = new Set();
    }

    // Add a listener for data updates
    addListener(callback) {
        this.listeners.add(callback);
    }

    // Remove a listener
    removeListener(callback) {
        this.listeners.delete(callback);
    }

    // Notify all listeners of data updates
    notifyListeners() {
        this.listeners.forEach(callback => callback(this.data));
    }

    // Generate initial historical data
    generateInitialData() {
        const data = [];
        let currentPrice = dataConfig.initialPrice;
        
        for (let i = 0; i < dataConfig.maxDataPoints; i++) {
            const date = new Date();
            date.setDate(date.getDate() - (dataConfig.maxDataPoints - i));
            
            const open = currentPrice * (1 + (Math.random() - 0.5) * dataConfig.priceVariation);
            const high = open * (1 + Math.random() * 0.05);
            const low = open * (1 - Math.random() * 0.05);
            const close = low + Math.random() * (high - low);
            
            data.push({
                time: date.toISOString().split('T')[0],
                open: open,
                high: high,
                low: low,
                close: close,
            });
            
            currentPrice = close;
        }
        this.data = data;
        this.notifyListeners();
    }

    // Update data with new JSON data
    updateData(newData) {
        // Assuming newData is in the format { time, open, high, low, close }
        this.data.push(newData);
        if (this.data.length > dataConfig.maxDataPoints) {
            this.data.shift();
        }
        this.notifyListeners();
    }

    // Method to handle real-time JSON updates
    async startLiveUpdates(jsonUrl) {
        // This method would be implemented to fetch from your JSON source
        // For now, we'll simulate updates
        setInterval(() => {
            const lastData = this.data[this.data.length - 1];
            const nextDate = new Date(lastData.time);
            nextDate.setDate(nextDate.getDate() + 1);
            
            const nextData = {
                time: nextDate.toISOString().split('T')[0],
                open: lastData.close,
                high: lastData.close * (1 + Math.random() * 0.05),
                low: lastData.close * (1 - Math.random() * 0.05),
                close: lastData.close * (1 + (Math.random() - 0.5) * 0.1),
            };

            this.updateData(nextData);
        }, dataConfig.updateInterval);
    }

    // Method to fetch data from a JSON file
    async fetchJsonData(jsonUrl) {
        try {
            const response = await fetch(jsonUrl);
            const data = await response.json();
            // Process the data according to your JSON structure
            return data;
        } catch (error) {
            console.error('Error fetching JSON data:', error);
            return null;
        }
    }
}
