import { Router, Request, Response, NextFunction } from 'express';
import UserModel, { RoleName } from '../../shared/models/UserModel';
import * as Passport from 'passport';
import * as jwt from 'jsonwebtoken';
import { monTeamModel } from './TeamCtrl'
import { monGameModel } from './GameCtrl';
import GameModel from '../../shared/models/GameModel';
import { monUserModel } from './UserCtrl';
import TeamModel from '../../shared/models/TeamModel';

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
    
    public async    Login(req: Request, res: Response):Promise<any> {
        const loginInfo = req.body as {Email: string, GamePIN: number};
        console.log("USER", req.body);
        //const dbRoundModel = new monRoundModel(roundToSave); 
        
        //get the game

        
        try{
            const game: GameModel = await monGameModel.findOne({GamePIN: loginInfo.GamePIN}).populate(
                {
                    path: "Teams",
                }
            ).then(r => Object.assign( new GameModel(), JSON.parse( JSON.stringify( r.toJSON() ) ) ) )

            if(!game){
                throw("We couldn't find the game you're trying to join. Please try again.")
            }
    
            console.log(game.Teams);

            const user:UserModel = await monUserModel.findOne({Email: loginInfo.Email}).then(r => Object.assign(new UserModel(),JSON.parse( JSON.stringify( r.toJSON() ) ) ) );

            if(!user){
                throw('no user')
            }
            console.log(user, game.Teams)

            const team: TeamModel = game.Teams.filter(team => {
                //let team = t.toJSON();
                console.log(team.Players[3], user._id, typeof team.Players[3], typeof user._id, typeof "butt")

                return team.Players.indexOf(user._id) != -1
            })[0] || null;
            console.log("TEAM IS: ", team)

            

            if(!team){
                throw("no team");
            }

            const token = jwt.sign(JSON.stringify(user), 'zigwagytywu');

            return res.json({user, token, team});
            
        }
        catch (err){
            res
                .status(500)
                .send(err)
        }
    }
    
    public async AdminLogin(req: Request, res: Response):Promise<any> {
        console.log("USER", req.body);

        const user = req.body as UserModel;
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

                    if(user.Role != RoleName.ADMIN){
                        res.send("You aren't authorized to do that")
                    }
                    
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