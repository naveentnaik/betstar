import React, { useEffect, useRef,useState } from "react";
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
import { useNavigation } from '@react-navigation/native'
import { FIREBASE_AUTH } from '../firebaseConfig';
import {  useDispatch } from "react-redux";
import { PhoneAuthProvider, signInWithCredential } from 'firebase/auth';
import { setUser } from '../redux/userSlice';
import { FIREBASE_CONFIG } from '../firebaseConfig';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import PhoneInput from "react-native-phone-number-input";
import UserDetails from "../components/UserDetails";
import {  collection, doc, setDoc, getDocs, query, getFirestore, where } from "firebase/firestore";
import { db } from "../firebaseConfig";
import * as AsyncStorage from "@react-native-async-storage/async-storage";
var {height,width}=Dimensions.get('window')

const RegisterScreen = ( ) => {
  const [error,setError]=useState()
  const [number, setNumber] = useState('');
  const [FormattedValue,setFormattedValue]=useState('')
  const [verificateId,setVerificationId] = useState()
  const [otp, setOtp] = useState("");
  const [capchaVerified,setCapchaverified]=useState(false)
  const [enteringNumber,setEnteringNumber] = useState(true)
  const navigation=useNavigation()
  const dispatch = useDispatch()
  const recaptchaVerifier=useRef(null)
  const auth=FIREBASE_AUTH;
  const phoneInput = useRef(null);
  const getUserData=getFirestore()
  const colref=collection(getUserData,"users")
  
  useEffect(() => {
    const unsubscribe = async() => {
      const userDetails= await AsyncStorage.default.getItem("userDetails")
      const parsedUserDetails= JSON.parse(userDetails)
      if(parsedUserDetails.RegistrationOngoing){
        setEnteringNumber(false)
        setCapchaverified(false)
      }
    }
    unsubscribe()
    return () => unsubscribe();
  },[]);
  

  const onpressLoginButton=()=>{
    setError("")
    navigation.navigate("Login")
  }

  const setUpRecaptha=async(number)=>{
    try {
      const phoneProvider = new PhoneAuthProvider(FIREBASE_AUTH);
      const verificationId = await phoneProvider.verifyPhoneNumber(
        number,
        recaptchaVerifier.current
      );
      setVerificationId(verificationId); 
      console.log(verificationId);
    } catch (error) {
      console.error(error);
    }
   
  }
  const getOtp = async () => {
    setError("");
    if (number === "" || number === undefined|| number.length<9)
      return setError("Please enter a valid phone number!");
    try {
      const docRef = query(colref,where("phone_number","==",FormattedValue));
      const data=await getDocs(docRef)
      if (data.docs[0]?.data()?.phone_number)
      return setError("Phone number already exists");
      await setUpRecaptha(FormattedValue);
      console.log("Phone number")
      setEnteringNumber(false)
      setCapchaverified(true)
    } catch (err) {
      console.log(err)
      setError("Please enter a valid phone number!");
      
    }
  };

  const verifyOtp = async () => {
    setError("");
    if (otp === "" || otp === null) return;
    try {
      const credential = PhoneAuthProvider.credential(verificateId,otp);
        const {_tokenResponse}= await signInWithCredential(auth, credential);
     setCapchaverified(false)
      dispatch(setUser({user_id: _tokenResponse.localId,phone_number: _tokenResponse.phoneNumber}))

      const docRef = doc(db,"users",_tokenResponse.localId );
      setDoc(docRef,{ 
        user_id: _tokenResponse.localId,phone_number: _tokenResponse.phoneNumber
      })
       const  userDetailsString= JSON.stringify({token:_tokenResponse.localId,RegistrationOngoing:true})
      await AsyncStorage.default.setItem("userDetails",userDetailsString)
      setNumber("")
      setError("")
    } catch (err) {
      setError(err.message);
    }
  };

  return (  
    <Background>
      <SafeAreaView style={{ alignItems: "center", width: width,height:height }}>
        <Text
          style={{
            color: "white",
            fontSize: 64,
            fontWeight: "bold",
            marginTop: 50,
          }}
        >
          Register
        </Text>
        <Text
          style={{
            color: "white",
            fontSize: 19,
            fontWeight: "bold",
            marginBottom: 20,
          }}
        >
          Create a new account
        </Text>
        <View
          style={{
            backgroundColor: "white",
            height: height-181.5,
            width: width,
            borderTopLeftRadius: 130,
            paddingRight: 0,
            paddingTop: 0,
            alignItems: "center",
          }}
        >
          {enteringNumber ? (
            <View style={{width:"100%",height:"100%",alignItems:"center",marginTop:65}}>
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
              alignItems: 'center',
              justifyContent: 'center',
              width: "78%",
              paddingVertical: 5,
              marginVertical: 10
            }}
            textContainerStyle={{
              borderRadius: 100,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor:"white",
              paddingVertical: 12,
              marginVertical: 0,
              paddingLeft:0
            }}
            flagButtonStyle={{
              width:"20%",
              marginLeft:15
            }}
          />  
          {error&&<Text style={{color:"red"}}>{error}</Text>}

              <Btn
                textColor="white"
                bgColor={darkGreen}
                btnLabel="Signup"
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
                  Already have an account ?{" "}
                </Text>
                <TouchableOpacity
                  onPress={onpressLoginButton}
                >
                  <Text
                    style={{
                      color: darkGreen,
                      fontWeight: "bold",
                      fontSize: 16,
                    }}
                  >
                    Login
                  </Text>
                  {/* <FirebaseRecaptchaVerifierModal
                    ref={recaptchaVerifier}
                    firebaseConfig={FIREBASE_CONFIG}
                    attemptInvisibleVerification
                  /> */}
                </TouchableOpacity>
              </View>
            </View>
          ) :( capchaVerified ? (
            <View style={{width:"100%",height:"100%",alignItems:"center",marginTop:65}}>
               <OtpInput otp={otp} setOtp={setOtp} />
              <Btn
                textColor="white"
                bgColor={darkGreen}
                btnLabel="Confirm OTP"
                Press={verifyOtp}
                disabled={otp.length<6}
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
            <UserDetails setEnteringNumber={setEnteringNumber} setCapchaverified={setCapchaverified}/>
          ))}
        </View>
      </SafeAreaView>
    </Background>
    
  );
};

export default RegisterScreen;

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
