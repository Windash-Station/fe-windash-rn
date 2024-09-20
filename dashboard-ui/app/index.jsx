import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, Dimensions, ScrollView } from 'react-native';
import axios from 'axios';
import { LineChart } from 'react-native-chart-kit';
import moment from 'moment';

const SensorDataDisplayGraph = () => {
  const [sensorData, setSensorData] = useState([]);
  const [selectedInterval, setSelectedInterval] = useState('live');
  const [isFetching, setIsFetching] = useState(false);
  const pollingIntervalRef = useRef(null);

  const screenWidth = Dimensions.get('window').width - 40; // Adjust for padding

  useEffect(() => {
    let pollingInterval;

    const fetchData = async () => {
      try {
        setIsFetching(true);

        const endDate = new Date();
        let startDate;
        let pollingRate = 2000; // Default polling rate for 'live' is 2 seconds

        if (selectedInterval === 'live') {
          // Live data: last 1 minute
          startDate = new Date(endDate.getTime() - 1 * 60 * 1000);
        } else {
          // Parse the selected interval to calculate startDate
          startDate = calculateStartDate(selectedInterval, endDate);
          pollingRate = null; // No polling for intervals other than 'live'
        }

        const response = await axios.get('http://192.168.100.54:3001/sensor-data', {
          params: {
            start: startDate.toISOString(),
            end: endDate.toISOString(),
          },
        });

        let data = response.data;

        // Process data according to the selected interval
        if (selectedInterval === 'live') {
          data = processDataIntoIntervals(data, startDate, endDate, 2000); // 2-second intervals
        } else {
          // For other intervals, aggregate data appropriately
          data = aggregateDataForInterval(data, selectedInterval);
        }

        setSensorData(data);
        setIsFetching(false);
      } catch (error) {
        console.error('Error fetching sensor data:', error);
        setIsFetching(false);
      }
    };

    // Initial fetch
    fetchData();

    // Set up polling only for 'live' interval
    if (selectedInterval === 'live') {
      pollingInterval = setInterval(fetchData, 2000); // Fetch data every 2 seconds
      pollingIntervalRef.current = pollingInterval;
    } 
    else if (selectedInterval !== 'live') {
      pollingInterval = setInterval(fetchData, 4000); // Fetch data every 2 seconds
      pollingIntervalRef.current = pollingInterval;
    }
    else {
      // Clear any existing polling intervals
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    }

    // Clean up on unmount or when selectedInterval changes
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [selectedInterval]);

  // Function to calculate startDate based on selectedInterval
  const calculateStartDate = (interval, endDate) => {
    const now = endDate;
    let startDate;

    switch (interval) {
      case '1min':
        startDate = new Date(now.getTime() - 1 * 60 * 1000);
        break;
      case '10mins':
        startDate = new Date(now.getTime() - 10 * 60 * 1000);
        break;
      case '30mins':
        startDate = new Date(now.getTime() - 30 * 60 * 1000);
        break;
      case '1hr':
        startDate = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case '12hrs':
        startDate = new Date(now.getTime() - 12 * 60 * 60 * 1000);
        break;
      case '1d':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '1w':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '1m':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        // Default to last 1 minute
        startDate = new Date(now.getTime() - 60 * 1000);
        break;
    }

    return startDate;
  };

  // Function to process data into specified intervals (e.g., 2-second intervals for 'live')
  const processDataIntoIntervals = (data, startDate, endDate, intervalDurationMs) => {
    const intervals = [];
    const intervalDuration = intervalDurationMs; // Interval duration in milliseconds

    for (let time = startDate.getTime(); time <= endDate.getTime(); time += intervalDuration) {
      const intervalStart = time;
      const intervalEnd = time + intervalDuration;

      // Filter data points within this interval
      const pointsInInterval = data.filter((d) => {
        const dataTime = new Date(d.date).getTime();
        return dataTime >= intervalStart && dataTime < intervalEnd;
      });

      // Get the latest value in the interval
      let value;
      if (pointsInInterval.length > 0) {
        value = pointsInInterval[pointsInInterval.length - 1].windSpeedmsData;
      } else {
        value = null;
      }

      intervals.push({
        date: new Date(intervalStart),
        value: value,
      });
    }

    return intervals;
  };

  // Function to aggregate data for longer intervals
  const aggregateDataForInterval = (data, interval) => {
    let timeUnit;
    let groupByFormat;

    switch (interval) {
      case '1min':
        timeUnit = 'second';
        groupByFormat = 'HH:mm';
        break;
      case '10mins':
        timeUnit = 'second';
        groupByFormat = 'HH:mm';
        break;
      case '30mins':
      case '1hr':
        timeUnit = 'minute';
        groupByFormat = 'YYYY-MM-DD HH:mm';
        break;
      case '12hrs':
      case '1d':
        timeUnit = 'hour';
        groupByFormat = 'YYYY-MM-DD HH';
        break;
      case '1w':
      case '1m':
        timeUnit = 'day';
        groupByFormat = 'YYYY-MM-DD';
        break;
      default:
        timeUnit = 'minute';
        groupByFormat = 'YYYY-MM-DD HH:mm';
        break;
    }

    const grouped = data.reduce((acc, curr) => {
      const date = moment(curr.date).format(groupByFormat);
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(curr.windSpeedmsData);
      return acc;
    }, {});

    const aggregated = Object.entries(grouped).map(([date, values]) => {
      const avgValue = values.reduce((sum, val) => sum + val, 0) / values.length;
      return { date: moment(date, groupByFormat).toDate(), value: avgValue };
    });

    // Sort data by date
    aggregated.sort((a, b) => new Date(a.date) - new Date(b.date));

    return aggregated;
  };

  // Limit the data to the most recent 6 points
  const limitedSensorData = sensorData.slice(-6);

  // Prepare the data for the Line chart with a maximum of 6 points
  const chartData = {
    labels: limitedSensorData.map((data) => moment(data.date).format('HH:mm:ss')),
    datasets: [
      {
        data: limitedSensorData.map((data) => data.value),
        color: (opacity = 1) => `rgba(75, 192, 192, ${opacity})`, // Line color
        strokeWidth: 2, // Line thickness
      },
    ],
    legend: ['Sensor Value'],
  };

  // Function to determine chart configuration based on selected interval
  const getChartConfig = () => ({
    backgroundGradientFrom: '#ffffff',
    backgroundGradientFromOpacity: 1,
    backgroundGradientTo: '#ffffff',
    backgroundGradientToOpacity: 1,
    decimalPlaces: 2, // Number of decimal places for y-axis labels
    color: (opacity = 1) => `rgba(75, 192, 192, ${opacity})`, // Line color
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`, // Label color
    propsForDots: {
      r: 2,
      strokeWidth: 1,
      stroke: '#4BC0C0',
    },
  });

  const handleIntervalChange = (interval) => {
    setSelectedInterval(interval);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.chartSection}>
        <Text style={styles.heading}>Sensor Data Over Time</Text>

        {/* Interval buttons */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.buttonContainer}>
          {['live','1min', '10mins', '30mins', '1hr', '12hrs', '1d', '1w', '1m'].map((interval) => (
            <TouchableOpacity
              key={interval}
              style={[
                styles.button,
                selectedInterval === interval && styles.buttonActive,
              ]}
              onPress={() => handleIntervalChange(interval)}
            >
              <Text
                style={[
                  styles.buttonText,
                  selectedInterval === interval && styles.buttonTextActive,
                ]}
              >
                {interval}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Chart Container */}
        <View style={styles.chartContainer}>
          {isFetching && limitedSensorData.length === 0 ? (
            <ActivityIndicator size="large" color="#007BFF" />
          ) : limitedSensorData.length > 0 ? (
            <LineChart
              data={chartData}
              width={screenWidth}
              height={220}
              chartConfig={getChartConfig()}
              bezier
              style={styles.chartStyle}
              fromZero={true}
              withDots={true}
              withInnerLines={false}
              withOuterLines={false}
            />
          ) : (
            <Text style={styles.noDataText}>No sensor data available.</Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

// React Native Styles
const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f7f7f7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  heading: {
    fontSize: 20,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    paddingHorizontal: 5,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#007BFF',
    borderRadius: 20,
    marginHorizontal: 5,
  },
  buttonActive: {
    backgroundColor: '#0056b3',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
  },
  buttonTextActive: {
    fontWeight: 'bold',
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 250,
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    elevation: 3, // For Android shadow
    shadowColor: '#000', // For iOS shadow
    shadowOffset: { width: 0, height: 2 }, // For iOS shadow
    shadowOpacity: 0.25, // For iOS shadow
    shadowRadius: 3.84, // For iOS shadow
  },
  chartStyle: {
    marginVertical: 8,
    borderRadius: 16,
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
  },
});

export default SensorDataDisplayGraph;
