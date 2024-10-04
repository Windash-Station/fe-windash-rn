import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, Dimensions, Button, View } from 'react-native';
import axios from 'axios';
import { BarChart, LineChart } from 'react-native-chart-kit';

export default function M1() {
  const [sensorData, setSensorData] = useState([]);
  const [timeLabels, setTimeLabels] = useState([]);  
  const [currentMode, setCurrentMode] = useState('live');  

  const maxDataPoints = 6;  
  const maxLiveDataPoints = 5;
  const maxSpecialisedDataPoints = 7;
  const apiBaseUrl = 'http://192.168.100.8:3002/api';  

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
          return newData.length > maxLiveDataPoints ? newData.slice(1) : newData;
        });

        setTimeLabels(prevLabels => {
          const newLabels = [...prevLabels, formattedTime];
          return newLabels.length > maxLiveDataPoints ? newLabels.slice(1) : newLabels;
        });
      }
    } catch (error) {
      console.error("Error fetching live data:", error);
    }
  };

  const aggregateLiveData = (data, totalTimeMinutes) => {
    const intervalCount = maxDataPoints;
    const intervalMilliseconds = (totalTimeMinutes * 84 * 1000) / intervalCount;  

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
  }; // i want labels to be less than data

  const aggregateData = (data, totalTimeMinutes) => {
    const intervalCount = maxDataPoints;
    
    const intervalMilliseconds = (totalTimeMinutes * 24 * 1000) / intervalCount;  
  
    const aggregatedData = [];
    const aggregatedLabels = [];
  
    const startTime = new Date(data[0].timestamp).getTime();
    let currentIntervalStart = startTime;
    let currentIntervalData = [];
    
    const labelSkipFactor = Math.ceil(intervalCount / 3); 
  
    data.forEach((item, index) => {
      const itemTime = new Date(item.timestamp).getTime();
  
      if (itemTime < currentIntervalStart + intervalMilliseconds) {
        currentIntervalData.push(item.windSpeedmsData);
      } else {
        const average = currentIntervalData.reduce((a, b) => a + b, 0) / currentIntervalData.length;
        aggregatedData.push(average);
  
        // Add label only for certain intervals to reduce the number of labels
        if (aggregatedData.length % labelSkipFactor === 0) {
          const labelDate = new Date(currentIntervalStart);
          aggregatedLabels.push(`${labelDate.getHours()}:${labelDate.getMinutes()}`);
        } else {
          aggregatedLabels.push('');
        }
  
        currentIntervalStart += intervalMilliseconds;
        currentIntervalData = [item.windSpeedmsData];
      }
    });
  
    // Handle the last interval
    if (currentIntervalData.length > 0) {
      const average = currentIntervalData.reduce((a, b) => a + b, 0) / currentIntervalData.length;
      aggregatedData.push(average);
      
      if (aggregatedData.length % labelSkipFactor === 0) {
        const labelDate = new Date(currentIntervalStart);
        aggregatedLabels.push(`${labelDate.getHours()}:${labelDate.getMinutes()}`);
      } else {
        aggregatedLabels.push(''); // Empty label for skipped intervals
      }
    }
  
    return { aggregatedData, aggregatedLabels };
  };


  const aggregateSpecialisedData = (data, totalTimeMinutes) => {
    const intervalCount = maxSpecialisedDataPoints;
    let multiplier;

    // if (totalTimeMinutes === 360) {
    //   multiplier = 38
    // } else if (totalTimeMinutes === {
    //   multiplier = 36
    // }

    switch (totalTimeMinutes) {
      case 360:
        multiplier = 38
        break;
      case 720:
        multiplier = 36
        break;
      case 1440:
        multiplier = 48
        break;
    }

    const intervalMilliseconds = (totalTimeMinutes * multiplier * 1000) / intervalCount;  
    
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
        const average = currentIntervalData.reduce((a, b) => a + b, 0) / currentIntervalData.length;
        aggregatedData.push(average);
  
        // Add label only for certain intervals to reduce the number of labels
        if (aggregatedData.length % labelSkipFactor === 0) {
          const labelDate = new Date(currentIntervalStart);
          aggregatedLabels.push(`${labelDate.getHours()}:${labelDate.getMinutes()}`);
        } else {
          aggregatedLabels.push('');
        }
  
        currentIntervalStart += intervalMilliseconds;
        currentIntervalData = [item.windSpeedmsData];
      }
    });
  
    // Handle the last interval
    if (currentIntervalData.length > 0) {
      const average = currentIntervalData.reduce((a, b) => a + b, 0) / currentIntervalData.length;
      aggregatedData.push(average);
      
      if (aggregatedData.length % labelSkipFactor === 0) {
        const labelDate = new Date(currentIntervalStart);
        aggregatedLabels.push(`${labelDate.getHours()}:${labelDate.getMinutes()}`);
      } else {
        aggregatedLabels.push(''); // Empty label for skipped intervals
      }
    }
  
    return { aggregatedData, aggregatedLabels };
  };

  
  const fetchSpecialisedHistoricalData = async (endpoint, totalTimeMinutes) => {
    try {
      const response = await axios.get(`${apiBaseUrl}/${endpoint}`);
      const data = response.data;

      if (Array.isArray(data) && data.length > 0) {
        const { aggregatedData, aggregatedLabels } = aggregateSpecialisedData(data, totalTimeMinutes);

        setSensorData(aggregatedData);
        setTimeLabels(aggregatedLabels);
      } else {
        console.warn("No historical data received from the backend.");
      }
    } catch (error) {
      console.error("Error fetching historical data:", error);
    }
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
    } else if (mode === '30min' || mode === '1hr'){
      fetchHistoricalData(apiEndpoint, totalTimeMinutes);  
    } else {
      fetchSpecialisedHistoricalData(apiEndpoint, totalTimeMinutes);
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
        <Text style={styles.title}>M1 Sensor Data ({currentMode === 'live' ? 'Live' : 'Historical'})</Text>

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
            decimalPlaces: 2,
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