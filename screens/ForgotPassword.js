import React, {  useRef, useState } from "react";
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
import OtpInput from "../components/OtpInpt";
import { useNavigation } from "@react-navigation/native"; 
import { FIREBASE_AUTH } from "../firebaseConfig";
import { PhoneAuthProvider, signInWithCredential } from "firebase/auth";
import { FIREBASE_CONFIG } from "../firebaseConfig";
import { FirebaseRecaptchaVerifierModal } from "expo-firebase-recaptcha";
import PhoneInput from "react-native-phone-number-input";
import NewPassword from "../components/NewPassword";
import {
  collection,
  getDocs,
  getFirestore,
  query,
  where,
} from "firebase/firestore";

var { height, width } = Dimensions.get("window");

console.log(height);
const ForgotPassword = () => {
  const [error, setError] = useState();
  const [number, setNumber] = useState("");
  const [verificateId, setVerificationId] = useState();
  const [otp, setOtp] = useState("");
  const [capchaVerified, setCapchaverified] = useState(false);
  const [enteringNumber, setEnteringNumber] = useState(true);
  const [userToken, setUserToken] =useState("");
  const[credential, setCredential] = useState()
  const navigation = useNavigation();
  const recaptchaVerifier = useRef(null);
  const auth = FIREBASE_AUTH;
  const phoneInput = useRef(null);
  const [FormattedValue, setFormattedValue] = useState("");
  const getUserData = getFirestore();
  const colref = collection(getUserData, "users");


  const setUpRecaptha = async (number) => {
    const phoneProvider = new PhoneAuthProvider(FIREBASE_AUTH);
    const verificationId = await phoneProvider.verifyPhoneNumber(
      number,
      recaptchaVerifier.current
    );
    setVerificationId(verificationId);
  };
  const getOtp = async () => {
    setError("");
    if (number === "" || number === undefined|| number.length<9)
      return setError("Please enter a valid phone number!");
    const docRef = query(colref, where("phone_number", "==", FormattedValue));
    const data = await getDocs(docRef);
    if (!data.docs[0]?.data()?.phone_number)
      return setError("Phone number is not registered!");
      setUserToken(data.docs[0]?.data()?.user_id)
    try {
     await setUpRecaptha(FormattedValue);
      setEnteringNumber(false);
      setCapchaverified(true);
    } catch (err) {
      console.error(err);
      setError("Please enter a valid phone number!");
    }
  };

  const verifyOtp = async () => {
    setError("");
    if (otp === "" || otp === null) return;
    try {
      const credential = PhoneAuthProvider.credential(verificateId, otp);
      setCredential(credential)
      setCapchaverified(false);
      setNumber("")
      setOtp("")
    } catch (err) {
      setError(err.message);
      console.log(err.message);
    }
  };

  return (
    <Background>
      <SafeAreaView
        style={{ alignItems: "center", width: width, height: height }}
      >
        <Text
          style={{
            color: "white",
            fontSize: 64,
            fontWeight: "bold",
            marginTop: 50,
          }}
        >
          Validation
        </Text>
        <Text
          style={{
            color: "white",
            fontSize: 19,
            fontWeight: "bold",
            marginBottom: 20,
          }}
        >
          Validate your number
        </Text>
        <View
          style={{
            backgroundColor: "white",
            height: height - 181.5,
            width: width,
            borderTopLeftRadius: 130,
            paddingRight: 0,
            paddingTop: 0,
            alignItems: "center",
          }}
        >
          {enteringNumber ? (
            <View
              style={{
                width: "100%",
                height: "100%",
                alignItems: "center",
                marginTop: 65,
              }}
            >
              <FirebaseRecaptchaVerifierModal
                    ref={recaptchaVerifier}
                    firebaseConfig={FIREBASE_CONFIG}
                    attemptInvisibleVerification
                  />
              <PhoneInput
                ref={phoneInput}
                defaultValue={number}
                defaultCode="IN"
                layout="first"
                onChangeText={(text) => {
                  setNumber(text);
                }}
                onChangeFormattedText={(text) => {
                  setFormattedValue(text);
                }}
                withShadow
                autoFocus
                containerStyle={{
                  borderRadius: 100,
                  alignItems: "center",
                  justifyContent: "center",
                  width: "78%",
                  paddingVertical: 5,
                  marginVertical: 10,
                }}
                textContainerStyle={{
                  borderRadius: 100,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "white",
                  paddingVertical: 12,
                  marginVertical: 0,
                  paddingLeft: 0,
                }}
                flagButtonStyle={{
                  width: "20%",
                  marginLeft: 15,
                }}
              />
              {error && <Text style={{ color: "red" }}>{error}</Text>}

              <Btn
                textColor="white"
                bgColor={darkGreen}
                btnLabel="Get OTP"
                Press={getOtp}
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
                <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                  <Text
                    style={{
                      color: darkGreen,
                      fontWeight: "bold",
                      fontSize: 16,
                    }}
                  >
                    Login
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : capchaVerified ? (
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

              <Text
                style={{
                  color: darkGreen,
                  fontWeight: "bold",
                  fontSize: 16,
                }}
                onPress={() => setEnteringNumber(true)}
              >
                Change Number
              </Text>
            </View>
          ) : (
            <NewPassword userToken={userToken} setCapchaverified={setCapchaverified} setEnteringNumber={setEnteringNumber} credential={credential}/>
          )}
        </View>
      </SafeAreaView>
    </Background>
  );
};

export default ForgotPassword;

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
});
