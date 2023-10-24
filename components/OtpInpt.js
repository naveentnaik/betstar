import React, { useEffect, useRef } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';


const OtpInput = ({otp,setOtp}) => {
  const otpInputRefs = useRef([]);

  useEffect(() => {
    // Set autofocus to the first input field when the component mounts
    if (otpInputRefs.current.length > 0) {
      otpInputRefs.current[0].focus();
    }
  }, []);


  const handleChangeOtp = (index, value) => {
    // Update the OTP value at the specified index
    const otpArray = otp.split('');
    otpArray[index] = value;
    setOtp(otpArray.join(''));

    // Move focus to the next input field if available
    if (value && index < otpInputRefs.current.length - 1) {
      otpInputRefs.current[index + 1].focus();
    }
  };

  const handleKeyPress = (index, key) => {
    // Handle the backspace key to move focus to the previous input field
    if (key === 'Backspace' && !otp[index]) {
      if (index > 0) {
        otpInputRefs.current[index - 1].focus();
      }
    }
  };

  return (
    <View style={styles.container}>
      {Array.from({ length: 6 }, (_, index) => (
        <TextInput
          key={index}
          style={styles.input}
          keyboardType="numeric"
          maxLength={1}
          value={otp[index] || ''}
          onChangeText={(value) => handleChangeOtp(index, value)}
          onKeyPress={({ nativeEvent: { key } }) =>
            handleKeyPress(index, key)
          }
          ref={(ref) => (otpInputRefs.current[index] = ref)}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom:10,
  },
  input: {
    width: 40,
    height: 40,
    borderBottomWidth:0.5,
    margin:2,
    textAlign: 'center',
  },
});

export default OtpInput;