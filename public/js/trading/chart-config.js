export const chartConfig = {
    width: window.innerWidth,
    height: window.innerHeight,
    layout: {
        background: { type: 'solid', color: '#131722' },  // Even darker background
        textColor: '#d1d4dc',                             // Bright text
        fontSize: 12,                                     // Readable font size
    },
    grid: {
        vertLines: { color: 'rgba(42, 46, 57, 0.6)' },   // Slightly more visible grid
        horzLines: { color: 'rgba(42, 46, 57, 0.6)' },
    },
    crosshair: {
        mode: LightweightCharts.CrosshairMode.Normal,
        vertLine: {
            color: '#758696',
            width: 1,
            style: 3,           // Dotted line
            labelBackgroundColor: '#131722',
        },
        horzLine: {
            color: '#758696',
            width: 1,
            style: 3,           // Dotted line
            labelBackgroundColor: '#131722',
        },
    },
    timeScale: {
        rightOffset: 12,         // More space on the right
        barSpacing: 40,          // Wider spacing for better visibility
        minBarSpacing: 20,       // Minimum spacing to prevent overlap
        fixLeftEdge: true,
        fixRightEdge: true,
        visible: true,
        borderColor: 'rgba(42, 46, 57, 0.8)',  // More visible border
        timeVisible: true,
        secondsVisible: false,
        tickMarkFormatter: undefined,  // Set by trading.js
        lockVisibleTimeRangeOnResize: true,
    },
    rightPriceScale: {
        borderColor: 'rgba(42, 46, 57, 0.8)',  // More visible border
        visible: true,
        scaleMargins: {
            top: 0.2,    // More margin at top
            bottom: 0.2  // More margin at bottom
        },
        autoScale: true,  // Automatically adjust scale
        entireTextOnly: true,  // Show full price text
    },
    handleScale: {
        mouseWheel: true,    // Enable zoom with mouse wheel
        pinch: true,         // Enable zoom with pinch gestures
        axisPressedMouseMove: true,  // Enable axis movement
    },
    handleScroll: {
        mouseWheel: true,    // Enable scroll with mouse wheel
        pressedMouseMove: true,  // Enable scroll with mouse drag
        horzTouchDrag: true,    // Enable horizontal touch scroll
        vertTouchDrag: true,    // Enable vertical touch scroll
    }
};

export const candlestickSeriesConfig = {
    upColor: '#26a69a',       // Green for up bars
    downColor: '#ef5350',     // Red for down bars
    borderVisible: true,
    wickVisible: true,
    borderUpColor: '#26a69a',
    borderDownColor: '#ef5350',
    wickUpColor: '#26a69a',
    wickDownColor: '#ef5350',
    priceFormat: {
        type: 'price',
        precision: 4,         // Show 4 decimal places
        minMove: 0.0001,      // Minimum price movement
    },
    priceLineVisible: true,   // Show the last price line
    priceLineWidth: 1,
    priceLineColor: '#4c525e',
    priceLineStyle: 2,        // Dashed line
    lastValueVisible: true,   // Show the last value
    baseLineVisible: true,    // Show base line
    baseLineColor: '#4c525e',
    baseLineWidth: 1,
    baseLineStyle: 0,         // Solid line
};

export const dataConfig = {
    maxDataPoints: 50,
    updateInterval: 2000, // milliseconds
    initialPrice: 100,
    priceVariation: 0.1, // 10% variation
};
