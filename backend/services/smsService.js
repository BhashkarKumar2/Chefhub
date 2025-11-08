import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
const initializeFirebase = () => {
  if (!admin.apps.length) {
    try {
      // Check if required Firebase environment variables are present
      if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_PRIVATE_KEY || !process.env.FIREBASE_CLIENT_EMAIL) {
        // console.log('âš ï¸ Firebase Admin not configured - missing environment variables');
        // console.log('ðŸ’¡ Add FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, and FIREBASE_CLIENT_EMAIL to your .env file');
        return;
      }

      const serviceAccount = {
        type: "service_account",
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
      };

      // Validate that project_id is a string
      if (typeof serviceAccount.project_id !== 'string' || !serviceAccount.project_id) {
        throw new Error('FIREBASE_PROJECT_ID must be a valid string');
      }

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      
      // console.log('âœ… Firebase Admin initialized successfully');
    } catch (error) {
      // console.error('âŒ Firebase Admin initialization error:', error);
    }
  }
};

// Initialize Firebase on module load
initializeFirebase();

// Verify Firebase ID token (this will be used to verify tokens from frontend)
const verifyFirebaseToken = async (idToken) => {
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return {
      success: true,
      user: {
        uid: decodedToken.uid,
        phoneNumber: decodedToken.phone_number,
        email: decodedToken.email,
        name: decodedToken.name
      }
    };
  } catch (error) {
    // console.error('Firebase token verification error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Get user by phone number from Firebase
const getFirebaseUserByPhone = async (phoneNumber) => {
  try {
    const userRecord = await admin.auth().getUserByPhoneNumber(phoneNumber);
    return {
      success: true,
      user: {
        uid: userRecord.uid,
        phoneNumber: userRecord.phoneNumber,
        email: userRecord.email,
        displayName: userRecord.displayName
      }
    };
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      return { success: false, error: 'User not found' };
    }
    // console.error('Error getting Firebase user by phone:', error);
    return { success: false, error: error.message };
  }
};

// Create custom token for user (optional, for custom authentication flow)
const createFirebaseCustomToken = async (uid, additionalClaims = {}) => {
  try {
    const customToken = await admin.auth().createCustomToken(uid, additionalClaims);
    return { success: true, token: customToken };
  } catch (error) {
    // console.error('Error creating custom token:', error);
    return { success: false, error: error.message };
  }
};

export {
  verifyFirebaseToken,
  getFirebaseUserByPhone,
  createFirebaseCustomToken
};
