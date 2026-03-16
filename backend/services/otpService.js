// In-memory OTP store: { phone: { otp, expiresAt } }
const otpStore = new Map();

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const sendOTP = (phone) => {
  const otp = generateOTP();
  otpStore.set(phone, { otp, expiresAt: Date.now() + 5 * 60 * 1000 }); // 5 min expiry

  // Log OTP to console — replace with Twilio/MSG91 for real SMS
  console.log(`\n[OTP] Phone: ${phone} | OTP: ${otp} | Expires in 5 minutes\n`);

  return otp;
};

const verifyOTP = (phone, otp) => {
  const record = otpStore.get(phone);
  if (!record) return { valid: false, message: 'OTP not found. Please request again.' };
  if (Date.now() > record.expiresAt) {
    otpStore.delete(phone);
    return { valid: false, message: 'OTP expired. Please request again.' };
  }
  if (record.otp !== otp) return { valid: false, message: 'Invalid OTP.' };
  otpStore.delete(phone);
  return { valid: true };
};

module.exports = { sendOTP, verifyOTP };
