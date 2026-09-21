const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

if (!admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
  }
}

const setCorsHeaders = (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );
};

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SMTP_EMAIL || 'optimusprimecodename47@gmail.com',
        pass: process.env.SMTP_PASSWORD || 'your_app_password_here'
    }
});

module.exports = async (req, res) => {
  setCorsHeaders(req, res);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }

    // 1. Check if user exists
    try {
        await admin.auth().getUserByEmail(email);
        return res.status(400).json({ error: 'Account already exists. Please log in.' });
    } catch (error) {
        if (error.code !== 'auth/user-not-found') {
            throw error;
        }
    }

    // 2. Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 15 * 60 * 1000;

    // 3. Save to Firestore
    const db = admin.firestore();
    await db.collection('otp_codes').doc(email.toLowerCase()).set({
        otp: otp,
        expiresAt: expiresAt,
        attempts: 0
    });

    // 4. Send Email
    const mailOptions = {
        from: `"BrainBites" <${process.env.SMTP_EMAIL || 'optimusprimecodename47@gmail.com'}>`,
        to: email,
        subject: 'Your BrainBites Verification Code',
        text: `Welcome to BrainBites!\n\nYour 6-digit verification code is: ${otp}\n\nThis code will expire in 15 minutes.`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                <h2 style="color: #2D6A4F; text-align: center;">Welcome to BrainBites!</h2>
                <p style="font-size: 16px; color: #333;">Please use the following 6-digit verification code to complete your sign-up:</p>
                <div style="background-color: #f5f5f5; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
                    <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1a1a1a;">${otp}</span>
                </div>
                <p style="font-size: 14px; color: #666;">This code will expire in 15 minutes.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
                <p style="font-size: 12px; color: #999; text-align: center;">If you did not request this verification, please ignore this email.</p>
            </div>
        `
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ success: true, message: 'OTP sent successfully.' });
  } catch (error) {
    console.error('Error generating OTP:', error);
    res.status(500).json({ error: error.message });
  }
};
