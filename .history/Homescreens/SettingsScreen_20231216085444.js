import React, { useState, useEffect } from 'react';
import { View, Text, Switch, Picker, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import i18next from 'i18next';
import { initReactI18next, useTranslation } from 'react-i18next';

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

    
    const [language, setLanguage] = useState('en');
    const { t } = useTranslation();


    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    const changeLanguage = (selectedLanguage) => {
        setLanguage(selectedLanguage);
        i18next.changeLanguage(selectedLanguage);
    };

    return (
        <View style={styles.container}>
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
});

export default SettingsScreen;
