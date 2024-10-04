import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import axios from 'axios';
import { LineChart } from 'react-native-chart-kit';
import moment from 'moment';

const CustomLineChart = () => {
  const [sensorData, setSensorData] = useState([]);
  const [selectedInterval, setSelectedInterval] = useState('live');
  const [isFetching, setIsFetching] = useState(false);
  const [tooltipData, setTooltipData] = useState(null); // For displaying value on click
  const pollingIntervalRef = useRef(null);

  const fetchData = useCallback(async () => {
    try {
      setIsFetching(true);

      const endDate = moment().utc();
      let startDate;

      if (selectedInterval === 'live') {
        // For 'live' interval, fetch data for the last 5 seconds
        startDate = endDate.clone().subtract(5, 'seconds');
      } else if (selectedInterval === '5mins') {
        // For '5mins' interval, fetch data for the last 5 minutes
        startDate = endDate.clone().subtract(5, 'minutes');
      } else {
        startDate = calculateStartDate(selectedInterval, endDate);
      }

      console.log(
        `Fetching data from ${startDate.toISOString()} to ${endDate.toISOString()} for interval ${selectedInterval}`
      );

      const response = await axios.get(
        'http://192.168.100.199:3161/get/sensor-data/all/',
        {
          params: {
            start: startDate.toISOString(),
            end: endDate.toISOString(),
          },
        }
      );

      console.log('Response status:', response.status);

      let data = response.data.sensorData;

      if (!Array.isArray(data)) {
        console.error('Data is not an array:', data);
        data = [];
      }

      console.log('Received data length:', data.length);

      if (data.length === 0) {
        console.warn('No data received for the selected interval.');
        return;
      }

      // Process the data
      const processedData = data
        .filter(item => item.date && moment(item.date).isValid())
        .map(item => ({
          date: item.date, // Store date as ISO string
          value: item.value
        }))
        .sort((a, b) => new Date(a.date) - new Date(b.date));

      if (selectedInterval === 'live') {
        // For 'live' interval, process data into 1-second intervals
        const chartData = processDataForInterval(processedData, startDate, endDate, 1); // 1-second intervals
        setSensorData(chartData);
      } else if (selectedInterval === '5mins') {
        // For '5mins' interval, process data into 1-minute intervals
        const chartData = processDataForInterval(processedData, startDate, endDate, 60); // 60-second intervals
        setSensorData(chartData);
      } else {
        const aggregatedData = aggregateDataForInterval(processedData, selectedInterval);
        setSensorData(aggregatedData);
      }
    } catch (error) {
      console.error('Error fetching sensor data:', error);
    } finally {
      setIsFetching(false);
    }
  }, [selectedInterval]);

  useEffect(() => {
    fetchData();

    let intervalId;
    if (selectedInterval === 'live') {
        intervalId = setInterval(fetchData, 1000); // Update every second
    } else if (selectedInterval === '5mins') {
        intervalId = setInterval(fetchData, 10000); // Update every 10 seconds for a progressive feel
    } else {
        // For other intervals, adjust as needed
        intervalId = setInterval(fetchData, 60000); // Update every minute
    }

    pollingIntervalRef.current = intervalId;

    return () => {
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
        }
    };
}, [selectedInterval, fetchData]);


  const calculateStartDate = useCallback((interval, endDate) => {
    const now = moment(endDate);
    switch (interval) {
      case '30mins': return now.clone().subtract(30, 'minutes');
      case '1hr': return now.clone().subtract(1, 'hours');
      case '12hrs': return now.clone().subtract(12, 'hours');
      case '1d': return now.clone().subtract(1, 'days');
      case '1w': return now.clone().subtract(1, 'weeks');
      case '1m': return now.clone().subtract(1, 'months');
      default: return now.clone().subtract(5, 'minutes');
    }
  }, []);

  // Function to process data into fixed intervals over the selected time range
// Function to process data into fixed intervals over the selected time range
const processDataForInterval = useCallback((data, startDate, endDate, intervalSeconds) => {
    const timeLabels = [];
    const dataPoints = [];
    const intervalCount = Math.floor(moment.duration(endDate.diff(startDate)).asSeconds() / intervalSeconds);

    for (let i = 0; i <= intervalCount; i++) {
        const intervalStart = startDate.clone().add(i * intervalSeconds, 'seconds');
        const intervalEnd = intervalStart.clone().add(intervalSeconds, 'seconds');
        const labelFormat = intervalSeconds >= 60 ? 'HH:mm' : 'HH:mm:ss';
        timeLabels.push(intervalStart.format(labelFormat));

        // Filter data points within the current interval
        const pointsInInterval = data.filter(d => {
            const dataTime = moment.utc(d.date);
            return dataTime.isSameOrAfter(intervalStart) && dataTime.isBefore(intervalEnd);
        });

        if (pointsInInterval.length > 0) {
            // Calculate average value for the interval
            const avgValue = pointsInInterval.reduce((sum, d) => sum + d.value, 0) / pointsInInterval.length;
            dataPoints.push(avgValue);
        } else {
            // Use previous value or default to 0
            const lastValue = dataPoints.length > 0 ? dataPoints[dataPoints.length - 1] : 0;
            dataPoints.push(lastValue);
        }
    }

    return { labels: timeLabels, data: dataPoints };
}, []);


  const aggregateDataForInterval = useCallback((data, interval) => {
    if (data.length === 0) return [];

    let groupByFormat;
    let customGrouping = false;

    switch (interval) {
      case '30mins':
        customGrouping = true;
        break;
      case '1hr':
      case '12hrs':
        groupByFormat = 'YYYY-MM-DD HH';
        break;
      case '1d':
      case '1w':
      case '1m':
        groupByFormat = 'YYYY-MM-DD';
        break;
      default:
        groupByFormat = 'YYYY-MM-DD HH:mm';
        break;
    }

    const grouped = new Map();

    data.forEach((curr) => {
      let dateKey;
      const currDate = moment.utc(curr.date);
      if (customGrouping) {
        const minutes = Math.floor(currDate.minutes() / 30) * 30;
        dateKey = currDate.format(`YYYY-MM-DD HH:${minutes.toString().padStart(2, '0')}`);
      } else {
        dateKey = currDate.format(groupByFormat);
      }
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, []);
      }
      grouped.get(dateKey).push(curr.value);
    });

    return Array.from(grouped).map(([dateKey, values]) => ({
      date: dateKey, // Store date as string
      value: values.reduce((sum, val) => sum + val, 0) / values.length,
    })).sort((a, b) => new Date(a.date) - new Date(b.date));
  }, []);

  const getLabelFormat = useCallback(() => {
    // Return time format without date
    switch (selectedInterval) {
      case 'live':
        return 'HH:mm:ss';
      case '5mins':
        return 'HH:mm';
      case '30mins':
      case '1hr':
      case '12hrs':
        return 'HH:mm';
      case '1d':
      case '1w':
      case '1m':
        return 'MM-DD';
      default:
        return 'HH:mm';
    }
  }, [selectedInterval]);

  const chartData = useMemo(() => {
    if (sensorData && sensorData.labels && sensorData.data) {
        return {
            labels: sensorData.labels,
            datasets: [
                {
                    data: sensorData.data,
                    color: (opacity = 1) => `rgba(75, 192, 192, ${opacity})`,
                    strokeWidth: 2,
                },
            ],
        };
    }
    return {
        labels: [],
        datasets: [
            {
                data: [],
                color: (opacity = 1) => `rgba(75, 192, 192, ${opacity})`,
                strokeWidth: 2,
            },
        ],
    };
}, [sensorData]);

  const chartConfig = useMemo(() => ({
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    color: (opacity = 1) => `rgba(75, 192, 192, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '3',
      strokeWidth: '2',
      stroke: '#007BFF',
    },
  }), []);

  const handleIntervalChange = useCallback((interval) => {
    setSelectedInterval(interval);
    setSensorData([]); // Clear existing data when changing intervals
    setTooltipData(null); // Clear tooltip data
  }, []);

  const handleDataPointClick = (data) => {
    const index = data.index;
    const value = data.value;
    const label = chartData.labels[index];
    setTooltipData({ value, label });
  };

  const renderChart = useMemo(() => {
    if (chartData.labels && chartData.labels.length > 0) {
      return (
        <>
          <LineChart
            data={chartData}
            width={Dimensions.get('window').width - 40}
            height={220}
            yAxisLabel=""
            yAxisSuffix=""
            chartConfig={chartConfig}
            bezier={selectedInterval === 'live'}
            style={styles.chartStyle}
            withVerticalLabels={true}
            withHorizontalLabels={true}
            xLabelsOffset={-10}
            yLabelsOffset={10}
            formatXLabel={(value) => value} // Ensure labels are displayed as they are
            onDataPointClick={handleDataPointClick}
          />

          {tooltipData && (
            <View style={styles.tooltip}>
              <Text style={styles.tooltipText}>Time: {tooltipData.label}</Text>
              <Text style={styles.tooltipText}>Value: {tooltipData.value}</Text>
            </View>
          )}
        </>
      );
    }
    return <Text>No sensor data available for this interval.</Text>;
  }, [chartData, selectedInterval, chartConfig, handleDataPointClick, tooltipData]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.chartSection}>
        <Text style={styles.title}>Temperature Over Time</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.buttonContainer}>
          {['live', '5mins', '30mins', '1hr', '12hrs', '1d', '1w', '1m'].map((interval) => (
            <TouchableOpacity
              key={interval}
              style={[
                styles.button,
                selectedInterval === interval && styles.selectedButton,
              ]}
              onPress={() => handleIntervalChange(interval)}
            >
              <Text style={styles.buttonText}>{interval}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.chartContainer}>
          {renderChart}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f7f7f7',
  },
  chartSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  chartContainer: {
    alignItems: 'center',
  },
  chartStyle: {
    marginVertical: 8,
    borderRadius: 16,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginHorizontal: 5,
    backgroundColor: '#007BFF',
    borderRadius: 5,
  },
  selectedButton: {
    backgroundColor: '#0056b3',
  },
  buttonText: {
    color: '#fff',
  },
  tooltip: {
    position: 'absolute',
    top: 50,
    left: Dimensions.get('window').width / 2 - 75,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  tooltipText: {
    fontSize: 14,
  },
});

export default CustomLineChart;