import { Router, Request, Response, NextFunction } from 'express';
import * as mongoose from 'mongoose';
import UserModel, { RoleName } from '../../shared/models/UserModel';
import BaseModel from '../../shared/base-sapien/models/BaseModel';
import SchemaBuilder from '../SchemaBuilder';
import Auth, {PERMISSION_LEVELS} from '../AuthUtils'; 
import { plainToClass } from 'class-transformer';
import EmailCtrl from './EmailCtrl';

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
        console.log(userToSave)

        //const dbRoundModel = new monRoundModel(roundToSave); 
        
        try{
           
            const savedUser = await monUserModel.create( userToSave ).then(r => r);
            //issue temporary token
            //const user = plainToClass(UserModel, savedUser);
            var token = Auth.ISSUE_NEW_USER_JWT(savedUser.toObject())

            EmailCtrl.SEND_EMAIL((savedUser.toObject() as UserModel).Email, token)


            console.log(savedUser);
            
            res.json(savedUser);
        }
        catch{

        }
    }


    public routes(){

        this.router.get("/", 
            (req, res, next) => Auth.IS_USER_AUTHORIZED(req, res, next, PERMISSION_LEVELS.FACILITATOR),
            this.GetUsers.bind(this)
        );

        this.router.get("/:id",
            (req, res, next) => Auth.IS_USER_AUTHORIZED(req, res, next, PERMISSION_LEVELS.PLAYER), 
            this.GetUser.bind(this)
        );

        this.router.post("/", 
            (req, res, next) => Auth.IS_USER_AUTHORIZED(req, res, next, PERMISSION_LEVELS.ADMIN), 
            this.SaveUser.bind(this)
        );

        this.router.post("/newuser", 
            //(req, res, next) => Auth.IS_USER_AUTHORIZED(req, res, next, PERMISSION_LEVELS.ADMIN), 
            this.AddNewUser.bind(this)
        );
        
    }
}

export default new RoundRouter().router;