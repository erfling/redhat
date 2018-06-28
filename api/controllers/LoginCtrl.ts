import { Router, Request, Response, NextFunction } from 'express';
import * as mongoose from 'mongoose';
import UserModel from '../../shared/models/UserModel';
import BaseModel from '../../shared/base-sapien/models/BaseModel';
import SchemaBuilder from '../SchemaBuilder';
import * as Passport from 'passport'
import * as PassportJWT from 'passport-jwt';
import * as LocalStrategy from 'passport-local';
import * as jwt from 'jsonwebtoken';
import { monTeamModel } from './TeamCtrl'
import { monGameModel } from './GameCtrl';

class LoginCtrl
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
    
    public async Login(req: Request, res: Response):Promise<any> {
        const user = req.body as UserModel;
        console.log("USER", req.body);
        //const dbRoundModel = new monRoundModel(roundToSave); 
        
        
        try{
            Passport.authenticate('local', {session: false}, (err, user: UserModel, info) => {
                console.log("ERROR IN AUTH METHOD", err);
                if (err || !user) {
                    return res.status(401).json({
                        message: info ? info.message : 'Login failed',
                        user   : user
                    });
                }
        
                req.login(user, {session: false}, (err) => {
                    console.log("USER AS PASSED FROM AUTH:", user)
                    if (err) {
                        res.send(err);
                    }
                    console.log(user);
                    const token = jwt.sign(JSON.parse(JSON.stringify(user)), 'zigwagytywu');
        
                    return res.json({user, token});
                });
            })(req, res);
        }
        catch{

        }
    }
    
    public async AdminLogin(req: Request, res: Response):Promise<any> {
        const user = req.body as UserModel;
        console.log("USER", req.body);
        //const dbRoundModel = new monRoundModel(roundToSave); 
        
        
        try{
            Passport.authenticate('local', {session: false}, (err, user: UserModel, info) => {
                console.log("ERROR IN AUTH METHOD", err);
                if (err || !user) {
                    return res.status(401).json({
                        message: info ? info.message : 'Login failed',
                        user   : user
                    });
                }
        
                req.login(user, {session: false}, async (err) => {
                    console.log("USER AS PASSED FROM AUTH:", user)
                    if (err) {
                        res.send(err);
                    }
                    console.log(user);
                    const token = jwt.sign(JSON.stringify(user), 'zigwagytywu');

                    //get our test team for the admin user
                    var team = await monTeamModel.findOne({Name: "TEST"});

                    //make the admin team
                    if(!team){
                        const testGame = await monGameModel.findOne({Location: "TEST_GAME"})
                        team = await monTeamModel.create({Name: "TEST", GameId: testGame._id});
                    }

        
                    return res.json({user, token, team});
                });
            })(req, res);
        }
        catch{

        }
    }



    public routes(){
        //this.router.all("*", cors());
        this.router.get("/", this.Login.bind(this));
        this.router.post("/", this.Login.bind(this))
        this.router.post("/admin", this.AdminLogin.bind(this))
    }
}

export default new LoginCtrl().router;