import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement } from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);



const symbols = ['ethusdt', 'bnbusdt', 'dotusdt'];
const intervals = ['1m', '3m', '5m'];

const App = () => {
    const [selectedSymbol, setSelectedSymbol] = useState('ethusdt');
    const [selectedInterval, setSelectedInterval] = useState('1m');
    const [candlestickData, setCandlestickData] = useState({});
    const [chartData, setChartData] = useState([]);
    const [socket, setSocket] = useState(null);

    // Initialize WebSocket and fetch data
    useEffect(() => {
        const storedData = localStorage.getItem(selectedSymbol);
        if (storedData) {
            setChartData(JSON.parse(storedData));
        }

        const newSocket = new WebSocket(`wss://stream.binance.com:9443/ws/${selectedSymbol}@kline_${selectedInterval}`);
        setSocket(newSocket);

        newSocket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.k) {
                const candlestick = {
                    t: data.k.t, // Timestamp
                    o: data.k.o, // Open
                    h: data.k.h, // High
                    l: data.k.l, // Low
                    c: data.k.c, // Close
                    v: data.k.v  // Volume
                };

                setChartData(prevData => {
                    const updatedData = [...prevData, candlestick];
                    localStorage.setItem(selectedSymbol, JSON.stringify(updatedData));
                    return updatedData;
                });
            }
        };

        return () => {
            newSocket.close();
        };
    }, [selectedSymbol, selectedInterval]);

    const handleSymbolChange = (e) => {
        setSelectedSymbol(e.target.value);
        setChartData(JSON.parse(localStorage.getItem(e.target.value)) || []);
    };

    const handleIntervalChange = (e) => {
        setSelectedInterval(e.target.value);
    };

    const prepareChartData = () => {
        return {
            labels: chartData.map(data => new Date(data.t).toLocaleTimeString()),
            datasets: [
                {
                    label: 'Price',
                    data: chartData.map(data => data.c),
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                },
            ],
        };
    };

    return (
        <div style={{ maxWidth: '600px', margin: 'auto' }}>
            <h2>Binance Candlestick Chart</h2>
            <select value={selectedSymbol} onChange={handleSymbolChange}>
                {symbols.map(symbol => (
                    <option key={symbol} value={symbol}>
                        {symbol.toUpperCase()}
                    </option>
                ))}
            </select>
            <select value={selectedInterval} onChange={handleIntervalChange}>
                {intervals.map(interval => (
                    <option key={interval} value={interval}>
                        {interval}
                    </option>
                ))}
            </select>
            <Line data={prepareChartData()} />
        </div>
    );
};

export default App;