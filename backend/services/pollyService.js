const VOICE_SCRIPTS = {
  register_skills: 'మీ నైపుణ్యాలను నమోదు చేయండి. మీ వర్గం, అనుభవం మరియు గంట రేటు నమోదు చేయండి.',
  accept_job: 'కొత్త పని వచ్చింది. అంగీకరించడానికి అంగీకరించు బటన్ నొక్కండి.',
  complete_job: 'పని పూర్తయింది. పూర్తయినట్లు గుర్తించు బటన్ నొక్కండి.',
  booking_confirmed: 'మీ పని విజయవంతంగా బుక్ అయింది. కార్మికుడు మీకు సంప్రదిస్తారు.',
  payment_info: 'చెల్లింపు పద్ధతిని ఎంచుకోండి. UPI, ఆన్లైన్ లేదా సేవ తర్వాత నగదు.',
  welcome: 'స్కిల్ కనెక్ట్కు స్వాగతం. మీ దగ్గర నమ్మకమైన నిపుణులను కనుగొనండి.',
};

const getScript = (req, res) => {
  const { script } = req.params;
  const text = VOICE_SCRIPTS[script];
  if (!text) return res.status(404).json({ message: 'Script not found' });
  res.json({ text });
};

module.exports = { getScript, VOICE_SCRIPTS };
