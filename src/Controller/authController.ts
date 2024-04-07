const passport = require("passport");
const localStrategy = require("passport-local");

import { User } from "../Models/User";

passport.use(new localStrategy(async (username: any, password: any, cb: any) => {
    const u: User | null = await User.getUserByUsername(username);
    if (u === null) {
        return cb(null, false);
    }
    if (!u.checkPassword(password)) {
        return cb(null, false);
    }
    return cb(null, u);
}));

passport.serializeUser((user: any, cb: any) => {
    return cb(null, {
        id: user.id,
        username: user.username
    });
});

passport.deserializeUser(async (user: any, cb: any) => {
    const u: User | null = await User.getUserByID(user.id);
    if (u === null) {
        return cb(new Error("User not found"));
    }
    return cb(null, u);
});

module.exports = passport;