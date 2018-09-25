import { Router, Request, Response, NextFunction } from 'express';
import * as mongoose from 'mongoose';
import UserModel, { RoleName } from '../../shared/models/UserModel';
import SignupToken from '../../shared/models/SignupToken';
import SchemaBuilder from '../SchemaBuilder';
import Auth, {PERMISSION_LEVELS} from '../AuthUtils'; 
import EmailCtrl from './EmailCtrl';
import * as Passport from 'passport'
import { LoginCtrlClass } from './LoginCtrl'
import { RequestHandler } from 'express-serve-static-core';

const schObj = SchemaBuilder.fetchSchema(UserModel);

/****************************************
 * 
 * 
 * 
 * IMPORTANT!!!!!! EXCLUDE PASSWORD AT SCHEMA LEVEL FROM BEING RETUNRED TO CLIENT
 * 
 * 
 * 
 ***************************************/
schObj.Password = { type: String, select: false }
schObj.PasswordRequestDate = { type: String, select: false }

//emails must be unique, and we lowercase all of them
schObj.Email = { type: String, lowercase: true, unique: true }

const monSchema = new mongoose.Schema(schObj);
export const monUserModel = mongoose.model("user", monSchema);

const tokenSchObj = SchemaBuilder.fetchSchema(SignupToken);
tokenSchObj.IsUsed = { type: Boolean, select: false}
tokenSchObj.UserId = { type: String, lowercase: true, unique: true }

const monTokenSchema = new mongoose.Schema(tokenSchObj);
export const monTokenModel = mongoose.model("token", monTokenSchema);

class UserRouter
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    public router: Router;
    public GameModel: any;
    
    //----------------------------------------------------------------------
    //
    //  Constructor
    //
    //----------------------------------------------------------------------

    constructor() {
        this.router = Router({mergeParams:true});
        this.routes();        
    }

    //----------------------------------------------------------------------
    //
    //  Event Handlers
    //
    //----------------------------------------------------------------------


    
    //----------------------------------------------------------------------
    //
    //  Methods
    //
    //----------------------------------------------------------------------
    
    public async GetUsers(req: Request, res: Response):Promise<any> {
        console.log("CALLING GET ROUNDS");
        
        try {
            let rounds = await monUserModel.find();
            if (!rounds) {
                return res.status(400).json({ error: 'No games' });
            } else {
                const status = res.status;
                return res.json( rounds );
            }
        } catch(err) {
            console.log("ERROR", err);
            ( err: any ) => res.status(500).json({ error: err });
        }
        
    }

    public async GetUser(req: Request, res: Response):Promise<any> {
        
        const ID = req.params.id;
        console.log("TRYING TO GET ROUND WITH NAME: ", ID);
        try {
            let user = await monUserModel.findById(ID).then((u) => u);
            if (!user) {
              res.status(400).json({ error: 'No round' });
            } else {
              res.json(user);
            }
        } catch(err) {
            ( err: any ) => res.status(500).json({ error: err });
        }
        
    }

    public async SaveUser(req: Request, res: Response):Promise<any> {
        const userToSave = req.body as UserModel;
        //const dbRoundModel = new monRoundModel(roundToSave); 
        console.log("SVING")
        try{
            if(!userToSave.Email || !userToSave.Email.length || !userToSave._id) {
                var savedUser = await monUserModel.create(userToSave).then(r => r.toJSON() as UserModel);
                if (!savedUser) throw new Error("no user");
                console.log(savedUser)
                //invite new user to create admin password
                if(savedUser.Role == RoleName.ADMIN){
                    let token = Auth.ISSUE_NEW_USER_JWT(savedUser);

                    let savedToken = await monTokenModel.findOneAndUpdate({UserId: savedUser._id}, {Token: token, IsUsed: false}, {new: true, upsert: true}).then(t => t ? t.toJSON() as SignupToken : null);
                    if(!savedToken) throw new Error("token not created");
                    EmailCtrl.SEND_EMAIL((savedUser), token);
                }

            } else {
                var savedUser = await monUserModel.findByIdAndUpdate(userToSave._id, userToSave, {new: true}).then(r => r.toObject() as UserModel);
                if (!savedUser) throw new Error("no user on update");
                console.log("update",savedUser)

                //invite user who's role has changed to ADMIN to create admin password
                if( savedUser.Role == RoleName.ADMIN && userToSave.RoleChanged ){
                    var token = Auth.ISSUE_NEW_USER_JWT(savedUser)
                    let savedToken = await monTokenModel.findOneAndUpdate({UserId: savedUser._id}, {Token: token, IsUsed: false}, {new: true, upsert: true}).then(t => t ? t.toJSON() as SignupToken : null);
                    if(!savedToken) throw new Error("token not created");
                    EmailCtrl.SEND_EMAIL((savedUser), token);
                }
            }

            res.json(savedUser);
        }
        catch (err) {
            console.log(err)

            if ("message" in err && err["message"].toLowerCase().indexOf("duplicate") != -1) {
                res.status(500).send("DUPLICATE_EMAIL") 
            } else res.status(500).send("error saving user");
        }
    }

    public async AddNewUser(userToSave: UserModel):Promise<any> {
        //const dbRoundModel = new monRoundModel(roundToSave); 
        
        try{
           
            const savedUser = await monUserModel.create( userToSave ).then(r => r.toObject());
            //issue temporary token

            //const user = plainToClass(UserModel, savedUser);
            console.log(savedUser);
            var token = Auth.ISSUE_NEW_USER_JWT(savedUser)
            EmailCtrl.SEND_EMAIL((savedUser as UserModel), token)
            return savedUser;
        }
        catch{

        }
    }

    public async GetNewUser(req: Request, res: Response):Promise<any> {
        console.log("HEY WE CALLED GET NEW USER", req.body);
        if(req){
            res.json(req.user)
        } else {
            res.json("NO USER FOUND, yo")
        }
    }

    public async SetNewUserPassword(req: Request, res: Response, next: RequestHandler):Promise<any> {

        console.log("USER SETTING PWORD::::::::::", req.body, req.user);

        const id = req.user._id;
        try{

            //get the saved token, assure it's not been used
            let token = await monTokenModel.findOne({UserId: id}).select("+IsUsed").then(t => t ? Object.assign(new SignupToken, t.toJSON()) : null);
            if (!token) throw new Error("no token found");
            
            if (token.IsUsed) throw new Error("token expired");

            let updatedToken = await monTokenModel.findOneAndUpdate({UserId: id}, {IsUsed: true}, {new: true}).select("+IsUsed").then(t => t ? Object.assign(new SignupToken, t.toJSON()) : null);

            console.log(updatedToken)
            if (!updatedToken || !updatedToken.IsUsed) throw new Error("Token not updated")
            
            console.log(req.body.Password, Auth.HASH_PASSWORD(req.body.Password))
            const newPW = Auth.HASH_PASSWORD(req.body.Password);
            const savedUser = await monUserModel.findByIdAndUpdate(id.toString(), {Password: newPW}).then(r => r);
            req.url = "/admin";
            req = Object.assign(req, 
                {
                    body: Object.assign(savedUser, {Password: req.body.Password})
                }
            )

            if (!newPW) throw new Error("password error");
            if (!savedUser) throw new Error("user not updated");

            new LoginCtrlClass().AdminLogin(req, res);

        }
        catch (err) {
            console.log(err);
            res.status(500).json("password not updated")
        }
    }

    public async DeleteUser(req: Request, res: Response):Promise<any> {
        const id = req.params.userID;
        console.log("trying to delete user with ID: ", id)
        try{
            const savedUser = monUserModel.findByIdAndRemove(id).then(r => r);
            res.json("user successfully removed");
        }catch{
            res.json("user not removed")
        }
    }


    public async RequestReset(req: Request, res: Response){
        const userToSave = req.body as UserModel;
        //const dbRoundModel = new monRoundModel(roundToSave); 
        
        try{
           
            var savedUser = await monUserModel.findOne({Email: userToSave.Email}).then(r => r.toObject() as UserModel);
            if(!savedUser) throw new Error("no user")
            //invite user who's role has changed to ADMIN to create admin password
            if( savedUser.Role == RoleName.ADMIN ){
                var token = Auth.ISSUE_NEW_USER_JWT(savedUser)
                let savedToken = await monTokenModel.findOneAndUpdate({UserId: savedUser._id}, { Token: token, IsUsed: false }, {new: true, upsert: true}).then(t => t ? t.toJSON() as SignupToken : null);
                if (!savedToken) throw new Error("no token")
                EmailCtrl.SEND_EMAIL((savedUser), token, true);
            } else {
                throw new Error("not an admin")
            }
            
            res.json(savedUser);
        }
        catch(err){
            console.log(err)
            res.status(500).send("error")
        }
    }

    public routes(){

        this.router.get("/", 
            Passport.authenticate('jwt', {session: false}),
            (req, res, next) => Auth.IS_USER_AUTHORIZED(req, res, next, PERMISSION_LEVELS.ADMIN),
            this.GetUsers.bind(this)
        );

        this.router.post("/", 
            Passport.authenticate('jwt', {session: false}),
            (req, res, next) => Auth.IS_USER_AUTHORIZED(req, res, next, PERMISSION_LEVELS.ADMIN), 
            this.SaveUser.bind(this)
        );

        this.router.delete("/:userID",
            Passport.authenticate('jwt', {session: false}),
            (req, res, next) => Auth.IS_USER_AUTHORIZED(req, res, next, PERMISSION_LEVELS.ADMIN), 
            this.DeleteUser.bind(this)
        );

        this.router.post("/newuser", 
            Passport.authenticate('jwt', {session: false}),
            (req, res, next) => Auth.IS_USER_AUTHORIZED(req, res, next, PERMISSION_LEVELS.ADMIN), 
            this.AddNewUser.bind(this)
        );

        this.router.use("/usersetpassword/:email", 
            Passport.authenticate('jwt', {session: false}),
            //(req, res, next) => Auth.IS_USER_AUTHORIZED(req, res, next, PERMISSION_LEVELS.ADMIN), 
            this.SetNewUserPassword.bind(this)
        );

        this.router.get("/startfirstlogin", 
            Passport.authenticate('jwt', {session: false}),
            //(req, res, next) => Auth.IS_USER_AUTHORIZED(req, res, next, PERMISSION_LEVELS.ADMIN), 
            this.GetNewUser.bind(this)
        );

        this.router.post("/reset", 
            //(req, res, next) => Auth.IS_USER_AUTHORIZED(req, res, next, PERMISSION_LEVELS.ADMIN), 
            this.RequestReset.bind(this)
        );

        this.router.get("/:id",
            (req, res, next) => Auth.IS_USER_AUTHORIZED(req, res, next, PERMISSION_LEVELS.PLAYER), 
            this.GetUser.bind(this)
        );
        
    }
}

export default new UserRouter().router;