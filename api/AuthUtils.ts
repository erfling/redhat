import * as Passport from 'passport'
import * as PassportJWT from 'passport-jwt';
import * as PassportLocal from 'passport-local';
import * as jwt from 'jsonwebtoken';
import { monUserModel } from './controllers/UserCtrl'
import * as bcrypt from 'bcrypt';
import UserModel from '../shared/models/UserModel';
import { plainToClass } from 'class-transformer';

const LocagStrategy = PassportLocal.Strategy;

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
                const resp = await monUserModel.findOne({ Email });              

                const user = plainToClass(UserModel, (resp.toJSON() as UserModel) || {Email: 'test@butt.butt', Name: "Joe Butt"});
                done(null, {Email: 'test@butt.butt', Name: "Joe Butt"});
                /*
                if (!user || !this.IS_VALID_PASSWORD(password, user)) {
                    done(null, false, { message: "Invalid username/password" });
                } else {
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


}



