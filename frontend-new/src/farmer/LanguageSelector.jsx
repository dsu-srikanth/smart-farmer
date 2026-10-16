
import { useLanguage } from "../context/LanguageContext";
import "./LanguageSelector.css";

function LanguageSelector() {
  const { language, changeLanguage, t } = useLanguage();

  return (
    <div className="language-selector">
      <label htmlFor="language">
        🌐 {t("changeLanguage")}
      </label>

      <select
        id="language"
        value={language}
        onChange={(event) => changeLanguage(event.target.value)}
      >
        <option value="en">English</option>
        <option value="te">తెలుగు</option>
        <option value="hi">हिंदी</option>
      </select>
    </div>
  );
}

export default LanguageSelector;
