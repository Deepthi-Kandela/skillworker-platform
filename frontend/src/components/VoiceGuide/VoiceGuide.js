import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import API from '../../api/axios';
import { FiVolume2, FiVolumeX } from 'react-icons/fi';
import './VoiceGuide.css';

export default function VoiceGuide({ script, label }) {
  const { t } = useTranslation();
  const [playing, setPlaying] = useState(false);

  const handleSpeak = async () => {
    if (playing) {
      window.speechSynthesis.cancel();
      setPlaying(false);
      return;
    }

    try {
      const { data } = await API.get(`/voice/${script}`);
      const utterance = new SpeechSynthesisUtterance(data.text);
      utterance.lang = 'te-IN';
      utterance.rate = 0.85;
      utterance.onend = () => setPlaying(false);
      utterance.onerror = () => setPlaying(false);
      setPlaying(true);
      window.speechSynthesis.speak(utterance);
    } catch {
      setPlaying(false);
    }
  };

  return (
    <button
      className={`voice-guide-btn ${playing ? 'playing' : ''}`}
      onClick={handleSpeak}
      title={t('voice.voice_guide')}
      aria-label={label || t('voice.listen')}
    >
      {playing ? <FiVolumeX size={18} /> : <FiVolume2 size={18} />}
      <span>{playing ? t('voice.stop') : t('voice.listen')}</span>
    </button>
  );
}
