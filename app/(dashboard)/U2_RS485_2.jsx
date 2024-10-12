import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  Dimensions,
  View,
  TouchableOpacity
} from 'react-native';
import axios from 'axios';
import { BarChart } from 'react-native-chart-kit';
import U2_RS485_2_LINECHART from './U2_RS485_2_LINECHART'; 

export default function U2_RS485_2() {
  const [sensorData, setSensorData] = useState([]);
  const [timeLabels, setTimeLabels] = useState([]);
  const [currentMode, setCurrentMode] = useState('');
  const [isHistoricalMode, setIsHistoricalMode] = useState(true); // Tracks if it's historical or specialHistorical mode

  const maxDataPoints = 10;
  const apiBaseUrl = 'http://192.168.100.8:3001/api';

  // Fetch default historical data on mount (6 hours)
  useEffect(() => {
    setCurrentMode('6hr');
    fetchHistoricalData('data/last6hours', 360);
  }, []);

  // Aggregation for historical modes (6hrs, 12hrs, 24hrs)
  const aggregateHistoricalData = (data, totalTimeMinutes) => {
    const intervalMilliseconds = (totalTimeMinutes * 60 * 1000) / maxDataPoints;
    const aggregatedData = [];
    const aggregatedLabels = [];
    const startTime = new Date().getTime() - totalTimeMinutes * 60 * 1000;
    let currentIntervalStart = startTime;
    let currentIntervalEnd = currentIntervalStart + intervalMilliseconds;
    let dataIndex = 0;
    const labelSkipFactor = Math.ceil(maxDataPoints / 5); // For skipping labels

    for (let i = 0; i < maxDataPoints; i++) {
      const intervalData = [];
      while (dataIndex < data.length && new Date(data[dataIndex].timestamp).getTime() < currentIntervalEnd) {
        intervalData.push(data[dataIndex].windSpeedmsData);
        dataIndex++;
      }
      aggregatedData.push(intervalData.length ? intervalData.reduce((a, b) => a + b, 0) / intervalData.length : 0);

      // Generate hourly labels
      if (i % labelSkipFactor === 0) {
        const labelDate = new Date(currentIntervalStart);
        aggregatedLabels.push(`${labelDate.getHours()}:${labelDate.getMinutes()}`);
      } else {
        aggregatedLabels.push('');
      }

      currentIntervalStart = currentIntervalEnd;
      currentIntervalEnd += intervalMilliseconds;
    }

    return { aggregatedData, aggregatedLabels };
  };

  // Aggregation for specialHistorical modes (1 week, 1 month)
  const aggregateSpecialHistoricalData = (data, totalTimeMinutes) => {
    const intervalMilliseconds = (totalTimeMinutes * 60 * 1000) / maxDataPoints;
    const aggregatedData = [];
    const aggregatedLabels = [];
    const startTime = new Date().getTime() - totalTimeMinutes * 60 * 1000;
    let currentIntervalStart = startTime;
    let currentIntervalEnd = currentIntervalStart + intervalMilliseconds;
    let dataIndex = 0;
    const labelSkipFactor = Math.ceil(maxDataPoints / 5); // For skipping labels

    for (let i = 0; i < maxDataPoints; i++) {
      const intervalData = [];
      while (dataIndex < data.length && new Date(data[dataIndex].timestamp).getTime() < currentIntervalEnd) {
        intervalData.push(data[dataIndex].windSpeedmsData);
        dataIndex++;
      }
      aggregatedData.push(intervalData.length ? intervalData.reduce((a, b) => a + b, 0) / intervalData.length : 0);

      // Generate date labels
      if (i % labelSkipFactor === 0) {
        const labelDate = new Date(currentIntervalStart);
        aggregatedLabels.push(`${labelDate.getDate()}/${labelDate.getMonth() + 1}`);
      } else {
        aggregatedLabels.push('');
      }

      currentIntervalStart = currentIntervalEnd;
      currentIntervalEnd += intervalMilliseconds;
    }

    return { aggregatedData, aggregatedLabels };
  };

  // Fetch historical data (6hrs, 12hrs, 24hrs)
  const fetchHistoricalData = async (endpoint, totalTimeMinutes) => {
    try {
      const response = await axios.get(`${apiBaseUrl}/${endpoint}`);
      const data = response.data;
      if (Array.isArray(data) && data.length > 0) {
        const { aggregatedData, aggregatedLabels } = aggregateHistoricalData(data, totalTimeMinutes);
        setSensorData(aggregatedData);
        setTimeLabels(aggregatedLabels);
      } else {
        console.warn('No historical data received.');
        setSensorData(new Array(maxDataPoints).fill(0));
        setTimeLabels(new Array(maxDataPoints).fill(''));
      }
    } catch (error) {
      console.error('Error fetching historical data:', error);
      setSensorData(new Array(maxDataPoints).fill(0));
      setTimeLabels(new Array(maxDataPoints).fill(''));
    }
  };

  // Fetch special historical data (1 week, 1 month)
  const fetchSpecialHistoricalData = async (endpoint, totalTimeMinutes) => {
    try {
      const response = await axios.get(`${apiBaseUrl}/${endpoint}`);
      const data = response.data;
      if (Array.isArray(data) && data.length > 0) {
        const { aggregatedData, aggregatedLabels } = aggregateSpecialHistoricalData(data, totalTimeMinutes);
        setSensorData(aggregatedData);
        setTimeLabels(aggregatedLabels);
      } else {
        console.warn('No special historical data received.');
        setSensorData(new Array(maxDataPoints).fill(0));
        setTimeLabels(new Array(maxDataPoints).fill(''));
      }
    } catch (error) {
      console.error('Error fetching special historical data:', error);
      setSensorData(new Array(maxDataPoints).fill(0));
      setTimeLabels(new Array(maxDataPoints).fill(''));
    }
  };

  // Handle mode change for historical and specialHistorical modes
  const handleModeChange = (mode, apiEndpoint, totalTimeMinutes, isHistorical = true) => {
    setCurrentMode(mode);
    setIsHistoricalMode(isHistorical);

    if (isHistorical) {
      fetchHistoricalData(apiEndpoint, totalTimeMinutes);
    } else {
      fetchSpecialHistoricalData(apiEndpoint, totalTimeMinutes);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={{ marginTop: 10 }}>
          <U2_RS485_2_LINECHART />
        </View>
        <View style={styles.buttonContainer}>
          {/* Historical Modes */}
          <TouchableOpacity
            style={[styles.button, styles.buttonSpacing]}
            onPress={() => handleModeChange('6hr', 'data/last6hours', 360, true)}
          >
            <Text>6hrs</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.buttonSpacing]}
            onPress={() => handleModeChange('12hr', 'data/last12hours', 720, true)}
          >
            <Text>12hrs</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.buttonSpacing]}
            onPress={() => handleModeChange('24hr', 'data/lastday', 1440, true)}
          >
            <Text>24hrs</Text>
          </TouchableOpacity>

          {/* Special Historical Modes */}
          <TouchableOpacity
            style={[styles.button, styles.buttonSpacing]}
            onPress={() => handleModeChange('1week', 'data/week', 10080, false)}
          >
            <Text>1week</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.buttonSpacing]}
            onPress={() => handleModeChange('1month', 'data/month', 43200, false)}
          >
            <Text>1month</Text>
          </TouchableOpacity>
        </View>

        {sensorData && sensorData.length > 0 ? (
          <BarChart
            data={{
              labels: timeLabels.length > 0 ? timeLabels : ['No data'],
              datasets: [
                {
                  data: sensorData.length > 0 ? sensorData : [0],
                },
              ],
            }}
            width={Dimensions.get('window').width - 40}
            height={220}
            chartConfig={{
              backgroundColor: '#e0f7fa', // Sets background fill color
              backgroundGradientFrom: '#ffffff', // Light color at top
              backgroundGradientTo: '#ffffff', // Light color at bottom
              decimalPlaces: 2,
              color: (opacity = 1) => `rgba(0, 188, 212, ${opacity})`, // Line color with transparency
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`, // Label color for time
            }}
          />
        ) : (
          <Text>Loading data...</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  button: {
    backgroundColor: '#8E85FF',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 5,
  },
  buttonSpacing: {
    marginRight: 10,
    marginBottom: 5,
  },
  text: {
    color: '#fff',
    fontSize: 16,
  },
});
