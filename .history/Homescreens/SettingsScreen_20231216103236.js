import React, { useState, useEffect, useContext } from 'react';
import { View, Text, Switch, Picker, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import i18next from 'i18next';
import { initReactI18next, useTranslation } from 'react-i18next';
import firebase from '../Config/Index';

// Create a ThemeContext
const ThemeContext = React.createContext();

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
          setting: 'Setting',
          deconnection: 'Logout',
        },
      },
      fr: {
        translation: {
          language: 'Langue',
          theme: 'Thème',
          light: 'Clair',
          dark: 'Sombre',
          setting: 'Paramètre',
          deconnection: 'Déconnexion',
        },
      },
    },
    lng: 'en', // Default language
    fallbackLng: 'en',
  });

const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

const SettingsScreen = () => {
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();

  const [language, setLanguage] = useState(i18n.options.lng);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigation.navigate('Login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion :', error.message);
    }
  };

  const changeLanguage = (selectedLanguage) => {
    setLanguage(selectedLanguage);
    i18next.changeLanguage(selectedLanguage);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('setting')}</Text>
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
          <Text style={styles.login}>{t('deconnection')}</Text>
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
    color: '#7D4A86',
    textAlign: 'left',
    fontWeight: 'bold',
    marginTop: 80,
    marginBottom: 50,
    fontStyle: 'italic',
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
    color: '#7D4A86',
    backgroundColor: '#BC6FCA',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
});

export { ThemeProvider, useTheme };
export default SettingsScreen;
