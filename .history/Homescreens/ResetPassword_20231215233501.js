import React, { useState } from 'react';
import { Button, View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import firebase from '../Config/Index';

const auth = firebase.auth();

const ResetPassword = () => {
    const navigation = useNavigation();
    const [email, setEmail] = useState('');
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    const handleResetPassword = () => {
        auth
            .sendPasswordResetEmail(email)
            .then(() => {
                setSuccessMessage('Password reset email sent. Please check your inbox.');
                // Navigate back to the login screen
                //navigation.navigate('Login');
            })
            .catch((error) => {
                setError(error.message);
            });
    };

    const back = () => {
        navigation.navigate('Login');
    };

    return (
        <ImageBackground source={require('./../assets/user.png')} style={styles.backgroundImage}>
            <View style={styles.container}>
                <Text style={styles.title}>Reset Password</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    value={email}
                    onChangeText={(text) => setEmail(text)}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />
                <TouchableOpacity style={styles.resetButton} onPress={handleResetPassword}>
                    <Text style={styles.buttonText}>Reset Password</Text>
                </TouchableOpacity>
                {error && <Text style={styles.errorText}>{error}</Text>}
                {successMessage && <Text style={styles.successText}>{successMessage}</Text>}
                <TouchableOpacity style={styles.backButton} onPress={back}>
                    <Text style={styles.buttonText}>Back</Text>
                </TouchableOpacity>
            </View>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        width: "100%",
        height: "100%",
    },
    inputStyle: {

        width: "80%",
        height: 45,
        marginBottom: 30,
        borderRadius: 10,
        paddingLeft: 30,
        fontSize: 16,
    },
    errorText: {
        marginTop: 15,
        color: '#7D5A68',
        fontSize: 11,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        marginBottom: 10,
        marginTop: 10,
    },

    textStyle: {
        color: "#7D4A86",
        textAlign: "left",
        fontWeight: "bold",
        marginTop: 80,
        marginBottom: 50,
        fontStyle: "italic",
        fontFamily: 'Roboto',
        fontSize: 30,
    },
    buttonStyle: {
        width: "80%",
        height: 45,
        marginBottom: 15,
        borderRadius: 10,
        paddingLeft: 30,
        fontSize: 16,
        position: "center",
        color: "#white",
        backgroundColor: "#BC6FCA",
    },
    forget: {
        marginTop: 15,
        color: 'white',
        fontSize: 16,
        backgroundColor: '#D2B5FA',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
    }
});
export default ResetPassword;
