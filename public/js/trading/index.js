import { DataHandler } from './data-handler.js';
import { ChartRenderer } from './chart-renderer.js';

class TradingChart {
    constructor() {
        this.dataHandler = null;
        this.chartRenderer = null;
    }

    initialize() {
        // Create instances
        this.dataHandler = new DataHandler();
        this.chartRenderer = new ChartRenderer();

        // Set up data handler listener
        this.dataHandler.addListener((data) => {
            this.chartRenderer.updateChart(data);
        });

        // Generate initial data
        this.dataHandler.generateInitialData();
    }

    // Start live updates with a JSON source
    startLiveUpdates(jsonUrl) {
        if (this.dataHandler) {
            this.dataHandler.startLiveUpdates(jsonUrl);
        }
    }

    // Method to update with specific JSON data
    updateWithJson(jsonData) {
        if (this.dataHandler) {
            this.dataHandler.updateData(jsonData);
        }
    }

    // Clean up resources
    destroy() {
        if (this.chartRenderer) {
            this.chartRenderer.destroy();
            this.chartRenderer = null;
        }
        this.dataHandler = null;
    }
}

// Initialize when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
    const tradingChart = new TradingChart();
    tradingChart.initialize();

    // Example of starting live updates
    // tradingChart.startLiveUpdates('your-json-url-here');

    // Example of updating with specific JSON data
    // tradingChart.updateWithJson({
    //     time: '2024-01-27',
    //     open: 100,
    //     high: 105,
    //     low: 98,
    //     close: 103
    // });

    // Make it available globally for external updates
    window.tradingChart = tradingChart;
});
