import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, Button, TouchableOpacity, Image } from 'react-native';
import axios from 'axios';
import { LineChart } from 'react-native-chart-kit';
import { useFocusEffect } from 'expo-router'; 

export default function U1_analog_LINECHART() {
  const [sensorData, setSensorData] = useState([]);
  const [liveSensorData, setLiveSensorData] = useState({ U1_analog: null });
  const [liveGraphSensorData, setLiveGraphSensorData] = useState({ U1_analog: null });
  const [timeLabels, setTimeLabels] = useState([]);
  const [currentMode, setCurrentMode] = useState('live');
  const [loading, setLoading] = useState(false);
  const [intervalId, setIntervalId] = useState(null);
  const prevLiveData = useRef(null);
  const maxLiveDataPoints = 5;
  const apiBaseUrl = 'http://192.168.100.8:3003/api'; 

  const sensors = [
    { name: 'U1_analog', port: 3003, displayName: 'U1_analog' },
  ];

  const fetchLatestData = async (sensor) => {
    try {
      const response = await axios.get(`http://192.168.100.8:${sensor.port}/api/analog-data`);
      // console.log(response.data);
      if (response.data && Array.isArray(response.data)) {
        setLiveSensorData((prevState) => ({
          ...prevState,
          [sensor.name]: response.data[response.data.length - 1],
        }));
      } else {
        console.error('Invalid data format:', response.data);
      }
    } catch (error) {
      console.error(`Error fetching latest data for ${sensor.name}:`, error);
    }
  };

  const fetchAllLatestData = () => {
    sensors.forEach((sensor) => {
      fetchLatestData(sensor);
    });
  };

  useFocusEffect(
    useCallback(() => {
      fetchAllLatestData();
      const interval = setInterval(() => {
        fetchAllLatestData();
      }, 1000);

      return () => {
        clearInterval(interval); // Cleanup interval on screen unfocus
      };
    }, [])
  );

  // Fetch live data every second
  const fetchLiveData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${apiBaseUrl}/live-data`);
      const data = response.data;
      console.log("Data:", data);
      if (data) {
        const latestValue = data.windSpeedmsData;
        const timestamp = new Date(data.timestamp);
        const formattedTime = `${timestamp.getHours()}:${timestamp.getMinutes()}:${timestamp.getSeconds()}`;
  
        // Update liveSensorData with the fetched data
  
        let valueToAdd = latestValue;
  
        // Compare with the previous value using prevLiveData.current
        if (prevLiveData.current !== null && latestValue === prevLiveData.current) {
          valueToAdd = 0; // If the latest value is the same as the previous, set the value to 0
        }
  
        // Update prevLiveData.current
        prevLiveData.current = latestValue;
  
        setSensorData((prevData) => {
          const newData = [...prevData, valueToAdd];
          return newData.length > maxLiveDataPoints ? newData.slice(1) : newData;
        });
        setTimeLabels((prevLabels) => {
          const newLabels = [...prevLabels, formattedTime];
          return newLabels.length > maxLiveDataPoints ? newLabels.slice(1) : newLabels;
        });
      } else {
        console.warn('No live data received');
      }
    } catch (error) {
      console.error('Error fetching live data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch historical data based on mode
  const fetchHistoricalData = async (endpoint, totalTimeMinutes, mode) => {
  try {
    setLoading(true);
    const response = await axios.get(`${apiBaseUrl}/${endpoint}`);
    const data = response.data;

    if (Array.isArray(data) && data.length > 0) {
      const { aggregatedData, aggregatedLabels } = aggregateData(
        data,
        totalTimeMinutes,
        mode
      );
      
      // Update the liveSensorData with the latest aggregated data point
      const latestAggregatedData = aggregatedData[aggregatedData.length - 1];

      // Update the UI with the most recent value from the historical data
      setSensorData({
        windSpeedmsData: data[data.length - 1]?.windSpeedmsData || 0,
        totalSpeedData: data[data.length - 1]?.totalSpeedData || 0,
        batteryVoltageData: data[data.length - 1]?.batteryVoltageData || 0,
      });

      setSensorData(aggregatedData);
      setTimeLabels(aggregatedLabels);
    } else {
      console.warn('No historical data received.');
      setSensorData([]);
      setTimeLabels([]);
    }
  } catch (error) {
    console.error('Error fetching historical data:', error);
  } finally {
    setLoading(false);
  }
};


  // Function to aggregate data into intervals for chart display
  const aggregateData = (data, totalTimeMinutes, mode) => {
    let maxDataPoints;

    if (mode === '1week') {
      maxDataPoints = 7; // Show 7 data points for 1 week (1 per day)
    } else if (mode === '1month') {
      maxDataPoints = 30; // Show 30 data points for 1 month (1 per day)
    } else {
      maxDataPoints = 10; // Default number of data points for other modes
    }

    // Calculate the interval in milliseconds
    const intervalMilliseconds = (totalTimeMinutes * 60 * 1000) / maxDataPoints;

    const aggregatedData = [];
    const aggregatedLabels = [];
    const startTime = new Date().getTime() - totalTimeMinutes * 60 * 1000;
    let currentIntervalStart = startTime;
    let currentIntervalEnd = currentIntervalStart + intervalMilliseconds;
    let dataIndex = 0;

    const labelSkipFactor = Math.ceil(maxDataPoints / 5);

    let prevValue = null;

    for (let i = 0; i < maxDataPoints; i++) {
      const currentIntervalData = [];

      // Collect data within the current interval
      while (
        dataIndex < data.length &&
        new Date(data[dataIndex].timestamp).getTime() < currentIntervalEnd
      ) {
        const item = data[dataIndex];
        const currentValue = item.windSpeedmsData;
        let valueToAdd = currentValue;

        // Compare with the previous value
        if (prevValue !== null && currentValue === prevValue) {
          // If the current value is the same as the previous, set the value to 0
          valueToAdd = 0;
        }

        currentIntervalData.push(valueToAdd);
        prevValue = currentValue;
        dataIndex++;
      }

      // Calculate average or set zero
      if (currentIntervalData.length > 0) {
        const average =
          currentIntervalData.reduce((sum, value) => sum + value, 0) /
          currentIntervalData.length;
        aggregatedData.push(average);
      } else {
        aggregatedData.push(0); // No data, so push 0
      }

      // Generate label
      if (i % labelSkipFactor === 0) {
        const labelDate = new Date(currentIntervalStart);
        aggregatedLabels.push(
          mode === '1week' || mode === '1month'
            ? `${labelDate.getDate()}/${labelDate.getMonth() + 1}` // For week/month, show day/month
            : `${labelDate.getHours()}:${labelDate.getMinutes()}` // For shorter intervals, show time
        );
      } else {
        aggregatedLabels.push('');
      }

      currentIntervalStart = currentIntervalEnd;
      currentIntervalEnd += intervalMilliseconds;
    }

    return { aggregatedData, aggregatedLabels };
  };

  // Function to handle button presses and change modes
  const handleModeChange = (mode, endpoint = null, totalTimeMinutes = null) => {
    setCurrentMode(mode);

    // Clear any existing interval when switching modes
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }

    // Reset data arrays and previous values when mode changes
    setSensorData([]);
    setTimeLabels([]);
    prevLiveData.current = null;

    if (mode === 'live') {
      fetchLiveData(); // Start live data
      const id = setInterval(() => fetchLiveData(), 1000); // Fetch live data every second
      setIntervalId(id); // Save the interval ID for cleanup
    } else {
      fetchHistoricalData(endpoint, totalTimeMinutes, mode); // Fetch historical data based on mode
    }
  };

  useEffect(() => {
    handleModeChange('live');

    return () => {
      if (intervalId.current) {
        clearInterval(intervalId.current);
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.sensorContainer}>
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {/* <Icon name="square" size={15} color={'red'}/> */}
      <Image source={require('../../assets/111142_radar_signal_icon.png')}/>
      <Text style={[styles.sensorTitle, { marginLeft: 8 }]}>
        U1_analog
      </Text>
    </View>
        <View style={styles.dataRow}>
        <View style={styles.dataBox}>
          <Text style={styles.dataValue}>
            {liveSensorData["U1_analog"]?.windSpeedmsData}
          </Text>
          <Text style={styles.dataLabel}>Wind Speed(m/s)</Text>
        </View>
        <View style={styles.dataBox}>
          <Text style={styles.dataValue}>
            {liveSensorData["U1_analog"]?.totalSpeedData}
          </Text>
          <Text style={styles.dataLabel}>Total Speed</Text>
        </View>
        <View style={styles.dataBox}>
          <Text style={styles.voltageDataValue}>
            {liveSensorData["U1_analog"]?.batteryVoltageData}
          </Text>
          <Text style={styles.dataLabel}>Battery Voltage</Text>
        </View>
      </View>
      </TouchableOpacity>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.button, styles.buttonSpacing]} onPress={() => handleModeChange('live')}>
          <Text>Live</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.buttonSpacing]} onPress={() => handleModeChange('1hr', 'data/lasthour', 60)}>
          <Text>3hrs</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.buttonSpacing]} onPress={() => handleModeChange('6hr', 'data/last6hours', 360)}>
          <Text>6hrs</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.buttonSpacing]} onPress={() => handleModeChange('12hr', 'data/last12hours', 720)}>
          <Text>12hrs</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.buttonSpacing]} onPress={() => handleModeChange('24hr', 'data/lastday', 1440)}>
          <Text>24hrs</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.buttonSpacing]} onPress={() => handleModeChange('1week', 'data/week', 10080)}>
          <Text>1week</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.buttonSpacing]} onPress={() => handleModeChange('1month', 'data/month', 43200)}>
          <Text>1month</Text>
        </TouchableOpacity>
      </View>

      {sensorData.length > 0 && timeLabels.length > 0 ? (
        <LineChart
          data={{
            labels: timeLabels,
            datasets: [
              {
                data: sensorData,
              },
            ],
          }}
          width={Dimensions.get('window').width - 40} // Dynamically set chart width
          height={220}
          chartConfig={{
            backgroundColor: '#e0f7fa',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 2, // Show decimal points
            color: (opacity = 1) =>
              `rgba(0, 188, 212, ${opacity})`,
            labelColor: (opacity = 1) =>
              `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16,
              marginTop: 10
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
        <Text>Loading Chart</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  button: {
    backgroundColor: '#8E85FF', // You can change this to your preferred color
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 50, // Makes the button rounded
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 5, // For Android shadow effect
  },
  buttonSpacing: {
    marginRight: 5,
    marginTop: 5
  },
  text: {
    color: '#fff',
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dataBox: {
    alignItems: 'center',
    flex: 1,
  },
  dataValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  voltageDataValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'red'
  },
  sensorContainer: {
    marginTop: 40,
    // marginBottom: 20,
    borderRadius: 8,
    // backgroundColor: '#FAF9F6',
    backgroundColor: '#8E85FF',
    padding: 15,
    elevation: 2,
  },
  sensorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    fontStyle: 'italic',
    color: 'white',
  },
  button: {
    backgroundColor: '#8E85FF', // You can change this to your preferred color
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 50, // Makes the button rounded
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 5, // For Android shadow effect
  },
});