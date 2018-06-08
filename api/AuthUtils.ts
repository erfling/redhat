import * as Passport from 'passport'
import * as PassportJWT from 'passport-jwt';
import * as PassportLocal from 'passport-local';
import * as jwt from 'jsonwebtoken';
import { monUserModel } from './controllers/UserCtrl'
import * as bcrypt from 'bcrypt';
import UserModel, { RoleName } from '../shared/models/UserModel';
import { plainToClass, plainToClassFromExist, classToPlain } from 'class-transformer';
import { INSPECT_MAX_BYTES } from 'buffer';
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
                const resp = await monUserModel.findOne({ Email: "matt@sapienexperience.com" }).select("+Password");              
                let instance = JSON.parse(JSON.stringify(resp.toJSON()));
                console.log("USER IN AUTH METHOD: ", instance)

                const user = plainToClass( UserModel, instance as UserModel );

                console.log(typeof user, " | ", user.Name);
                console.log(user);
                console.log("USER after conversion in AUTH METHOD: ", user)
                delete user.Password;

                done(null, user);
                /*
                if (!user || !this.IS_VALID_PASSWORD(password, user)) {
                    done(null, false, { message: "Invalid username/password" });
                } else {
                    //remove the password from the user object so that there's no chance it gets sent back to the client
                    delete user.Password;

                    done(null, user);
                }
                */
            }
            catch (err) {
                done(null, err, { message: "Invalid username/password" });
            }

        }))



        Passport.use(new PassportJWT.Strategy({
                jwtFromRequest: PassportJWT.ExtractJwt.fromAuthHeaderAsBearerToken(),
                secretOrKey: 'ziwagytywu'
            },
            async (jwtPayload, done) => {
                try {
                    const resp = await monUserModel.findOne({ Email: jwtPayload.id });
                    const user = plainToClass(UserModel, resp.toJSON() as UserModel);
                    if (user) return done(null, user);
                    return new Error();
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
        var token = jwt.sign(newUser.Email, "ziwagytywu")
        return token;
    }


}



