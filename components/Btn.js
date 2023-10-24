import {View, Text, TouchableOpacity} from 'react-native';
import React from 'react';

export default function Btn({bgColor, btnLabel, textColor, Press,disabled}) {
  return (
    <TouchableOpacity
        disabled={disabled}
        onPress={Press}
        style={{
        backgroundColor: bgColor,
        borderRadius: 100,
        alignItems: 'center',
        justifyContent: 'center',
        width: "78%",
        paddingVertical: 5,
        marginVertical: 10
      }}>
      <Text style={{color: textColor, fontSize: 25, fontWeight: 'bold'}}>
        {btnLabel}
      </Text>
    </TouchableOpacity>
  );
}