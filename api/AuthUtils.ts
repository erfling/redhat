import * as Passport from 'passport'
import * as PassportJWT from 'passport-jwt';
import * as PassportLocal from 'passport-local';
import * as jwt from 'jsonwebtoken';
import { monUserModel } from './controllers/UserCtrl'
import * as bcrypt from 'bcrypt';
import UserModel, { RoleName } from '../shared/models/UserModel';
import { NextFunction } from 'express';

const LocagStrategy = PassportLocal.Strategy;

export const PERMISSION_LEVELS: {[index: string]: RoleName[] } = {
    ADMIN: [RoleName.ADMIN],
    FACILITATOR: [RoleName.ADMIN, RoleName.FACILITATOR],
    PLAYER: [RoleName.ADMIN, RoleName.FACILITATOR, RoleName.PLAYER]
}

export default abstract class AuthUtils {

    public static SET_UP_PASSPORT(): void {

        //Set up local strategy and check entered data against users collection for valid email and passwords 
        Passport.use(new LocagStrategy(
            {
                usernameField: 'Email',
                passwordField: 'Password'
            }, 
            async (Email: string, password: string, done) => {
            console.log(Email, password, "hello?")
            try {
                //include password for comparison
                const resp = await monUserModel.findOne({ Email }).select("+Password").then(r => r);              
                const user = resp != null ? resp.toJSON() as UserModel : null;

                console.log(typeof user, " | ", user.Name);
                console.log(user);
                console.log("USER after conversion in AUTH METHOD: ", user)
                
                if (!user || !user.Email || !this.IS_VALID_PASSWORD(password, user)) {
                    done(new Error("No user found"), false, { message: "Invalid username/password" });
                } else {
                    //remove the password from the user object so that there's no chance it gets sent back to the client
                    delete user.Password;
                    done(null, user);
                }
                
            }
            catch (err) {
                done(err, null, { message: "Invalid username/password" });
            }

        }))



        Passport.use(new PassportJWT.Strategy({
                jwtFromRequest: PassportJWT.ExtractJwt.fromAuthHeaderAsBearerToken(),
                secretOrKey: 'zigwagytywu',                
            },
            async (jwtPayload, done) => {
                console.log("FOUND jwtPayload: ", jwtPayload);
                try {
                    const resp = await monUserModel.findById(jwtPayload).then(r => r.toJSON() as UserModel);
                    if (resp) return done(null, resp);
                    return done("No User Found");
                }
                catch (err) {
                    return done(err);
                }
            }
        ));

    }

    public static HASH_PASSWORD(inputPassword: string): string {
        return bcrypt.hashSync(inputPassword, 16);
    }

    public static IS_VALID_PASSWORD(inputPassword: string, user: UserModel): boolean {
        console.log(inputPassword, user.Password);
        return bcrypt.compareSync(inputPassword, user.Password);
    }

    /**
     * Determine whether current user has permission to access a given endpoint. Called as middleware on enpoints
     * @param user 
     * @param permittedRoles Defaults to lowest permission level
     */
    public static IS_USER_AUTHORIZED ( req: any, res:any, next: NextFunction,  permittedRoles: RoleName[] = [RoleName.PLAYER] ): void {
        console.log("REQUEST IN MIDDLEWARE:", permittedRoles);
        if(!req.user)req.user = {Role: RoleName.PLAYER}
        if(permittedRoles.indexOf( req.user.Role ) != -1) {
            next();
        } else {
            res.send("Unauthorized")
        }

    }

    public static ISSUE_NEW_USER_JWT(newUser: UserModel): any {
        console.log(newUser);
        var token = jwt.sign(newUser._id.toString(), "zigwagytywu")
        return token;
    }


}



