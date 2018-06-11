import { Router, Request, Response, NextFunction } from 'express';
import * as mongoose from 'mongoose';
import UserModel, { RoleName } from '../../shared/models/UserModel';
import BaseModel from '../../shared/base-sapien/models/BaseModel';
import SchemaBuilder from '../SchemaBuilder';
import Auth, {PERMISSION_LEVELS} from '../AuthUtils'; 
import { plainToClass } from 'class-transformer';
import EmailCtrl from './EmailCtrl';
import * as Passport from 'passport'

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


const monSchema = new mongoose.Schema(schObj);
console.log("USER SCHEMA INIT:",  schObj)


export const monUserModel = mongoose.model("user", monSchema);

class RoundRouter
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
        
        try{
            if(!userToSave.Email || !userToSave.Email.length || !userToSave._id) {
                console.log("HERE")
                var savedRound = await monUserModel.create(userToSave);
            } else {
                var savedUser = await monUserModel.findOneAndUpdate({Email: userToSave.Email}, userToSave, {new: true})
                console.log(savedUser);
            }
            res.json(savedUser);
        }
        catch{

        }
    }

    public async AddNewUser(req: Request, res: Response):Promise<any> {
        const userToSave = req.body as UserModel;
        //const dbRoundModel = new monRoundModel(roundToSave); 
        
        try{
           
            const savedUser = await monUserModel.create( userToSave ).then(r => r.toObject());
            //issue temporary token

            //const user = plainToClass(UserModel, savedUser);
            console.log(savedUser);
            var token = Auth.ISSUE_NEW_USER_JWT(savedUser)
            EmailCtrl.SEND_EMAIL((savedUser as UserModel), token)
            
            res.json(savedUser);
        }
        catch{

        }
    }

    public async GetNewUser(req: Request, res: Response):Promise<any> {
        console.log("HEY WE CALLED GET NEW USER", req);
        if(req.user){
            res.json(req.user)
        } else {
            res.json("NO USER FOUND")
        }
    }

    public async SetNewUserPassword(req: Request, res: Response):Promise<any> {
        const id = req.user._id;
        try{
            console.log(req.body.Password, Auth.HASH_PASSWORD(req.body.Password))
            const newPW = Auth.HASH_PASSWORD(req.body.Password);
            const savedUser = monUserModel.findByIdAndUpdate(id.toString(), {Password: newPW}).then(r => r);
            res.json(savedUser);
        }catch{
            res.json("password not updated")
        }
    }

    public routes(){

        this.router.get("/", 
            (req, res, next) => Auth.IS_USER_AUTHORIZED(req, res, next, PERMISSION_LEVELS.FACILITATOR),
            this.GetUsers.bind(this)
        );

        

        this.router.post("/", 
            (req, res, next) => Auth.IS_USER_AUTHORIZED(req, res, next, PERMISSION_LEVELS.ADMIN), 
            this.SaveUser.bind(this)
        );

        this.router.post("/newuser", 
            //(req, res, next) => Auth.IS_USER_AUTHORIZED(req, res, next, PERMISSION_LEVELS.ADMIN), 
            this.AddNewUser.bind(this)
        );

        this.router.post("/usersetpassword", 
            Passport.authenticate('jwt', {session: false}),
            //(req, res, next) => Auth.IS_USER_AUTHORIZED(req, res, next, PERMISSION_LEVELS.ADMIN), 
            this.SetNewUserPassword.bind(this)
        );

        this.router.get("/startfirstlogin", 
            Passport.authenticate('jwt', {session: false}),
            //(req, res, next) => Auth.IS_USER_AUTHORIZED(req, res, next, PERMISSION_LEVELS.ADMIN), 
            this.GetNewUser.bind(this)
        );

        this.router.get("/:id",
            (req, res, next) => Auth.IS_USER_AUTHORIZED(req, res, next, PERMISSION_LEVELS.PLAYER), 
            this.GetUser.bind(this)
        );
        
    }
}

export default new RoundRouter().router;