import React, {  useState } from "react";
import { View, StyleSheet, Alert, Text } from "react-native";
import Field from "./Field";
import Btn from "./Btn";
import { darkGreen } from "./Constants";
import { useNavigation } from "@react-navigation/native";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { signInWithCredential } from "firebase/auth";
import { FIREBASE_AUTH } from "../firebaseConfig";

const NewPassword = ({userToken,setCapchaverified,setEnteringNumber,credential}) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const navigation=useNavigation();
  const auth = FIREBASE_AUTH;

  
  const handlePasswordChange = (text) => {
    setPassword(text);
    setPasswordError("");
  };

  const handleConfirmPasswordChange = (text) => {
    setConfirmPassword(text);
    setConfirmPasswordError("");
  };

  const isFormValid = () => {
    let isValid = true;

    if (!password) {
      setPasswordError("Password is required");
      isValid = false;
    } else if (password.length < 6 || password.length > 8) {
      setPasswordError("Password must be between 6 and 8 characters");
      isValid = false;
    } else if (/^\d+$/.test(password)) {
      setPasswordError("Password cannot contain only numbers");
      isValid = false;
    }

    if (!confirmPassword) {
      setConfirmPasswordError("Confirm Password is required");
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async() => {
    if (isFormValid()) {
      await signInWithCredential(auth, credential);
      const docRef = doc(db,"users",userToken);
      updateDoc(docRef,{
        password
       })
       setPassword("")
       setConfirmPassword("")
       setCapchaverified(false)
       setEnteringNumber(true)
      navigation.navigate('Home')
    } else {
      Alert.alert(
        "Error",
        "Invalid form data. Please check your entries and try again."
      );
    }
  };

  return (
      <View
        style={{
          width: "100%",
          height: "100%",
          alignItems: "center",
          marginTop: 65,
        }}
      >
        <Field
          placeholder="Create Password"
          secureTextEntry
          onChangeText={handlePasswordChange}
          value={password}
        />
        {passwordError ? (
          <Text style={styles.error}>{passwordError}</Text>
        ) : null}
        <Field
          placeholder="Confirm Password"
          secureTextEntry
          onChangeText={handleConfirmPasswordChange}
          value={confirmPassword}
        />
        {confirmPasswordError ? (
          <Text style={styles.error}>{confirmPasswordError}</Text>
        ) : null}
        <Btn
          textColor="white"
          bgColor={darkGreen}
          btnLabel="Continue"
          Press={handleSubmit}
        />
      </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  input: {
    width: "80%",
    marginBottom: 16,
    padding: 10,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 4,
  },
  error: {
    color: "red",
    marginBottom: 8,
  },
});

export default NewPassword;
