import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useState } from "react";
import Input from "./../components/Input";
import InputPass from "./../components/PassInput";
import { FontAwesome } from "@expo/vector-icons";
import { register, addUser } from "../firebase/auth";

export default function Register() {
  const [userName, setUserName] = useState("");
  const [validUserName, setValidUserName] = useState(false);
  const [email, setEmail] = useState("");
  const [validEmail, setValidEmail] = useState(false);
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [validAddress, setValidAddress] = useState(false);
  const [validPhone, setValidPhone] = useState(false);
  const [password1, setPassword1] = useState("");
  const [validPassword1, setValidPassword1] = useState(false);
  const [password2, setPassword2] = useState("");
  const [validPassword2, setValidPassword2] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isError, setIsError] = useState(false);

  const vUserName = (userName) => {
    const v = userName.nativeEvent.text.trim();
    setUserName(v);
    setIsError(false);
    if (v.length > 5) {
      setValidUserName(true);
      setUserName(v);
    } else {
      setValidUserName(false);
    }
  };

  const vEmail = (email) => {
    const v = email.nativeEvent.text.trim();
    setEmail(v);
    setIsError(false);
    if (/[^\s@]+@[^\s@]+\.[^\s@]+/.test(v)) {
      setValidEmail(true);
      setEmail(v);
    } else {
      setValidEmail(false);
    }
  };

  const vPhone = (phone) => {
    const v = phone.nativeEvent.text.trim();
    setPhone(v);
    setIsError(false);
    if (
      /^(?:(?:\(?(?:00|\+)([1-4]\d\d|[1-9]\d?)\)?)?[\-\.\ \\\/]?)?((?:\(?\d{1,}\)?[\-\.\ \\\/]?){0,})(?:[\-\.\ \\\/]?(?:#|ext\.?|extension|x)[\-\.\ \\\/]?(\d+))?$/i.test(
        v
      ) &&
      v.length === 11
    ) {
      setValidPhone(true);
      setPhone(v);
    } else {
      setValidPhone(false);
    }
  };

  const vAddress = (add) => {
    const v = add.nativeEvent.text.trim();
    setAddress(v);
    setIsError(false);
    if (v.length) {
      setValidAddress(true);
    } else {
      setValidAddress(false);
    }
  };

  const vPassword1 = (pass) => {
    const v = pass.nativeEvent.text.trim();
    setPassword1(v);
    setIsError(false);
    if (v.length > 5) {
      setValidPassword1(true);
      setPassword1(v);
    } else {
      setValidPassword1(false);
    }
  };

  const vPassword2 = (pass) => {
    const v = pass.nativeEvent.text.trim();
    setPassword2(v);
    setIsError(false);
    if (v === password1 && v.length > 5) {
      setValidPassword2(true);
      setPassword2(v);
    } else {
      setValidPassword2(false);
    }
  };

  const handleSend = async () => {
    try {
      const isValid =
        validUserName &&
        validEmail &&
        validPassword1 &&
        validPassword2 &&
        validPhone &&
        validAddress;

      if (isValid) {
        setLoading(true);

        try {
          setLoading(false);
          const credentials = await register(email, password2);
          console.log(credentials);

          await addUser(
            credentials.user.uid,
            credentials.user.email,
            userName,
            phone,
            address
          );
          await AsyncStorage.setItem("@user", JSON.stringify(credentials.user));
          setUserName("");
          setEmail("");
          setPhone("");
          setAddress("");
          setPassword1("");
          setPassword2("");
          setValidUserName(false);
          setValidEmail(false);
          setValidPhone(false);
          setValidPassword1(false);
          setValidPassword2(false);
          setValidAddress(false);
          setLoading(true);
          router.replace("/home");
        } catch (addUserError) {
          if (addUserError.code === "auth/invalid-email") {
            console.log("this email is invalid");
            setError("this email is invalid");
            setIsError(true);
          } else if (addUserError.code === "auth/email-already-in-use") {
            console.error("this email used before");
            setError("this email used before");
            setIsError(true);
          } else {
            console.error("Error adding user:", JSON.stringify(addUserError));
            setError("something goes wrong try again later");
            setIsError(true);
          }
          setLoading(true);
          return;
        }
      } else {
        setError("Invalid field(s). Please check your input.");
        setLoading(true);
        setIsError(true);
      }
    } catch (error) {
      console.error("Registration error:", JSON.stringify(error));
      setError(
        "An error occurred during registration. Please try again later."
      );
      setLoading(true);
      setIsError(true);
      return;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.logCard}>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            width: "100%",
            alignItems: "center",
          }}
        >
          <TouchableOpacity
            style={{ marginTop: -20, marginBottom: 20 }}
            onPress={() => router.back()}
          >
            <FontAwesome name="chevron-left" size={30} color="white" />
          </TouchableOpacity>

          <Input
            type={false}
            iconImg={"user"}
            checkImg={
              userName.length < 1 ? null : validUserName ? "check" : "remove"
            }
            text={"Enter Your Username..."}
            handleInput={vUserName}
          />
          {userName.length < 1 ? null : validUserName ? null : (
            <Text style={{ fontSize: 12 }}>must be at least 6 characters</Text>
          )}
          <Input
            type={false}
            iconImg={"envelope-square"}
            checkImg={email.length < 1 ? null : validEmail ? "check" : "remove"}
            text={"Enter Your Email..."}
            handleInput={vEmail}
          />

          {email.length < 1 ? null : validEmail ? null : (
            <Text style={{ fontSize: 12 }}>
              example for the email aa@mail.com
            </Text>
          )}

          <Input
            type={true}
            iconImg={"phone"}
            checkImg={phone.length < 1 ? null : validPhone ? "check" : "remove"}
            text={"Enter Your Phone..."}
            handleInput={vPhone}
          />

          {phone.length < 1 ? null : validPhone ? null : (
            <Text style={{ fontSize: 12 }}>your phone must be 11 number</Text>
          )}

          <Input
            type={false}
            iconImg={"location-arrow"}
            checkImg={
              address.length < 1 ? null : validAddress ? "check" : "remove"
            }
            text={"Enter Your Address..."}
            handleInput={vAddress}
          />

          <InputPass
            vPass={vPassword1}
            checkImg={
              password1.length < 1 ? null : validPassword1 ? "check" : "remove"
            }
            text={"Enter Your Password..."}
          />
          {password1.length < 1 ? null : validPassword1 ? null : (
            <Text style={{ fontSize: 12 }}>must be at least 6 characters</Text>
          )}
          <InputPass
            vPass={vPassword2}
            checkImg={
              password2.length < 1 ? null : validPassword2 ? "check" : "remove"
            }
            text={"Confirm Your Password..."}
          />
          {password2.length < 1 ? null : validPassword2 ? null : (
            <Text style={{ fontSize: 12 }}>not match or invalid password</Text>
          )}

          {isError ? (
            <Text style={{ fontSize: 12, color: "red" }}> {error} </Text>
          ) : null}

          <TouchableOpacity style={styles.button} onPress={() => handleSend()}>
            {!loading ? (
              <ActivityIndicator size={"small"} color={"#ffb01d"} />
            ) : (
              <Text style={{ color: "#ffb01d", fontSize: 17 }}>Register</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.navigate("/account/login")}>
            <Text style={{ color: "white", fontWeight: "bold" }}>
              Login now!
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
  },
  logCard: {
    alignItems: "center",
    justifyContent: "center",
    width: "80%",
    height: 550,
    borderRadius: 25,
    backgroundColor: "#ffb01d",
    shadowColor: "#000",
    shadowOffset: {
      width: 3,
      height: 8,
    },
    shadowOpacity: 0.5,
    shadowRadius: 25,
    elevation: 20,
  },
  input: {
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#cffafe",
    width: "75%",
    height: 40,
    margin: 3,
    borderColor: "#ecfeff",
    borderWidth: 2,
    borderRadius: 10,
  },
  button: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#121312",
    width: 90,
    height: 50,
    borderRadius: 50,
    margin: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 3,
      height: 8,
    },
    shadowOpacity: 0.4,
    shadowRadius: 25,
    elevation: 10,
  },
  arrow: {
    flex: 0.26,
    marginBottom: 3,
    backgroundColor: "#155e75",
  },
  text: {
    height: "100%",
  },
});
