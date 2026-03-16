import { useTranslation } from 'react-i18next';
import './LanguageToggle.css';

export default function LanguageToggle() {
  const { i18n } = useTranslation();
  const current = i18n.language;

  const toggle = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
  };

  return (
    <div className="lang-toggle">
      <button className={`lang-btn ${current === 'en' ? 'active' : ''}`} onClick={() => toggle('en')}>
        🇬🇧 EN
      </button>
      <button className={`lang-btn ${current === 'te' ? 'active' : ''}`} onClick={() => toggle('te')}>
        🇮🇳 తె
      </button>
    </div>
  );
}
