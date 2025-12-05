import '../loadEnv.js'; // Load environment variables
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';

// Debug: Check if environment variables are loaded
// console.log('Passport.js - Environment variables check:');
// console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'Found' : 'Missing');
// console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'Found' : 'Missing');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/api/auth/google/callback',
    scope: ['profile', 'email']
  },
  async (accessToken, refreshToken, profile, done) => {
    // This is the "verify" callback. It's called when Google successfully authenticates the user.
    try {
      // Find a user with this Google ID
      let user = await User.findOne({ googleId: profile.id });

      if (user) {
        // If user exists, pass them to the next middleware
        return done(null, user);
      } else {
        // If no user is found with that Google ID, check if one exists with the same email
        user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
          // If they exist by email, link their Google ID and save
          user.googleId = profile.id;
          await user.save();
          return done(null, user);
        }

        // If no user is found at all, create a new one
        const newUser = new User({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
        });

        await newUser.save();
        return done(null, newUser);
      }
    } catch (err) {
      return done(err, null);
    }
  }
));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => done(null, await User.findById(id)));

export default passport;