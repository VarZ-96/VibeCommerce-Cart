const GoogleStrategy = require('passport-google-oauth20').Strategy;
const passport = require('passport');
const { query } = require('../db/pool'); // Our NeonDB query function
require('dotenv').config({ path: '../.env' });

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      // This is the "verify" callback. It runs after Google confirms the user.
      const { id, displayName, emails } = profile;
      const email = emails[0].value;

      try {
        // 1. Check if user already exists
        let userResult = await query(
          'SELECT * FROM users WHERE google_id = $1',
          [id]
        );

        if (userResult.rows.length > 0) {
          // 2. If user exists, pass them to the next step
          return done(null, userResult.rows[0]);
        } else {
          // 3. If user does NOT exist, create them
          let newUserResult = await query(
            'INSERT INTO users (google_id, email, display_name) VALUES ($1, $2, $3) RETURNING *',
            [id, email, displayName]
          );
          return done(null, newUserResult.rows[0]);
        }
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// These are required by Passport's session-based OAuth flow
passport.serializeUser((user, done) => {
  done(null, user.id); // Store only the user ID in the session
});

passport.deserializeUser(async (id, done) => {
  try {
    const userResult = await query('SELECT * FROM users WHERE id = $1', [id]);
    if (userResult.rows.length > 0) {
      done(null, userResult.rows[0]);
    } else {
      done(new Error('User not found'), null);
    }
  } catch (err) {
    done(err, null);
  }
});