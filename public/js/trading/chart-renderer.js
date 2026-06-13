import { chartConfig, candlestickSeriesConfig } from './chart-config.js';

export class ChartRenderer {
    constructor() {
        this.chart = null;
        this.candlestickSeries = null;
        this.chartElement = null;
        this.initialize();
    }

    initialize() {
        // Create chart element
        this.chartElement = document.createElement('div');
        this.chartElement.id = 'chart-background';
        document.body.insertBefore(this.chartElement, document.body.firstChild);

        // Create chart instance
        this.chart = LightweightCharts.createChart(this.chartElement, {
            ...chartConfig,
            width: window.innerWidth,
            height: window.innerHeight,
        });

        // Add candlestick series
        this.candlestickSeries = this.chart.addCandlestickSeries(candlestickSeriesConfig);

        // Handle window resize
        this.handleResize = this.handleResize.bind(this);
        window.addEventListener('resize', this.handleResize);
    }

    handleResize() {
        this.chart.applyOptions({
            width: window.innerWidth,
            height: window.innerHeight,
        });
    }

    updateChart(data) {
        if (!this.candlestickSeries) return;
        
        // Update the series with new data
        this.candlestickSeries.setData(data);

        // Update visible range
        const timeScale = this.chart.timeScale();
        timeScale.setVisibleRange({
            from: data[0].time,
            to: data[data.length - 1].time,
        });
    }

    // Clean up resources
    destroy() {
        if (this.chart) {
            window.removeEventListener('resize', this.handleResize);
            this.chart.remove();
            this.chart = null;
            this.candlestickSeries = null;
        }
        if (this.chartElement && this.chartElement.parentNode) {
            this.chartElement.parentNode.removeChild(this.chartElement);
            this.chartElement = null;
        }
    }
}
