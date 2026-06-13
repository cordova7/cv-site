// Timeframe configuration for candlestick chart
export const TIMEFRAME = {
    // Core values - the ONLY place these numbers exist
    minutes: 15,                    // Each candlestick represents 15 minutes
    updateFrequencySeconds: 10,     // Update every 10 seconds to reduce API load
    
    // Time boundaries
    get minuteMs() { return 60 * 1000 },
    get intervalMs() { return this.minutes * this.minuteMs },
    get seconds() { return this.minutes * 60 },
    get milliseconds() { return this.seconds * 1000 },
    get updateInterval() { return this.updateFrequencySeconds * 1000 },
    
    // Time window settings
    get visibleBars() { return 50 },           // Number of bars visible by default
    get maxBars() { return 200 },              // Maximum bars to store
    get maxDataPoints() { return 1000 },       // Maximum price points to store
    
    // Time alignment with timezone handling
    alignToInterval(timestamp) {
        // Convert to milliseconds and align to interval
        const ms = timestamp * 1000;
        const aligned = Math.floor(ms / this.intervalMs) * this.intervalMs;
        
        // Convert back to seconds
        const alignedSeconds = aligned / 1000;
        
        console.log('Time alignment:', {
            input: timestamp,
            inputDate: new Date(timestamp * 1000).toISOString(),
            aligned: alignedSeconds,
            alignedDate: new Date(aligned).toISOString(),
            interval: this.minutes + ' minutes'
        });
        
        return alignedSeconds;
    },
    
    // Current time helpers with timezone handling
    getCurrentTimestamp() {
        const now = Math.floor(Date.now() / 1000);
        console.log('Current time:', {
            timestamp: now,
            date: new Date(now * 1000).toISOString(),
            localTime: new Date(now * 1000).toLocaleTimeString()
        });
        return now;
    },
    
    getAlignedTimestamp() {
        const aligned = this.alignToInterval(this.getCurrentTimestamp());
        console.log('Aligned current time:', {
            timestamp: aligned,
            date: new Date(aligned * 1000).toISOString(),
            localTime: new Date(aligned * 1000).toLocaleTimeString()
        });
        return aligned;
    },
    
    // Bar management
    get maxBars() { return 200 },  // Keep more historical bars
    get maxDataPoints() { return this.maxBars * this.minutes * 60 }, // Keep enough points for historical bars
    
    // Chart display settings
    chartConfig: {
        barSpacing: 40,          // Increased for wider bars
        minBarSpacing: 20,       // Increased minimum spacing
        rightOffset: 5,          // Reduced right margin
        timeVisible: true,
        secondsVisible: false,
        fixLeftEdge: true,       // Lock left edge
        fixRightEdge: true,      // Lock right edge
        lockVisibleTimeRangeOnResize: true // Keep zoom level on resize
    },
    
    // Time formatting
    formatTime(timestamp) {
        const date = new Date(timestamp * 1000);
        return date.toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit'
        });
    },
    
    // Bar aggregation
    aggregateBar(prices, timestamp) {
        if (!prices || prices.length === 0) return null;
        return {
            time: this.alignToInterval(timestamp),
            open: prices[0],
            high: Math.max(...prices),
            low: Math.min(...prices),
            close: prices[prices.length - 1]
        };
    },
    
    // Data management with improved time handling
    aggregateData(rawPrices) {
        console.log('Aggregating data from', rawPrices.length, 'price points');
        
        // Group prices by interval
        const bars = new Map();
        rawPrices.forEach(price => {
            const barTime = this.alignToInterval(price.time);
            if (!bars.has(barTime)) {
                bars.set(barTime, []);
            }
            bars.get(barTime).push(price.price);
            console.log(`Added price ${price.price} to interval ${this.formatTime(barTime)}`);
        });
        
        // Convert to array and sort by time
        const sortedBars = Array.from(bars.entries())
            .sort((a, b) => a[0] - b[0]);
        
        console.log('Created', sortedBars.length, 'bars');
        
        // Create candlesticks
        const candlesticks = sortedBars
            .map(([time, prices]) => {
                const bar = this.aggregateBar(prices, time);
                if (bar) {
                    console.log(`Created candlestick for ${this.formatTime(time)}:`, bar);
                }
                return bar;
            })
            .filter(bar => bar !== null);
        
        // Keep only the most recent bars up to maxBars
        const result = candlesticks.slice(-this.maxBars);
        console.log(`Returning ${result.length} candlesticks out of ${candlesticks.length} total`);
        
        return result;
    },

    // Validation
    isInSameInterval(timestamp1, timestamp2) {
        return this.alignToInterval(timestamp1) === this.alignToInterval(timestamp2);
    }
};
