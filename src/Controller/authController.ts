import { PassportStatic } from "passport";
import { User } from "../Models/User";
import { FlashMessageType } from "./FlashMessageType";

const passport: PassportStatic = require("passport");
const localStrategy = require("passport-local");

passport.use(new localStrategy({
    passReqToCallback: true,    
}, async (req: any, email: any, password: any, cb: any) => {
    const u: User | null = (await User.findAll({
        where: {
            email: email
        }
    }))[0];
    if (u == null || !u.checkPassword(password)) {
        req.flash(FlashMessageType.DANGER, "Username or password incorrect!");
        return cb(null, false);
    }
    if (!u.active) {
        req.flash(FlashMessageType.DANGER, "Account disabled! Please contact an administrator for further assistance.");
        return cb(null, false);
    }
    req.flash(FlashMessageType.SUCCESS, "Login Successful!")
    return cb(null, u);
}));

passport.serializeUser((user: any, cb: any) => {
    return cb(null, {
        id: user.id,
        username: user.username
    });
});

passport.deserializeUser(async (user: any, cb: any) => {
    const u: User | null = (await User.findAll({
        where: {
            id: user.id
        }
    }))[0];
    if (u === null) {
        return cb(new Error("User not found"));
    }
    return cb(null, u);
});

module.exports = passport;