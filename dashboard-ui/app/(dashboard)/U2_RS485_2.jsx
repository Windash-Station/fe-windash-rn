import React, { useEffect, useState, useRef } from 'react';
import {
  Text,
  View,
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import axios from 'axios';

const timeRanges = [
  { label: 'Live', value: 'live' },
  { label: '5 Minutes', value: '5m' },
  { label: '30 Minutes', value: '30m' },
  { label: '1 Hour', value: '1h' },
  { label: '6 Hours', value: '6h' },
  { label: '12 Hours', value: '12h' },
  { label: '1 Day', value: '1d' },
  { label: '1 Week', value: '1w' },
  { label: '1 Month', value: '1m' },
];

const U2Dashboard = () => {
  const [sensorData, setSensorData] = useState([]); // Holds the data points
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRange, setSelectedRange] = useState('live'); // Track selected time range
  const ws = useRef(null);

  // Function to fetch historical sensor data
  const fetchSensorData = async (range) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://192.168.100.199:3000/get/sensor-data/${range}`
      );
      const dataPoints = response.data;

      if (Array.isArray(dataPoints)) {
        setSensorData(dataPoints);
      } else {
        console.warn('Expected an array but got:', dataPoints);
        setSensorData([]);
      }

      setLoading(false);
    } catch (err) {
      console.error('Error fetching sensor data:', err);
      setError('Failed to load sensor data.');
      setLoading(false);
    }
  };

  // UseEffect for handling data fetching based on selected range
  useEffect(() => {
    if (selectedRange === 'live') {
      // WebSocket setup for live data
      try {
        ws.current = new WebSocket('ws://192.168.100.199:3000');

        ws.current.onopen = () => {
          console.log('Connected to WebSocket server');
          setLoading(false);
        };

        ws.current.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            setSensorData((prevData) => {
              const updatedData = [...prevData, data];
              if (updatedData.length > 20) {
                updatedData.shift();
              }
              return updatedData;
            });
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        ws.current.onerror = (err) => {
          console.error('WebSocket error:', err);
          setError('WebSocket connection error');
          setLoading(false);
        };

        ws.current.onclose = () => {
          console.log('WebSocket connection closed');
        };
      } catch (wsError) {
        console.error('WebSocket setup error:', wsError);
        setError('Failed to establish WebSocket connection.');
      }
    } else {
      // Fetch historical data for the selected range
      fetchSensorData(selectedRange);
    }

    // Cleanup function
    return () => {
      if (ws.current) {
        ws.current.close();
        ws.current = null;
      }
    };
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

    const labels = sensorData.map((dataPoint) => {
      if (!dataPoint.date) {
        console.warn('Missing date in dataPoint:', dataPoint);
        return '';
      }
      const date = new Date(dataPoint.date);
      if (isNaN(date.getTime())) {
        console.warn('Invalid date in dataPoint:', dataPoint);
        return '';
      }
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');

      if (selectedRange === 'live') {
        const seconds = date.getSeconds().toString().padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
      } else {
        return `${hours}:${minutes}`;
      }
    });

    const windSpeed = sensorData.map(
      (dataPoint) => dataPoint.windSpeedmsData || 0
    );

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
      <Text style={styles.title}>U2_RS485_2 Dashboard</Text>
      <View style={styles.buttonContainer}>
        {timeRanges.map((range) => (
          <TouchableOpacity
            key={range.value}
            style={[
              styles.rangeButton,
              selectedRange === range.value && styles.selectedButton,
            ]}
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
          yAxisSuffix=" m/s"
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
      <TouchableOpacity
        style={styles.backButton}
        // onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>Go back</Text>
      </TouchableOpacity>
    </View>
  );
};

export default U2Dashboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 16,
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
  backButton: {
    marginTop: 20,
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 14,
  },
});