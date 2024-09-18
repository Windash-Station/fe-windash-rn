import React, { useState, useEffect } from 'react';
import { View, Text, Button, ActivityIndicator } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;

// Helper function to generate 15-minute intervals for the last hour
const generate15MinIntervals = () => {
  const now = new Date();
  const intervals = [];
  for (let i = 4; i >= 0; i--) {
    const interval = new Date(now.getTime() - i * 15 * 60000); // Subtracting 15 minutes * i
    intervals.push(interval);
  }
  return intervals;
};

const LineChartExample = () => {
  const [chartData, setChartData] = useState([]); // Ensure it's an array by default
  const [loading, setLoading] = useState(false); // State for loading indication

  // Helper function to format the data for the chart
  const formatDataForChart = (data) => {
    if (!Array.isArray(data)) return { labels: [], datasets: [{ data: [] }] }; // Handle non-array data

    const labels = [];
    const windspeedData = [];

    // Generate the last 5 15-minute intervals
    const intervals = generate15MinIntervals();

    intervals.forEach((interval) => {
      const matchingData = data.find(
        (item) => {
          const itemDate = new Date(item.date);
          return (
            itemDate.getHours() === interval.getHours() &&
            itemDate.getMinutes() === interval.getMinutes()
          );
        }
      );

      if (matchingData) {
        const timeLabel = interval.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        });
        labels.push(timeLabel);
        windspeedData.push(matchingData.windSpeedmsData);
      } else {
        // Fill missing time points with 0
        labels.push(interval.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }));
        windspeedData.push(0); // Placeholder for missing wind speed data
      }
    });

    console.log('Formatted Chart Data:', {
      labels,
      datasets: [{ data: windspeedData }],
    });

    return {
      labels, // X-axis labels (time)
      datasets: [
        {
          data: windspeedData, // Y-axis data (wind speed)
        },
      ],
    };
  };

  // Function to fetch all sensor data
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        'http://192.168.100.199:3000/get/sensor-data/range/1h'
      );
      const responseData = await response.json();

      // Ensure that the response is an array of objects
      if (Array.isArray(responseData)) {
        setChartData(responseData); // Update chart data with fetched sensor data
      } else {
        console.error('Error: Fetched data is not an array');
        setChartData([]); // Fallback to empty data in case of error
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setChartData([]); // Handle fetch error
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData(); // Fetch the data on component mount
  }, []);

  return (
    <View>
      <Text style={{ textAlign: 'center', fontSize: 20, margin: 10 }}>
        Windspeed Data Over Time (15-Minute Intervals)
      </Text>

      {/* Show loader while fetching data */}
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : chartData.length > 0 ? (
        <LineChart
          data={formatDataForChart(chartData)}
          width={screenWidth} // from react-native
          height={220}
          yAxisSuffix=" m/s"
          chartConfig={{
            backgroundColor: '#e26a00',
            backgroundGradientFrom: '#fb8c00',
            backgroundGradientTo: '#ffa726',
            decimalPlaces: 1, // to display 1 decimal place in values
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
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
        />
      ) : (
        <Text>No data available</Text>
      )}

      <Button title="Refresh Data" onPress={fetchData} />
    </View>
  );
};

export default LineChartExample;
