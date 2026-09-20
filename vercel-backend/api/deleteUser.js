const admin = require('firebase-admin');

// Initialize Firebase Admin if not already initialized
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

// Allow CORS
const setCorsHeaders = (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*'); // Or restrict to your admin panel URL
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );
};

module.exports = async (req, res) => {
  setCorsHeaders(req, res);

  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // We only accept POST
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
      return;
    }

    const idToken = authHeader.split('Bearer ')[1];
    const { targetUid } = req.body;

    if (!targetUid) {
      res.status(400).json({ error: 'Missing targetUid' });
      return;
    }

    // Verify the caller's ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    // Optional: You could check if decodedToken.uid actually belongs to an Admin 
    // by fetching from your 'admins' collection in Firestore, but ensuring they
    // have a valid authenticated token from your project is the first step.
    const db = admin.firestore();
    const adminDoc = await db.collection('admins').doc(decodedToken.uid).get();
    
    if (!adminDoc.exists) {
        res.status(403).json({ error: 'Forbidden: You are not an admin.' });
        return;
    }

    // Delete the target user from Firebase Auth
    try {
        await admin.auth().deleteUser(targetUid);
    } catch (deleteError) {
        if (deleteError.code === 'auth/user-not-found') {
            console.log(`User ${targetUid} already deleted from Auth. Proceeding to clean up Firestore.`);
            // We treat this as a success so the frontend can finish deleting the database record
            return res.status(200).json({ success: true, message: 'User already missing from Auth, safe to delete from DB' });
        }
        throw deleteError; // Re-throw other errors to be caught by the outer catch block
    }

    res.status(200).json({ success: true, message: 'User successfully deleted from Auth' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: error.message });
  }
};
