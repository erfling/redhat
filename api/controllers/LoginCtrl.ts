import { JobName } from './../../shared/models/UserModel';
import { Router, Request, Response, NextFunction } from 'express';
import UserModel, { RoleName } from '../../shared/models/UserModel';
import * as Passport from 'passport';
import * as jwt from 'jsonwebtoken';
import { monGameModel, monMappingModel } from './GameCtrl';
import GameModel from '../../shared/models/GameModel';
import { monUserModel } from './UserCtrl';
import TeamModel from '../../shared/models/TeamModel';
import RoundChangeMapping from '../../shared/models/RoundChangeMapping';
import { monRoundModel } from './RoundCtrl';

//this class is exported for use in other routers
export class LoginCtrlClass
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
        const loginInfo = req.body as {Email: string, GamePIN: number};
        console.log("USER", req.body);
        //const dbRoundModel = new monRoundModel(roundToSave); 
        
        //get the game
        try{
            const game: GameModel = await monGameModel.findOne({GamePIN: loginInfo.GamePIN}).populate(
                {
                    path: "Teams",
                }
            ).populate("Facilitator").then(r => Object.assign( new GameModel(), JSON.parse( JSON.stringify( r.toJSON() ) ) ) )

            if (!game) {
                throw("We couldn't find the game you're trying to join. Please try again.")
            }
            console.log(game.Teams);

            var mapping: RoundChangeMapping = await monMappingModel.findOne({ GameId: game._id.toString(), ParentRound: "peopleround", ChildRound: "priorities"}).then(r => r ? Object.assign(new RoundChangeMapping(), r.toJSON()) : Object.assign(new RoundChangeMapping(), { GameId: game._id.toString(), ParentRound: "peopleround", ChildRound: "priorities"}));
            const round = await monRoundModel.findOne({Name: mapping.ParentRound.toUpperCase()}).then(r => r.toJSON())
            let RoundId = round._id;
            console.log("THIS MAPPING WAS FOUND",mapping)
            
            if(!mapping.UserJobs) {
                mapping.GameId = game._id.toString();
                game.HasBeenManager = [];
                mapping.UserJobs = {};
                game.Teams.forEach(t => {
                    console.log("TEAM ", t)
                    let pid = t.Players[0].toString();
                    mapping.UserJobs[pid] = JobName.MANAGER;
                    game.HasBeenManager.push(pid);
                })

                let newMapping: RoundChangeMapping;
                if(!mapping._id){
                    newMapping = await monMappingModel.create(Object.assign(mapping, {ParentRound: "peopleround", ChildRound: "priorities", RoundId})).then(r => r ? Object.assign(new RoundChangeMapping(), r.toJSON()) : null)
                } else {
                    newMapping = await monMappingModel.findOneAndUpdate({ParentRound: "peopleround", ChildRound: "priorities", RoundId}, mapping, {new: true}).then(r => r ? Object.assign(new RoundChangeMapping(), r.toJSON()) : null)
                }
                
                console.log("new MAPPING IS", newMapping)

                if(newMapping){
                    const updatedGame = await monGameModel.findByIdAndUpdate(game._id, {CurrentRound: newMapping, HasBeenManager: game.HasBeenManager});
                }
            }

            //const updatedGame 

            const user:UserModel = await monUserModel.findOne({Email: loginInfo.Email}).then(r => Object.assign(new UserModel(),JSON.parse( JSON.stringify( r.toJSON() ) ) ) );


            if (!user) {
                throw('no user')
            }

            if ((user.Job as any) == "Individual Contributor") user.Job = JobName.IC;

            console.log(user, game.Teams)

            let team: TeamModel;
            if(game.Facilitator.Email == user.Email){
                team = new TeamModel();
                team.GameId = game._id;
                team.Players = [user];
                team._id = game.Teams[0]._id
            } else {
                team = game.Teams.filter(team => {
                    //let team = t.toJSON();
                    console.log(team.Players[3], user._id, typeof team.Players[3], typeof user._id, typeof "butt")
    
                    return team.Players.indexOf(user._id) != -1
                })[0] || null;
            }
            
            console.log("TEAM IS: ", team);

            if (!team) {
                throw("no team");
            }

            const token = jwt.sign(JSON.stringify(user), 'zigwagytywu');

            return res.json({user, token, team});
        }
        catch (err){
            console.log("LoginCtrl ");
            
            console.log(err);
            res
                .status(500)
                .send(err)
        }
    }
    
    public async AdminLogin(req: Request, res: Response):Promise<any> {
        console.log("ADMIN", req.body);

        const user = req.body as UserModel;
        //const dbRoundModel = new monRoundModel(roundToSave); 
        try{
            Passport.authenticate('local', {session: false}, (err, user: UserModel, info) => {
                console.log("ERROR IN AUTH METHOD", err);
                if (err || !user) {
                    return res.status(501).json({
                        message: info ? info.message : 'Login failed',
                        user   : user
                    });
                }
        
                req.login(user, {session: false}, async (err) => {
                    console.log("USER AS PASSED FROM AUTH:", user)
                    if (err) {
                        res.send(err);
                    }

                    if(user.Role != RoleName.ADMIN){
                        res.send("You aren't authorized to do that")
                    }
                    
                    const token = jwt.sign(JSON.stringify(user), 'zigwagytywu');
        
                    return res.json({user, token, team: new TeamModel()});
                });
            })(req, res);
        }
        catch (error){
            console.log(error);
            res.send("couldn't login")
        }
    }



    public routes(){
        //this.router.all("*", cors());
        this.router.get("/", this.Login.bind(this));
        this.router.post("/", this.Login.bind(this))
        this.router.post("/admin", this.AdminLogin.bind(this))
    }
}

//this is exported along with the above class so that the above can be used in other routers
const LoginCtrl = new LoginCtrlClass().router
export default LoginCtrl;