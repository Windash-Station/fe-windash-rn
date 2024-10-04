import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  Dimensions,
  Button,
  View,
} from 'react-native';
import axios from 'axios';
import { BarChart } from 'react-native-chart-kit';

export default function M1() {
  const [sensorData, setSensorData] = useState([]);
  const [timeLabels, setTimeLabels] = useState([]);
  const [currentMode, setCurrentMode] = useState('');

  const maxSpecialisedDataPoints = 7;
  const apiBaseUrl = 'http://192.168.100.8:3002/api';

  useEffect(() => {
    // Fetch default data when component mounts
    setCurrentMode('6hr');
    fetchSpecialisedHistoricalData('data/last6hours', 360);
  }, []);

  const aggregateSpecialisedData = (data, totalTimeMinutes) => {
    const intervalCount = maxSpecialisedDataPoints;
    let multiplier;

    switch (totalTimeMinutes) {
      case 360:
        multiplier = 38;
        break;
      case 720:
        multiplier = 36;
        break;
      case 1440:
        multiplier = 48;
        break;
      default:
        multiplier = 36; // Default case if none matches
    }

    const intervalMilliseconds =
      (totalTimeMinutes * multiplier * 1000) / intervalCount;

    const aggregatedData = [];
    const aggregatedLabels = [];

    const startTime = new Date(data[0].timestamp).getTime();
    let currentIntervalStart = startTime;
    let currentIntervalData = [];

    const labelSkipFactor = Math.ceil(intervalCount / 5);

    data.forEach((item, index) => {
      const itemTime = new Date(item.timestamp).getTime();

      if (itemTime < currentIntervalStart + intervalMilliseconds) {
        currentIntervalData.push(item.windSpeedmsData);
      } else {
        const average =
          currentIntervalData.reduce((a, b) => a + b, 0) /
          currentIntervalData.length;
        aggregatedData.push(average);

        if (aggregatedData.length % labelSkipFactor === 0) {
          const labelDate = new Date(currentIntervalStart);
          aggregatedLabels.push(
            `${labelDate.getHours()}:${labelDate.getMinutes()}`
          );
        } else {
          aggregatedLabels.push('');
        }

        currentIntervalStart += intervalMilliseconds;
        currentIntervalData = [item.windSpeedmsData];
      }
    });

    // Handle the last interval
    if (currentIntervalData.length > 0) {
      const average =
        currentIntervalData.reduce((a, b) => a + b, 0) /
        currentIntervalData.length;
      aggregatedData.push(average);

      if (aggregatedData.length % labelSkipFactor === 0) {
        const labelDate = new Date(currentIntervalStart);
        aggregatedLabels.push(
          `${labelDate.getHours()}:${labelDate.getMinutes()}`
        );
      } else {
        aggregatedLabels.push(''); // Empty label for skipped intervals
      }
    }

    return { aggregatedData, aggregatedLabels };
  };

  const fetchSpecialisedHistoricalData = async (endpoint, totalTimeMinutes) => {
    try {
      console.log('Fetching data from API...');
      const response = await axios.get(`${apiBaseUrl}/${endpoint}`);
      const data = response.data;

      console.log('Data fetched:', data);

      if (Array.isArray(data) && data.length > 0) {
        const { aggregatedData, aggregatedLabels } = aggregateSpecialisedData(
          data,
          totalTimeMinutes
        );

        setSensorData(aggregatedData);
        setTimeLabels(aggregatedLabels);
      } else {
        console.warn('No historical data received from the backend.');
      }
    } catch (error) {
      console.error('Error fetching historical data:', error);
      // Optionally set an error state to display an error message
    }
  };

  const handleModeChange = (mode, apiEndpoint, totalTimeMinutes) => {
    console.log(`Button pressed for mode: ${mode}`);
    setCurrentMode(mode);
    fetchSpecialisedHistoricalData(apiEndpoint, totalTimeMinutes);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>
          M1 Sensor Data {currentMode ? `(${currentMode} Data)` : ''}
        </Text>

        <View style={styles.buttonContainer}>
          <Button
            title="Last 6 Hours"
            onPress={() =>
              handleModeChange('6hr', 'data/last6hours', 360)
            }
          />
          <Button
            title="Last 12 Hours"
            onPress={() =>
              handleModeChange('12hr', 'data/last12hours', 720)
            }
          />
          <Button
            title="Last 24 Hours"
            onPress={() =>
              handleModeChange('24hr', 'data/lastday', 1440)
            }
          />
        </View>

        {sensorData.length > 0 && timeLabels.length > 0 ? (
          <BarChart
            data={{
              labels: timeLabels,
              datasets: [
                {
                  data: sensorData,
                },
              ],
            }}
            width={Dimensions.get('window').width - 30}
            height={220}
            chartConfig={{
              backgroundColor: '#e26a00',
              backgroundGradientFrom: '#fb8c00',
              backgroundGradientTo: '#ffa726',
              decimalPlaces: 2,
              color: (opacity = 1) =>
                `rgba(255, 255, 255, ${opacity})`,
              labelColor: (opacity = 1) =>
                `rgba(255, 255, 255, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '6',
                strokeWidth: '2',
                stroke: '#ffa726',
              },
            }}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
          />
        ) : (
          <Text>Loading data...</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 10,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
});
