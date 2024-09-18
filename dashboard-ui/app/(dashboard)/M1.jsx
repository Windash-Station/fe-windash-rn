import React, { useEffect, useState } from 'react';
import { Text, View, Button, ActivityIndicator, Dimensions, StyleSheet, TouchableOpacity } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import axios from 'axios';

const timeRanges = [
    { label: 'Live', value: 'live' },
    { label: '5 Minutes', value: '5m' },
    { label: '10 Minutes', value: '10m' },
    { label: '1 Hour', value: '1h' },
    { label: '12 Hours', value: '12h' },
];

const M1Dashboard = () => {
    const [sensorData, setSensorData] = useState([]); // Holds the latest data points
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedRange, setSelectedRange] = useState('live'); // Track selected time range

    // Define how many latest points you want to keep
    const MAX_DATA_POINTS = 5;

    // Function to fetch the latest sensor data
    const fetchSensorData = async (range) => {
        try {
            setLoading(true);
            let response;

            // Different endpoint for live data
            if (range === 'live') {
                response = await axios.get('http://192.168.100.199:3161/get/sensor-data/latest');
                if (response.data) {
                    setSensorData(prevData => {
                        const updatedData = [...prevData, response.data];
                        // Keep only the latest MAX_DATA_POINTS
                        if (updatedData.length > MAX_DATA_POINTS) {
                            updatedData.shift(); // Remove the oldest data point
                        }
                        return updatedData;
                    });
                }
            } else {
                // Fetch based on the selected time range
                response = await axios.get(`http://192.168.100.199:3161/get/sensor-data/${range}`);
                const latestDataPoints = response.data;

                // Ensure the data is an array and use slice safely
                if (Array.isArray(latestDataPoints)) {
                    setSensorData(latestDataPoints.slice(-MAX_DATA_POINTS)); // Keep only the latest 5 data points
                } else {
                    console.warn('Expected an array but got:', latestDataPoints);
                    setSensorData([]);
                }
            }

            setLoading(false);
        } catch (err) {
            console.error('Error fetching sensor data:', err);
            setError('Failed to load sensor data.');
            setLoading(false);
        }
    };

    // Fetch data when the component mounts or when the selected time range changes
    useEffect(() => {
        fetchSensorData(selectedRange);

        let interval;
        if (selectedRange === 'live') {
            // Set up interval to fetch live data every 1 second
            interval = setInterval(() => {
                fetchSensorData('live');
            }, 1000); // Fetch every second
        }

        // Cleanup interval on component unmount
        return () => clearInterval(interval);
    }, [selectedRange]);

    // Prepare data for the Line Chart
    const prepareChartData = () => {
        if (!sensorData || sensorData.length === 0) {
            return {
                labels: [],
                datasets: [
                    {
                        data: [],
                        color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
                        strokeWidth: 2,
                    },
                ],
                legend: ['Wind Speed (m/s)'],
            };
        }

        // Extract labels and data
        const labels = sensorData.map((dataPoint) => {
            const date = new Date(dataPoint.date); // Assuming the timestamp is in milliseconds
            const hours = date.getHours().toString().padStart(2, '0');
            const minutes = date.getMinutes().toString().padStart(2, '0');
            return `${hours}:${minutes}`;
        });

        const windSpeed = sensorData.map((dataPoint) => dataPoint.windSpeedmsData || 0);

        return {
            labels,
            datasets: [
                {
                    data: windSpeed,
                    color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
                    strokeWidth: 2,
                },
            ],
            legend: ['Wind Speed (m/s)'],
        };
    };

    // Chart configuration
    const chartConfig = {
        backgroundColor: '#ffffff',
        backgroundGradientFrom: '#ffffff',
        backgroundGradientTo: '#ffffff',
        decimalPlaces: 1, // optional, defaults to 2dp
        color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`, // black lines
        labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`, // black labels
        style: {
            borderRadius: 16,
        },
        propsForDots: {
            r: '3',
            strokeWidth: '1',
            stroke: '#ffa726',
        },
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>M1 Dashboard</Text>
            <View style={styles.buttonContainer}>
                {timeRanges.map((range) => (
                    <TouchableOpacity 
                        key={range.value} 
                        style={[styles.rangeButton, selectedRange === range.value && styles.selectedButton]}
                        onPress={() => setSelectedRange(range.value)}
                    >
                        <Text style={styles.buttonText}>{range.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#0000ff" />
            ) : error ? (
                <Text style={styles.errorText}>{error}</Text>
            ) : (
                <LineChart
                    data={prepareChartData()}
                    width={Dimensions.get('window').width * 0.9} // from react-native
                    height={220}
                    yAxisSuffix="m/s"
                    yAxisInterval={1} // optional, defaults to 1
                    chartConfig={chartConfig}
                    bezier
                    style={{
                        marginVertical: 8,
                        borderRadius: 16,
                    }}
                />
            )}
            <Text style={styles.subtitle}>Wind Speed Over Time</Text>
            <Button title="Go back" onPress={() => route.back()} />
        </View>
    );
};

export default M1Dashboard;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    subtitle: {
        fontSize: 16,
        marginTop: 16,
        color: '#555',
    },
    errorText: {
        color: 'red',
        fontSize: 16,
    },
    buttonContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginBottom: 16,
    },
    rangeButton: {
        backgroundColor: '#ccc',
        padding: 10,
        margin: 5,
        borderRadius: 5,
    },
    selectedButton: {
        backgroundColor: '#4CAF50',
    },
    buttonText: {
        color: '#fff',
        fontSize: 14,
    },
});
