import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, Dimensions, Button, View } from 'react-native';
import axios from 'axios';
import { BarChart, LineChart } from 'react-native-chart-kit';

export default function U1_analog() {
  const [sensorData, setSensorData] = useState([]);
  const [timeLabels, setTimeLabels] = useState([]);  
  const [currentMode, setCurrentMode] = useState('live');  

  const maxDataPoints = 5;  
  const apiBaseUrl = 'http://192.168.100.8:3003/api';  

  const fetchLiveData = async () => {
    try {
      const response = await axios.get(`${apiBaseUrl}/live-data`);
      const data = response.data;

      if (data) {
        const latestValue = data.windSpeedmsData;  
        const timestamp = new Date(data.timestamp);
        const formattedTime = `${timestamp.getHours()}:${timestamp.getMinutes()}:${timestamp.getSeconds()}`;

        setSensorData(prevData => {
          const newData = [...prevData, latestValue];
          return newData.length > maxDataPoints ? newData.slice(1) : newData;
        });

        setTimeLabels(prevLabels => {
          const newLabels = [...prevLabels, formattedTime];
          return newLabels.length > maxDataPoints ? newLabels.slice(1) : newLabels;
        });
      }
    } catch (error) {
      console.error("Error fetching live data:", error);
    }
  };

  const aggregateData = (data, totalTimeMinutes) => {
    const intervalCount = maxDataPoints;
    const intervalMilliseconds = (totalTimeMinutes * 72 * 1000) / intervalCount;  

    const aggregatedData = [];
    const aggregatedLabels = [];

    const startTime = new Date(data[0].timestamp).getTime();
    let currentIntervalStart = startTime;

    let currentIntervalData = [];
    data.forEach(item => {
      const itemTime = new Date(item.timestamp).getTime();

      if (itemTime < currentIntervalStart + intervalMilliseconds) {
        currentIntervalData.push(item.windSpeedmsData);
      } else {
        const average = currentIntervalData.reduce((a, b) => a + b, 0) / currentIntervalData.length;
        aggregatedData.push(average);

        const labelDate = new Date(currentIntervalStart);
        aggregatedLabels.push(`${labelDate.getHours()}:${labelDate.getMinutes()}`);

        currentIntervalStart += intervalMilliseconds;
        currentIntervalData = [item.windSpeedmsData];
      }
    });

    if (currentIntervalData.length > 0) {
      const average = currentIntervalData.reduce((a, b) => a + b, 0) / currentIntervalData.length;
      aggregatedData.push(average);
      const labelDate = new Date(currentIntervalStart);
      aggregatedLabels.push(`${labelDate.getHours()}:${labelDate.getMinutes()}`);
    }

    return { aggregatedData, aggregatedLabels };
  };

  const fetchHistoricalData = async (endpoint, totalTimeMinutes) => {
    try {
      const response = await axios.get(`${apiBaseUrl}/${endpoint}`);
      const data = response.data;

      if (Array.isArray(data) && data.length > 0) {
        const { aggregatedData, aggregatedLabels } = aggregateData(data, totalTimeMinutes);

        setSensorData(aggregatedData);
        setTimeLabels(aggregatedLabels);
      } else {
        console.warn("No historical data received from the backend.");
      }
    } catch (error) {
      console.error("Error fetching historical data:", error);
    }
  };

  useEffect(() => {
    if (currentMode === 'live') {
      fetchLiveData(); 
      const interval = setInterval(() => {
        fetchLiveData();
      }, 1000);  
      return () => clearInterval(interval); 
    }
  }, [currentMode]);

  const handleModeChange = (mode, apiEndpoint, totalTimeMinutes = 5) => {
    setCurrentMode(mode);  
    if (mode === 'live') {
      fetchLiveData();  
    } else {
      fetchHistoricalData(apiEndpoint, totalTimeMinutes);  
    }
  };

  if (sensorData.length === 0 || timeLabels.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Loading data...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>U1_analog Sensor Data ({currentMode === 'live' ? 'Live' : 'Historical'})</Text>

        <View style={styles.buttonContainer}>
          <Button title="Live Data" onPress={() => handleModeChange('live', 'live-data')} />
          <Button title="Last 30 Min" onPress={() => handleModeChange('30min', 'data/last30minutes', 30)} />
          <Button title="Last 1 Hour" onPress={() => handleModeChange('1hr', 'data/lasthour', 60)} />
          <Button title="Last 6 Hours" onPress={() => handleModeChange('6hr', 'data/last6hours', 360)} />
          <Button title="Last 12 Hours" onPress={() => handleModeChange('12hr', 'data/last12hours', 720)} />
          <Button title="Last 24 Hours" onPress={() => handleModeChange('24hr', 'data/lastday', 1440)} />
        </View>

        <LineChart
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
            decimalPlaces: 2,  // Show 2 decimal places
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
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
            decimalPlaces: 2,  // Show 2 decimal places
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
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
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
});