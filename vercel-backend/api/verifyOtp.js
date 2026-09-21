const admin = require('firebase-admin');
const { FieldValue } = require('firebase-admin/firestore');

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
    const { email, password, name, otp } = req.body;
    if (!email || !password || !name || !otp) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    const normalizedEmail = email.toLowerCase();
    const db = admin.firestore();
    const otpRef = db.collection('otp_codes').doc(normalizedEmail);
    const otpDoc = await otpRef.get();

    if (!otpDoc.exists) {
      return res.status(400).json({ error: 'No pending verification found. Please request a new code.' });
    }

    const otpData = otpDoc.data();

    if (Date.now() > otpData.expiresAt) {
      await otpRef.delete();
      return res.status(400).json({ error: 'Verification code has expired. Please request a new one.' });
    }

    if (otpData.attempts >= 5) {
      await otpRef.delete();
      return res.status(400).json({ error: 'Too many failed attempts. Please request a new code.' });
    }

    if (otpData.otp !== otp) {
      await otpRef.update({ attempts: FieldValue.increment(1) });
      return res.status(400).json({ error: 'Incorrect verification code.' });
    }

    // OTP Correct! Create user
    let userRecord;
    try {
        userRecord = await admin.auth().createUser({
            email: normalizedEmail,
            password: password,
            displayName: name,
            emailVerified: true
        });
    } catch (createError) {
        return res.status(500).json({ error: `Failed to create user account: ${createError.message}` });
    }

    await otpRef.delete();

    // Generate Custom Token
    const customToken = await admin.auth().createCustomToken(userRecord.uid);

    res.status(200).json({
        success: true,
        customToken: customToken,
        uid: userRecord.uid
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ error: error.message });
  }
};