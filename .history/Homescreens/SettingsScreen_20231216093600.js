import React, { useState, useEffect } from 'react';
import { View, Text, Switch, Picker, StyleSheet, Button, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useColorScheme } from 'react-native-appearance'; // Import useColorScheme
import i18next from 'i18next';
import { initReactI18next, useTranslation } from 'react-i18next';
import firebase from '../Config/Index';
const auth = firebase.auth();
// Initialisation de i18next
i18next
    .use(initReactI18next)
    .init({
        resources: {
            en: {
                translation: {
                    language: 'Language',
                    theme: 'Theme',
                    light: 'Light',
                    dark: 'Dark',
                },
            },
            fr: {
                translation: {
                    language: 'Langue',
                    theme: 'Thème',
                    light: 'Clair',
                    dark: 'Sombre',
                },
            },
        },
        lng: 'en', // Langue par défaut
        fallbackLng: 'en',
    });

const SettingsScreen = () => {
    const navigation = useNavigation();
    const colorScheme = useColorScheme(); // Use useColorScheme to get the current color scheme
   const { t, i18n } = useTranslation(); // Translate with i18next
   const [isLoading, setIsLoading] = useState(true);
   const [language, setLanguage] = useState(i18n.options.lng);
   const [theme, setTheme] = useState(colorScheme);
   function handleSignOut() {
    auth.signOut().then(() => {
        navigation.replace('Auth');
        }).catch((error) => {
            console.log("Error signing out: ", error);
            });
            
  
    useEffect(() => {
      // Mise à jour du thème lorsqu'il change
      setTheme(colorScheme);
    }, [colorScheme]);
    const handleLogout = async () => {
        try {
            await auth.signOut(); // Appel de la fonction de déconnexion de Firebase
            navigation.navigate('Login'); // Redirection vers la page de connexion
        } catch (error) {
            console.error('Erreur lors de la déconnexion :', error.message);
        }
    };

    const [theme, setTheme] = useState(DarkMode.isDarkModeEnabled ? 'dark' : 'light');
    const [language, setLanguage] = useState('en');
    const { t } = useTranslation();

    useEffect(() => {
        // Mise à jour du thème lorsqu'il change
        DarkMode.addListener(changeTheme);
        return () => DarkMode.removeListener(changeTheme);
    }, []);

    const changeTheme = () => {
        setTheme(DarkMode.isDarkModeEnabled ? 'dark' : 'light');
    };

    const toggleTheme = () => {
        DarkMode.setDarkModeEnabled(!DarkMode.isDarkModeEnabled);
    };

    const changeLanguage = (selectedLanguage) => {
        setLanguage(selectedLanguage);
        i18next.changeLanguage(selectedLanguage);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Setting</Text>
            <Text style={styles.heading}>{t('language')}</Text>
            <Picker
                selectedValue={language}
                onValueChange={(itemValue) => changeLanguage(itemValue)}
                style={styles.picker}
            >
                <Picker.Item label="English" value="en" />
                <Picker.Item label="Français" value="fr" />
            </Picker>

            <Text style={styles.heading}>{t('theme')}</Text>
            <View style={styles.switchContainer}>
                <Text style={styles.themeText}>{t('light')}</Text>
                <Switch
                    value={theme === 'dark'}
                    onValueChange={toggleTheme}
                    trackColor={{ false: 'lightgray', true: 'darkgray' }}
                />
                <Text style={styles.themeText}>{t('dark')}</Text>
            </View>
            <View style={styles.container}>

                <TouchableOpacity style={styles.buttonStyle} onPress={handleLogout}>
                    <Text style={styles.login}>Déconnexion</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    heading: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    picker: {
        width: '100%',
        height: 50,
        marginBottom: 20,
    },
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    themeText: {
        fontSize: 16,
        marginHorizontal: 8,
    },
    title: {
        color: "#7D4A86",
        textAlign: "left",
        fontWeight: "bold",
        marginTop: 80,
        marginBottom: 50,
        fontStyle: "italic",
        fontFamily: 'Roboto',
        fontSize: 30,
    },
    login: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },

    buttonStyle: {
        color: "#7D4A86",
        backgroundColor: "#BC6FCA",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
});

export default SettingsScreen;
