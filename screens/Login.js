import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
} from "react-native";
import Background from "../components/Background";
import Btn from "../components/Btn";
import { darkGreen } from "../components/Constants";
import Field from "../components/Field";
import { useNavigation } from "@react-navigation/native";
import {
  collection,
  getDocs,
  getFirestore,
  query,
  where,
} from "firebase/firestore";
import { PhoneAuthProvider, signInWithCredential } from "firebase/auth";
import OtpInput from "../components/OtpInpt";
import { FIREBASE_CONFIG } from "../firebaseConfig";
import { FIREBASE_AUTH } from "../firebaseConfig";
import { FirebaseRecaptchaVerifierModal } from "expo-firebase-recaptcha";

var { height, width } = Dimensions.get("window");
const Login = () => {
  const auth = FIREBASE_AUTH;
  const [toggle, settoggle] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const navigation = useNavigation();
  const getUserData = getFirestore();
  const colref = collection(getUserData, "users");
  const recaptchaVerifier = useRef(null);
  const [verificateId, setVerificationId] = useState();
  const [otp, setOtp] = useState("");

  const handleUsernameChange = (text) => {
    setUsername(text);
    setUsernameError("");
  };
  const handlePasswordChange = (text) => {
    setPassword(text);
    setPasswordError("");
  };
  const isFormValid = () => {
    let isValid = true;
    if (!username || username.length <= 5) {
      setUsernameError("Username must be bigger than 6 characters");
      isValid = false;
    }

    if (!password) {
      setPasswordError("Password is required");
      isValid = false;
    } else if (password.length < 6 || password.length > 12) {
      setPasswordError("Password must be between 6 and 8 characters");
      isValid = false;
    } else if (/^\d+$/.test(password)) {
      setPasswordError("Password cannot contain only numbers");
      isValid = false;
    }
    return isValid;
  };

  const setUpRecaptha = async (number) => {
    try {
      const phoneProvider = new PhoneAuthProvider(FIREBASE_AUTH);
      const verificationId = await phoneProvider.verifyPhoneNumber(
        number,
        recaptchaVerifier.current
      );
      setVerificationId(verificationId);
    } catch (error) {
      console.log(error);
    }
  };

  const getOtp = async (phoneNumber) => {
    try {
      await setUpRecaptha(phoneNumber);
    } catch (err) {
      console.log(err.message);
    }
  };

  const verifyOtp = async () => {
    if (otp === "" || otp === null) return;
    try {
      const credential = PhoneAuthProvider.credential(verificateId, otp);
      await signInWithCredential(auth, credential);
      navigation.navigate("Home");
    } catch (err) {
      console.log(err.message);
    }
  };

  const handleSubmit = async () => {
    try {
      if (isFormValid()) {
        const docRef = query(colref, where("username", "==", username));
        const data = await getDocs(docRef);
        if (data.docs[0]?.data()?.username) {
          if (data.docs[0]?.data()?.password === password) {
            getOtp(data.docs[0]?.data().phone_number);
            settoggle(false);
          } else {
            setPasswordError("invalid credentials");
          }
        } else {
          setPasswordError("invalid credentials");
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Background>
      <SafeAreaView
        style={{ alignItems: "center", width: width, height: height }}
      >
        <FirebaseRecaptchaVerifierModal
            ref={recaptchaVerifier}
            firebaseConfig={FIREBASE_CONFIG}
            attemptInvisibleVerification
          />
        <Text
          style={{
            color: "white",
            fontSize: 64,
            fontWeight: "bold",
            marginTop: 50,
            marginBottom: 20,
          }}
        >
          Sign in
        </Text>
        <View
          style={{
            backgroundColor: "white",
            height: height - 155.5,
            width: width,
            borderTopLeftRadius: 130,
            paddingRight: 0,
            paddingTop: 0,
            alignItems: "center",
          }}
        >
          {toggle ? (
            <View
              style={{
                width: "100%",
                height: "100%",
                alignItems: "center",
                marginTop: 65,
              }}
            >
              <Field
                placeholder="Enter Username"
                onChangeText={handleUsernameChange}
                value={username}
                autoFocus={true}
              />
              {usernameError ? (
                <Text style={styles.error}>{usernameError}</Text>
              ) : null}
              <Field
                placeholder="Enter Password"
                secureTextEntry
                onChangeText={handlePasswordChange}
                value={password}
              />
              {passwordError ? (
                <Text style={styles.error}>{passwordError}</Text>
              ) : null}
              <Btn
                textColor="white"
                bgColor={darkGreen}
                btnLabel="Sign in"
                Press={handleSubmit}
              />
              <View
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                  Go back to{" "}
                </Text>

                <TouchableOpacity
                  onPress={() => navigation.navigate("Register")}
                >
                  <Text
                    style={{
                      color: darkGreen,
                      fontWeight: "bold",
                      fontSize: 16,
                    }}
                  >
                    Register
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => navigation.navigate("ForgotPassword")}
                >
                  <Text
                    style={{
                      color: darkGreen,
                      fontWeight: "bold",
                      fontSize: 16,
                    }}
                  >
                    {""} Forgot Password?
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View
              style={{
                width: "100%",
                height: "100%",
                alignItems: "center",
                marginTop: 65,
              }}
            >
              <OtpInput otp={otp} setOtp={setOtp} />
              <Btn
                textColor="white"
                bgColor={darkGreen}
                btnLabel="Confirm OTP"
                Press={verifyOtp}
                disabled={otp.length < 6}
              />
            </View>
          )}
        </View>
      </SafeAreaView>
    </Background>
  );
};

export default Login;

const styles = StyleSheet.create({
  borderStyleBase: {
    width: 30,
    height: 45,
  },

  borderStyleHighLighted: {
    borderColor: "#006A42",
  },

  underlineStyleBase: {
    width: 30,
    height: 45,
    borderWidth: 0,
    borderBottomWidth: 1,
  },

  underlineStyleHighLighted: {
    borderColor: "#006A42",
  },
  error: {
    color: "red",
    marginBottom: 8,
  },
});
