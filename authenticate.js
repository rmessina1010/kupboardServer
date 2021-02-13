const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const kupboardModule = require('./models/kupboard');
const KBUser = kupboardModule.KBUser;

exports.local = passport.use(new LocalStrategy(KBUser.authenticate()));
passport.serializeUser(KBUser.serializeUser());
passport.deserializeUser(KBUser.deserializeUser());