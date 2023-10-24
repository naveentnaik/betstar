import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import HomeScreen from "./screens/HomeScreen";
import RegisterScreen from "./screens/RegisterScreen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Login from "./screens/Login";
import ForgotPassword from "./screens/ForgotPassword";
import { deleteUser, onAuthStateChanged } from "firebase/auth";
import { FIREBASE_AUTH, db } from "./firebaseConfig";
import * as AsyncStorage from "@react-native-async-storage/async-storage";
import { ActivityIndicator, View } from "react-native";
import { collection, deleteDoc, doc, getDocs, getFirestore, query, where } from "firebase/firestore";

const Stack = createNativeStackNavigator();

const Main = () => {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const getUserData=getFirestore()
  const colref=collection(getUserData,"users")

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, async (user) => {
      const userDetails = await AsyncStorage.default.getItem("userDetails");
      console.log(userDetails)
      const parsedUserDetails = JSON.parse(userDetails);

      if(user){
        console.log(user)
        const docRef = query(colref,where("phone_number","==",user.phoneNumber));
        const data=await getDocs(docRef)
        console.log(data.docs[0].data())
        if (!data.docs[0]?.data()?.username&&parsedUserDetails?.registrationOngoing===false||undefined){
              const ref=doc(db,'users',data.docs[0].data().user_id)
              await deleteDoc(ref)
              deleteUser(user)
              const  userDetailsString= JSON.stringify({token:"",RegistrationOngoing:false})
              await AsyncStorage.default.setItem("userDetails",userDetailsString)
              console.log(data.docs[0].data().username)
        }
      }
      if (user && !parsedUserDetails?.RegistrationOngoing) {
        setUser(user);
      } 
      setAuthChecked(true); 
    });

    return () => unsubscribe();
  }, []);


  if (!authChecked) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }


  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="Home" component={HomeScreen} />
          </>
        )}
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Main;



