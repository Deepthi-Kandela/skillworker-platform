const SMS_MESSAGES = {
  new_job: {
    en: (service, customer) => `SkillConnect: New job request! Service: ${service} from ${customer}. Open app to accept.`,
    te: (service, customer) => `SkillConnect: మీకు కొత్త పని వచ్చింది! సేవ: ${service}, వినియోగదారు: ${customer}. అంగీకరించడానికి యాప్ తెరవండి.`,
  },
  booking_confirmed: {
    en: (service, worker) => `SkillConnect: Your booking is confirmed! Worker ${worker} will provide ${service}.`,
    te: (service, worker) => `SkillConnect: మీ పని విజయవంతంగా బుక్ అయింది! ${worker} మీకు ${service} అందిస్తారు.`,
  },
  job_completed: {
    en: (service) => `SkillConnect: Your ${service} job is completed. Please rate your experience in the app.`,
    te: (service) => `SkillConnect: మీ ${service} పని పూర్తయింది. యాప్లో మీ అనుభవాన్ని రేట్ చేయండి.`,
  },
};

const sendSMS = async (phone, messageType, params, lang = 'te') => {
  if (!phone) return;
  const msgFn = SMS_MESSAGES[messageType]?.[lang] || SMS_MESSAGES[messageType]?.en;
  if (!msgFn) return;
  // Log SMS — replace this with Twilio/MSG91 when ready
  console.log(`[SMS] To: ${phone} | ${msgFn(...params)}`);
};

module.exports = { sendSMS };
