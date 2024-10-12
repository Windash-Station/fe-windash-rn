import React, { useEffect, useState, useCallback } from 'react';
import { Text, View, ScrollView, StyleSheet, ActivityIndicator, Dimensions, TouchableOpacity, Image } from 'react-native';
import axios from 'axios'; 
import { ProgressChart } from 'react-native-chart-kit';
import { useAppContext } from './AppContext';
import { useRouter } from 'expo-router'; 
import Icon from 'react-native-vector-icons/FontAwesome';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from 'expo-router'; 

const { width } = Dimensions.get('window');

export default function WeatherSensorApp() {
  const { route } = useAppContext();
  const router = useRouter(); 

  const sensors = [
    { name: 'U1_analog', port: 3003, displayName: 'U1_analog' },
    { name: 'M1', port: 3002, displayName: 'M1' },
    { name: 'U2_RS485_2', port: 3001, displayName: 'U2_RS485_2' },
  ];

  const [sensorData, setSensorData] = useState({
    U1_analog: null,
    M1: null,
    U2_RS485_2: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLatestData = async (sensor) => {
    try {
      const response = await axios.get(`http://192.168.100.8:${sensor.port}/api/analog-data`);
      // console.log(response.data);
      if (response.data && Array.isArray(response.data)) {
        setSensorData((prevState) => ({
          ...prevState,
          [sensor.name]: response.data[response.data.length - 1],
        }));
      } else {
        console.error('Invalid data format:', response.data);
      }
      setError(null);
    } catch (error) {
      console.error(`Error fetching latest data for ${sensor.name}:`, error);
      setError(`Error fetching data for ${sensor.name}`);
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
      }, 1500);

      return () => {
        clearInterval(interval); // Cleanup interval on screen unfocus
      };
    }, [])
  );

  const calculateProgress = (value, max) => {
    return value ? value / max : 0;
  };

  const renderProgressChart = () => {
    const maxWindSpeed = 100;
    const windSpeedU1 = calculateProgress(sensorData.U1_analog?.windSpeedmsData, maxWindSpeed);
    const windSpeedM1 = calculateProgress(sensorData.M1?.windSpeedmsData, maxWindSpeed);
    const windSpeedU2 = calculateProgress(sensorData.U2_RS485_2?.windSpeedmsData, maxWindSpeed);

    return (
      <View style={styles.chartContainer}>
        <ProgressChart
          data={{
            labels: ['U1', 'M1', 'U2'],
            data: [windSpeedU1, windSpeedM1, windSpeedU2],
            colors: ["red", "cyan", "blue"],
          }}
          width={width * 1.1}
          height={300}
          strokeWidth={30}
          radius={30}
          chartConfig={{
            decimalPlaces: 2,
            backgroundGradientToOpacity: 0,
            backgroundGradientFromOpacity: 0,
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          hideLegend={false}
          withCustomBarColorFromData={true}
        />
      </View>
    );
  };

  return (
    <LinearGradient colors={['white', 'white']} style={styles.container}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>WINDASH STATION</Text>
        </View>

        {/* {error && <Text style={styles.errorText}>{error}</Text>} */}

        {loading ? (
          <ActivityIndicator size="large" color="#4CAF50" />
        ) : (
          <>
            {renderProgressChart()}
            {Object.keys(sensorData).map((sensorName) => (
  <TouchableOpacity
    key={sensorName}
    style={styles.sensorContainer}
    onPress={() =>
      router.push({
        pathname: `/(dashboard)/${sensorName}`, // Navigate to the respective sensor page
        params: {
          sensorBoxData: sensorData[sensorName], // Pass the specific sensor data
        },
      })
    }
  >
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {/* <Icon name="square" size={15} color={'red'}/> */}
      <Image source={require('../assets/111142_radar_signal_icon.png')}/>
      <Text style={[styles.sensorTitle, { marginLeft: 8 }]}>
        {sensorName}
      </Text>
    </View>

    {sensorData[sensorName] ? (
      <View style={styles.dataRow}>
        <View style={styles.dataBox}>
          <Text style={styles.dataValue}>
            {sensorData[sensorName].windSpeedmsData || 'N/A'}
          </Text>
          <Text style={styles.dataLabel}>Wind Speed (m/s)</Text>
        </View>
        <View style={styles.dataBox}>
          <Text style={styles.dataValue}>
            {sensorData[sensorName].totalSpeedData || 'N/A'}
          </Text>
          <Text style={styles.dataLabel}>Total Speed</Text>
        </View>
        <View style={styles.dataBox}>
          <Text style={styles.voltageDataValue}>
            {sensorData[sensorName].batteryVoltageData || 'N/A'}
          </Text>
          <Text style={styles.dataLabel}>Battery Voltage</Text>
        </View>
      </View>
    ) : (
      <Text style={styles.loadingText}>Sensor data unavailable....</Text>
    )}
  </TouchableOpacity>
))}

          </>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 0,
    padding: 8,
    flex: 1,
    height: '100vh',
  },
  header: {
    marginTop: 40,
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
    fontFamily: 'arial',
  },
  sensorContainer: {
    marginBottom: 20,
    borderRadius: 8,
    backgroundColor: '#FAF9F6',
    padding: 15,
    elevation: 2,
  },
  sensorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    fontStyle: 'italic',
    color: 'blue',
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
  dataLabel: {
    fontSize: 12,
    color: '#CCCCCC',
    marginTop: 4,
    textAlign: 'center',
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
    marginBottom: 60,
    height: 220,
    borderRadius: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
    marginVertical: 10,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
});
