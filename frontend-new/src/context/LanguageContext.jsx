
import { createContext, useContext, useState } from "react";

const LanguageContext = createContext();

const translations = {
  en: {
    appName: "Smart Farming",
    dashboard: "Farmer Dashboard",
    welcome: "Welcome, Farmer!",
    home: "Home",
    crops: "My Crops",
    expenses: "Expenses",
    profit: "Profit",
    marketPrice: "Market Prices",
    marketplace: "Marketplace",
    addProduct: "Add Product",
    weather: "Weather",
    recommendations: "Crop Recommendations",
    logout: "Logout",
    changeLanguage: "Choose Language",
    backDashboard: "Back to Dashboard",
    selectLanguage: "Select your preferred language",
    dailyPrices: "Daily Market Prices",
    viewPrices: "View Market Prices",
  },

  te: {
    appName: "స్మార్ట్ వ్యవసాయం",
    dashboard: "రైతు డాష్‌బోర్డ్",
    welcome: "స్వాగతం రైతు గారు!",
    home: "హోమ్",
    crops: "నా పంటలు",
    expenses: "ఖర్చులు",
    profit: "లాభం",
    marketPrice: "మార్కెట్ ధరలు",
    marketplace: "మార్కెట్‌ప్లేస్",
    addProduct: "ఉత్పత్తిని జోడించండి",
    weather: "వాతావరణం",
    recommendations: "పంటల సిఫార్సులు",
    logout: "లాగ్ అవుట్",
    changeLanguage: "భాషను ఎంచుకోండి",
    backDashboard: "డాష్‌బోర్డ్‌కు తిరిగి వెళ్ళండి",
    selectLanguage: "మీకు నచ్చిన భాషను ఎంచుకోండి",
    dailyPrices: "రోజువారీ మార్కెట్ ధరలు",
    viewPrices: "మార్కెట్ ధరలను చూడండి",
  },

  hi: {
    appName: "स्मार्ट खेती",
    dashboard: "किसान डैशबोर्ड",
    welcome: "स्वागत है किसान जी!",
    home: "होम",
    crops: "मेरी फसलें",
    expenses: "खर्चे",
    profit: "लाभ",
    marketPrice: "बाजार भाव",
    marketplace: "मार्केटप्लेस",
    addProduct: "उत्पाद जोड़ें",
    weather: "मौसम",
    recommendations: "फसल सुझाव",
    logout: "लॉग आउट",
    changeLanguage: "भाषा चुनें",
    backDashboard: "डैशबोर्ड पर वापस जाएं",
    selectLanguage: "अपनी पसंदीदा भाषा चुनें",
    dailyPrices: "दैनिक बाजार भाव",
    viewPrices: "बाजार भाव देखें",
  },
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("farmerLanguage") || "en";
  });

  function changeLanguage(newLanguage) {
    setLanguage(newLanguage);
    localStorage.setItem("farmerLanguage", newLanguage);
  }

  function t(key) {
    return (
      translations[language]?.[key] ||
      translations.en[key] ||
      key
    );
  }

  return (
    <LanguageContext.Provider
      value={{ language, changeLanguage, t }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
