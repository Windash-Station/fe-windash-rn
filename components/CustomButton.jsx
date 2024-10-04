
import React from 'react';
import { Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const CustomButton = ({
  title,
  handlePress,
  containerStyles = '',
  textStyles = '',
  isLoading = false,
}) => {
  let iconName = '';
  
  if (title === 'Google') {
    iconName = 'google';
  } else if (title === 'Facebook') {
    iconName = 'facebook';
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      style={{
        backgroundColor: title === 'Sign In' ? '#4CAF50' : '#3b5998',
        borderRadius: 8,
        padding: 10,
        height: 50,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        opacity: isLoading ? 0.7 : 1,
        marginTop: 30,
        ...containerStyles,
      }}
      disabled={isLoading}
    >
      {iconName && <Icon name={iconName} size={20} color="#fff" style={{ marginRight: 10 }} />}
      <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600', ...textStyles }}>
        {title}
      </Text>
      {isLoading && (
        <ActivityIndicator
          animating={isLoading}
          color="#fff"
          size="small"
          style={{ marginLeft: 10 }}
        />
      )}
    </TouchableOpacity>
  );
};

export default CustomButton;