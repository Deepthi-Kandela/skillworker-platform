const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const TEMPLATES = {
  account_verified: (name) => ({
    subject: 'Welcome to Skill Connect! ✅',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f5f5ff;padding:20px;border-radius:16px;">
        <div style="background:linear-gradient(135deg,#6C63FF,#FF6584);padding:30px;border-radius:12px;text-align:center;margin-bottom:20px;">
          <h1 style="color:#fff;margin:0;font-size:1.8rem;">⚡ Skill Connect</h1>
          <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;">Your trusted service marketplace</p>
        </div>
        <div style="background:#fff;padding:28px;border-radius:12px;">
          <h2 style="color:#1a1a2e;">Welcome, ${name}! 🎉</h2>
          <p style="color:#555;line-height:1.7;">Your account has been successfully created on Skill Connect. You can now search and book skilled workers near you.</p>
          <a href="${process.env.CLIENT_URL}" style="display:inline-block;background:#6C63FF;color:#fff;padding:12px 28px;border-radius:10px;text-decoration:none;font-weight:700;margin-top:16px;">Get Started →</a>
        </div>
        <p style="text-align:center;color:#aaa;font-size:0.8rem;margin-top:16px;">© 2024 Skill Connect. All rights reserved.</p>
      </div>`,
  }),

  booking_confirmed: (name, service, date, workerName) => ({
    subject: `Booking Confirmed – ${service} 📅`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f5f5ff;padding:20px;border-radius:16px;">
        <div style="background:linear-gradient(135deg,#43E97B,#38f9d7);padding:30px;border-radius:12px;text-align:center;margin-bottom:20px;">
          <h1 style="color:#fff;margin:0;">✅ Booking Confirmed!</h1>
        </div>
        <div style="background:#fff;padding:28px;border-radius:12px;">
          <p style="color:#555;">Hi <strong>${name}</strong>,</p>
          <p style="color:#555;line-height:1.7;">Your booking has been confirmed. Here are the details:</p>
          <table style="width:100%;border-collapse:collapse;margin:16px 0;">
            <tr style="background:#f8f8ff;"><td style="padding:10px 14px;font-weight:700;color:#6C63FF;">Service</td><td style="padding:10px 14px;color:#333;">${service}</td></tr>
            <tr><td style="padding:10px 14px;font-weight:700;color:#6C63FF;">Worker</td><td style="padding:10px 14px;color:#333;">${workerName}</td></tr>
            <tr style="background:#f8f8ff;"><td style="padding:10px 14px;font-weight:700;color:#6C63FF;">Date</td><td style="padding:10px 14px;color:#333;">${date}</td></tr>
          </table>
          <p style="color:#888;font-size:0.85rem;">మీ బుకింగ్ విజయవంతంగా నమోదైంది 🙏</p>
          <a href="${process.env.CLIENT_URL}/my-bookings" style="display:inline-block;background:#43E97B;color:#fff;padding:12px 28px;border-radius:10px;text-decoration:none;font-weight:700;margin-top:8px;">View Booking →</a>
        </div>
      </div>`,
  }),

  payment_receipt: (name, service, amount, paymentId) => ({
    subject: `Payment Receipt – ₹${amount} 💳`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f5f5ff;padding:20px;border-radius:16px;">
        <div style="background:linear-gradient(135deg,#F7971E,#FFD200);padding:30px;border-radius:12px;text-align:center;margin-bottom:20px;">
          <h1 style="color:#fff;margin:0;">💰 Payment Receipt</h1>
        </div>
        <div style="background:#fff;padding:28px;border-radius:12px;">
          <p style="color:#555;">Hi <strong>${name}</strong>, your payment was successful!</p>
          <table style="width:100%;border-collapse:collapse;margin:16px 0;">
            <tr style="background:#f8f8ff;"><td style="padding:10px 14px;font-weight:700;color:#F7971E;">Service</td><td style="padding:10px 14px;">${service}</td></tr>
            <tr><td style="padding:10px 14px;font-weight:700;color:#F7971E;">Amount Paid</td><td style="padding:10px 14px;font-size:1.2rem;font-weight:800;color:#1a1a2e;">₹${amount}</td></tr>
            <tr style="background:#f8f8ff;"><td style="padding:10px 14px;font-weight:700;color:#F7971E;">Payment ID</td><td style="padding:10px 14px;font-size:0.82rem;color:#888;">${paymentId}</td></tr>
          </table>
        </div>
      </div>`,
  }),

  worker_new_job: (workerName, service, customerName) => ({
    subject: `New Job Request – ${service} 🔧`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f5f5ff;padding:20px;border-radius:16px;">
        <div style="background:linear-gradient(135deg,#6C63FF,#a78bfa);padding:30px;border-radius:12px;text-align:center;margin-bottom:20px;">
          <h1 style="color:#fff;margin:0;">🔔 New Job Request!</h1>
        </div>
        <div style="background:#fff;padding:28px;border-radius:12px;">
          <p style="color:#555;">Hi <strong>${workerName}</strong>,</p>
          <p style="color:#555;line-height:1.7;">You have a new job request for <strong>${service}</strong> from <strong>${customerName}</strong>.</p>
          <p style="color:#888;font-size:0.85rem;">మీకు కొత్త పని వచ్చింది 🙏</p>
          <a href="${process.env.CLIENT_URL}/worker/dashboard" style="display:inline-block;background:#6C63FF;color:#fff;padding:12px 28px;border-radius:10px;text-decoration:none;font-weight:700;margin-top:8px;">View Dashboard →</a>
        </div>
      </div>`,
  }),
};

const sendEmail = async (to, templateKey, params = []) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log(`[EMAIL] To: ${to} | Template: ${templateKey}`);
    return;
  }
  try {
    const template = TEMPLATES[templateKey]?.(...params);
    if (!template) return;
    await transporter.sendMail({
      from: `"Skill Connect" <${process.env.EMAIL_USER}>`,
      to,
      subject: template.subject,
      html: template.html,
    });
  } catch (err) {
    console.error('[EMAIL ERROR]', err.message);
  }
};

module.exports = { sendEmail };
