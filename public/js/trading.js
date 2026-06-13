// Timeframe configuration
const TIMEFRAME = {
    minutes: 5,
    maxBars: 288, // 24 hours of 5-minute bars
    updateFrequencySeconds: 30,
    updateInterval: 30000, // 30 seconds in milliseconds
    maxDataPoints: 576, // 48 hours of 5-minute data points
    getCurrentTimestamp: () => Math.floor(Date.now() / 1000),
    getAlignedTimestamp: () => {
        const now = Math.floor(Date.now() / 1000);
        return now - (now % (TIMEFRAME.minutes * 60));
    },
    alignToInterval: (timestamp) => {
        return timestamp - (timestamp % (TIMEFRAME.minutes * 60));
    },
    isInSameInterval: (timestamp1, timestamp2) => {
        return TIMEFRAME.alignToInterval(timestamp1) === TIMEFRAME.alignToInterval(timestamp2);
    },
    formatTime: (timestamp) => {
        const date = new Date(timestamp * 1000);
        return date.toLocaleTimeString();
    }
};

// Chart configuration
const chartConfig = {
    layout: {
        background: { color: '#ffffff' },
        textColor: '#333333',
    },
    grid: {
        vertLines: { color: '#f0f0f0' },
        horzLines: { color: '#f0f0f0' },
    },
    timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: '#d1d4dc',
    },
    rightPriceScale: {
        borderColor: '#d1d4dc',
    },
};

const candlestickSeriesConfig = {
    upColor: '#26a69a',
    downColor: '#ef5350',
    borderVisible: false,
    wickUpColor: '#26a69a',
    wickDownColor: '#ef5350',
};

// Merge timeframe-specific settings with chart config
const mergedChartConfig = {
    ...chartConfig,
    width: window.innerWidth,
    height: window.innerHeight,
    timeScale: {
        ...chartConfig.timeScale,
        tickMarkFormatter: (time) => TIMEFRAME.formatTime(time)
    }
};

// Data Handler Class
class DataHandler {
    constructor() {
        this.data = [];
        this.listeners = new Set();
        this.lastUpdateTime = null;
    }

    addListener(callback) {
        this.listeners.add(callback);
    }

    removeListener(callback) {
        this.listeners.delete(callback);
    }

    notifyListeners() {
        this.listeners.forEach(callback => callback(this.data));
    }

    async waitForInitialData() {
        try {
            console.log('Fetching initial data...');
            const response = await fetch('http://localhost:3000/js/icp-price-data.json');
            const data = await response.json();
            
            console.log('Raw JSON response:', data);
            console.log('Current time:', new Date().toISOString());
            console.log('Data lastUpdate:', new Date(data.lastUpdate * 1000).toISOString());
            
            if (data.candlesticks && data.candlesticks.length > 0) {
                // Sort candlesticks chronologically
                const sortedCandlesticks = data.candlesticks.sort((a, b) => a.time - b.time);
                console.log('Sorted candlesticks:', sortedCandlesticks.length, 'items');
                
                // Validate and clean data
                this.data = sortedCandlesticks.filter(candle => 
                    candle.time && candle.open && candle.high && candle.low && candle.close
                );
                
                console.log('Valid candlesticks:', this.data.length);
                if (this.data.length > 0) {
                    console.log('First candlestick:', {
                        time: new Date(this.data[0].time * 1000).toISOString(),
                        ...this.data[0]
                    });
                    console.log('Last candlestick:', {
                        time: new Date(this.data[this.data.length - 1].time * 1000).toISOString(),
                        ...this.data[this.data.length - 1]
                    });
                    
                    this.lastUpdateTime = data.lastUpdate;
                    this.notifyListeners();
                    return true;
                }
            }
            console.log('No valid candlesticks found in data');
        } catch (error) {
            console.error('Error fetching initial data:', error);
        }
        return false;
    }

    startLiveUpdates() {
        console.log('Starting live updates with interval:', TIMEFRAME.updateInterval, 'ms');
        // Fetch updates at the configured interval
        setInterval(async () => {
            try {
                console.log('Fetching live update...');
                const response = await fetch('http://localhost:3000/js/icp-price-data.json');
                const data = await response.json();
                
                console.log('Live update raw data:', data);
                console.log('Current time:', new Date().toISOString());
                console.log('Data lastUpdate:', new Date(data.lastUpdate * 1000).toISOString());
                
                if (data.candlesticks && data.candlesticks.length > 0) {
                    // Sort and validate new candlesticks
                    const newCandlesticks = data.candlesticks
                        .filter(candle => 
                            candle.time && candle.open && candle.high && candle.low && candle.close
                        )
                        .sort((a, b) => a.time - b.time);
                    
                    console.log('New valid candlesticks:', newCandlesticks.length);
                    
                    if (newCandlesticks.length > 0) {
                        // Update existing candlesticks and add new ones
                        const existingTimes = new Set(this.data.map(c => TIMEFRAME.alignToInterval(c.time)));
                        
                        newCandlesticks.forEach(newCandle => {
                            const alignedTime = TIMEFRAME.alignToInterval(newCandle.time);
                            const existingIndex = this.data.findIndex(c => 
                                TIMEFRAME.alignToInterval(c.time) === alignedTime
                            );
                            
                            if (existingIndex !== -1) {
                                console.log(`Updating candlestick at ${TIMEFRAME.formatTime(alignedTime)}`);
                                this.data[existingIndex] = newCandle;
                            } else if (!existingTimes.has(alignedTime)) {
                                console.log(`Adding new candlestick at ${TIMEFRAME.formatTime(alignedTime)}`);
                                this.data.push(newCandle);
                            }
                        });
                        
                        // Sort and limit to maxBars
                        this.data.sort((a, b) => a.time - b.time);
                        if (this.data.length > TIMEFRAME.maxBars) {
                            this.data = this.data.slice(-TIMEFRAME.maxBars);
                        }
                        
                        console.log(`Total candlesticks after update: ${this.data.length}`);
                        this.lastUpdateTime = data.lastUpdate;
                        this.notifyListeners();
                    }
                } else {
                    console.log('No valid candlesticks in update');
                }
            } catch (error) {
                console.error('Error fetching live update:', error);
            }
        }, TIMEFRAME.updateInterval);
    }
}

// Chart Renderer Class
class ChartRenderer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            throw new Error(`Container element with id '${containerId}' not found`);
        }
        this.chart = null;
        this.candlestickSeries = null;
        this.initialize();
    }

    initialize() {
        console.log('Initializing chart with merged config:', mergedChartConfig);
        console.log('Time scale settings:', mergedChartConfig.timeScale);
        
        this.chart = LightweightCharts.createChart(this.container, mergedChartConfig);
        
        console.log('Chart created, applying candlestick series config:', candlestickSeriesConfig);
        this.candlestickSeries = this.chart.addCandlestickSeries(candlestickSeriesConfig);
        
        // Verify chart options after creation
        const appliedOptions = this.chart.options();
        console.log('Applied chart options:', appliedOptions);
        console.log('Applied time scale options:', this.chart.timeScale().options());
        
        this.handleResize = this.handleResize.bind(this);
        window.addEventListener('resize', this.handleResize);
        
        // Set initial time scale options
        this.chart.timeScale().applyOptions({
            timeVisible: true,
            secondsVisible: false,
            borderColor: 'rgba(255, 255, 255, 0.1)',
            tickMarkFormatter: (time) => {
                const formattedTime = TIMEFRAME.formatTime(time);
                console.log(`Formatting time ${time} to ${formattedTime}`);
                return formattedTime;
            }
        });
    }

    handleResize() {
        this.chart.applyOptions({
            width: window.innerWidth,
            height: window.innerHeight,
        });
    }

    updateChart(data) {
        if (!this.candlestickSeries || !data || data.length === 0) return;
        
        try {
            console.log('Raw data received:', data);
            
            // Sort data chronologically first
            const sortedData = [...data].sort((a, b) => a.time - b.time);
            console.log('Data sorted chronologically:', sortedData.length, 'candlesticks');

            // Process and validate each candlestick
            const validData = sortedData.map(candle => {
                // Ensure all required fields are present and numeric
                if (!candle.time || !candle.open || !candle.high || !candle.low || !candle.close) {
                    console.warn('Invalid candlestick data:', candle);
                    return null;
                }

                // Time conversion process
                const originalTime = candle.time;
                const alignedTime = TIMEFRAME.alignToInterval(originalTime);
                
                console.log('Processing candlestick:', {
                    originalTime: originalTime,
                    alignedTime: alignedTime,
                    humanReadable: new Date(alignedTime * 1000).toISOString(),
                    formatted: TIMEFRAME.formatTime(alignedTime),
                    open: candle.open,
                    high: candle.high,
                    low: candle.low,
                    close: candle.close
                });

                return {
                    time: alignedTime,
                    open: Number(candle.open),
                    high: Number(candle.high),
                    low: Number(candle.low),
                    close: Number(candle.close)
                };
            }).filter(candle => candle !== null);

            console.log('Processed data for chart:', validData);
            
            console.log('Setting data on candlestick series:', validData);
            this.candlestickSeries.setData(validData);
            
            // Apply time scale settings with detailed logging
            const timeScaleOptions = {
                timeVisible: true,
                secondsVisible: false,
                tickMarkFormatter: (time) => {
                    const formatted = TIMEFRAME.formatTime(time);
                    console.log('Formatting tick mark:', {
                        inputTime: time,
                        formatted: formatted,
                        date: new Date(time * 1000).toISOString()
                    });
                    return formatted;
                }
            };
            console.log('Applying time scale options:', timeScaleOptions);
            this.chart.timeScale().applyOptions(timeScaleOptions);
            
            this.chart.timeScale().fitContent();
        } catch (error) {
            console.error('Error updating chart:', error);
            if (window.updateDebugInfo) {
                window.updateDebugInfo(
                    'Chart Error',
                    new Date().toLocaleTimeString(),
                    error.message
                );
            }
        }
    }

    destroy() {
        if (this.chart) {
            window.removeEventListener('resize', this.handleResize);
            this.chart.remove();
            this.chart = null;
            this.candlestickSeries = null;
        }
    }
}

// Main Trading Chart Class
class TradingChart {
    constructor(containerId) {
        this.containerId = containerId;
        this.dataHandler = null;
        this.chartRenderer = null;
    }

    async initialize() {
        try {
            this.dataHandler = new DataHandler();
            this.chartRenderer = new ChartRenderer(this.containerId);

            this.dataHandler.addListener((data) => {
                this.chartRenderer.updateChart(data);
                if (data && data.length > 0) {
                    const latest = data[data.length - 1];
                    if (window.updateDebugInfo) {
                        const alignedTime = TIMEFRAME.alignToInterval(latest.time);
                        window.updateDebugInfo(
                            'Live',
                            `${TIMEFRAME.formatTime(alignedTime)} (${new Date(alignedTime * 1000).toISOString()})`,
                            `$${latest.close.toFixed(4)}`
                        );
                    }
                }
            });

            // Show loading message
            const loadingDiv = document.createElement('div');
            loadingDiv.id = 'loading-message';
            loadingDiv.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white; font-size: 20px;';
            loadingDiv.textContent = 'Loading ICP Price Data...';
            document.body.appendChild(loadingDiv);

            // Wait for initial data with timeout
            let hasData = false;
            let attempts = 0;
            const maxAttempts = 10;

            while (!hasData && attempts < maxAttempts) {
                hasData = await this.dataHandler.waitForInitialData();
                if (!hasData) {
                    if (window.updateDebugInfo) {
                        window.updateDebugInfo(
                            `Attempt ${attempts + 1}/${maxAttempts}`,
                            'Waiting...',
                            'N/A'
                        );
                    }
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    attempts++;
                }
            }

            // Remove loading message
            if (loadingDiv.parentNode) {
                loadingDiv.parentNode.removeChild(loadingDiv);
            }

            if (!hasData) {
                throw new Error('Failed to load initial data after multiple attempts');
            }
        } catch (error) {
            console.error('Initialization error:', error);
            if (window.updateDebugInfo) {
                window.updateDebugInfo(
                    `Error: ${error.message}`,
                    'Failed',
                    'N/A'
                );
            }
            throw error;
        }
    }

    startLiveUpdates() {
        if (this.dataHandler) {
            this.dataHandler.startLiveUpdates();
        }
    }

    destroy() {
        if (this.chartRenderer) {
            this.chartRenderer.destroy();
            this.chartRenderer = null;
        }
        this.dataHandler = null;
    }
}

export { TradingChart };
