import { Router, Request, Response, NextFunction } from 'express';
import ResponseModel, { ResponseFetcher } from '../../shared/models/ResponseModel';
import SapienServerCom from '../../shared/base-sapien/client/SapienServerCom';
import { AppServer } from '../AppServer';
import RoundChangeLookup from '../../shared/models/RoundChangeLookup';
import SchemaBuilder from '../SchemaBuilder';
import * as mongoose from 'mongoose';
import GameModel from '../../shared/models/GameModel';
import FacilitationRoundResponseMapping from '../../shared/models/FacilitationRoundResponseMapping';
import { monGameModel } from './GameCtrl';
import SubRoundModel from '../../shared/models/SubRoundModel';
import { monSubRoundModel } from './RoundCtrl';
import { monResponseModel } from './GamePlayCtrl';
import TeamModel from '../../shared/models/TeamModel';
import QuestionModel, { ComparisonLabel, RatingType } from '../../shared/models/QuestionModel';
import UserModel, { JobName } from '../../shared/models/UserModel';
import { monTeamModel } from './TeamCtrl';

const schObj = SchemaBuilder.fetchSchema(RoundChangeLookup);
const monRoundChangeLookupSchema = new mongoose.Schema(schObj);
export const monRoundChangeLookupModel = mongoose.model("roundchangelookup", monRoundChangeLookupSchema);

class FacilitationCtrl
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
        
        //console.log("monSchema:", monRoundModel);
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
    
    public async GetRounds(req: Request, res: Response):Promise<any> {
        console.log("CALLING GET ROUNDS");
        
    }

    public async ChangeRound(req: Request, res: Response):Promise<any> {
        const id = req.params.id;
        
        AppServer.LongPoll.publish(SapienServerCom.BASE_REST_URL + "/gameplay/listenforgameadvance/" + id,"hello")
        res.json("yo")
    }

    public async getRoundChangeLookups(req: Request,  res: Response){
        try{
            const lookups = await monRoundChangeLookupModel.find()/*.populate("Round").populate("SubRound")*/.then(lookups => lookups ? lookups.map(l => Object.assign(new RoundChangeLookup(), l.toJSON())) : null);

            if(!lookups) throw new Error();

            res.json(lookups);

        }catch(err){
            res
                .status(500)
                .send("Can't get it")
        }
    }

    public async GetTeamResponsesByRound(req: Request, res: Response){
        
    }

    public async GetTeamsFinished(req: Request, res: Response){
        try{
            let GameId = req.params.gameid;

            let game: GameModel = await monGameModel.findById(GameId).populate("Facilitator")
                                                    .populate({
                                                        path: "Teams",
                                                        populate: {
                                                            path: "Players"
                                                        }
                                                    }).then(g => g ? Object.assign(new GameModel(), g.toJSON()) : null);
            if (!game) throw new Error("Failed to retrieve game");

            let subRound: SubRoundModel = await monSubRoundModel.findOne({Name: game.CurrentRound.ChildRound.toUpperCase()}).populate("Questions").then(sr => sr ? Object.assign(new SubRoundModel(), sr.toJSON()) : null)
            if (!subRound) throw new Error("Failed to retrieve subround");

            let responses: ResponseModel[] = await monResponseModel.find({GameId, SubRoundId: subRound._id}).then(rs => rs ? rs.map(r => Object.assign(new ResponseModel(),r.toJSON())) : null);
            if (!responses) throw new Error("Failed to retrieve responses");

            let mappings: FacilitationRoundResponseMapping[] = [];
                game.Teams.forEach(t => {
                    t = Object.assign(new TeamModel(), t);
                    let teamResponses = responses.filter(r => r.TeamId == t._id.toString())

                    let m = new FacilitationRoundResponseMapping();
                    m.TeamId = t._id;
                    m.TeamName = "Team " + t.Number.toString();
                    m.SubRoundId = subRound._id;
                    m.SubRoundLabel = subRound.Label;
                    m.SubRoundName = subRound.Name;
                                      
                    m.IsComplete = true;
                 
                    
                    if (!game.CurrentRound.ShowRateUsers && !game.CurrentRound.ShowIndividualFeedback){

                        //round 2A is a special case
                        if(game.CurrentRound.ChildRound.toUpperCase() == "DEALSTRUCTURE") {
                            m.Questions = subRound.Questions.filter(q => q.ComparisonLabel && q.ComparisonLabel == ComparisonLabel.QUANTITY)
                        } 
                        else if (game.CurrentRound.ChildRound.toUpperCase() == "TEAMRATING" || game.CurrentRound.ChildRound.toUpperCase() == "DEALRENEWAL") {
                            m.Questions = subRound.Questions.filter(q => q.RatingMarker && q.RatingMarker == RatingType.TEAM_RATING)
                        }
                        else {
                            m.Questions = subRound.Questions;
                        }
                        m.Questions = m.Questions.map(q => {

                            let response = teamResponses.filter(r => r.QuestionId == q._id)

                            let question = Object.assign(new QuestionModel(), q, {
                                Response: response.length && response[0].Answer ? response[0] : null  
                            })

                            if (!question.Response) m.IsComplete = false;
                            
                            return question;

                        });
                        

                        

                    } else {
                        //Lf: whats mgr for if mgr is checked below in t.players iterator? 
                        let mgr: UserModel = t.Players.filter(p => game.CurrentRound.UserJobs[p._id] == JobName.MANAGER)[0];

                        //lf: likewise, why another iteration if mgr status is checked below in t.players loop?

                        let nonManagers = 
                        t.Players.filter(p => !game.CurrentRound.UserJobs[p._id] 
                                            || game.CurrentRound.UserJobs[p._id] != JobName.MANAGER);

                        //check to see if each non-manager player has been rated
                        t.Players.forEach(p => {
                            
                            p = Object.assign(new UserModel(), p);
                            let isManager: boolean = game.CurrentRound.UserJobs[p._id] && game.CurrentRound.UserJobs[p._id] == JobName.MANAGER;

                            if (!isManager) {

                                let filteredRatings = responses.filter(r => r.targetObjId == p._id);

                                let rating = Object.assign(filteredRatings.length ? filteredRatings[0] : new ResponseModel(),{IsComplete: false, targetObjName: p.targetObjName, targetObjId : p._id});

                                rating.IsComplete = filteredRatings.length > 0;

                                rating.targetObjName = p.Name;

                                m.RatingsByManager.push(rating);
                                
                            } 
                            //have all players rated the manager
                          
                        })

                        nonManagers.forEach((u, i) => {
                            let filteredRatings = responses.filter(r => r.UserId == u._id);
                            u = Object.assign(new UserModel(), u);
                            let rating = Object.assign(filteredRatings.length ? filteredRatings[0] : new ResponseModel(), 
                                {IsComplete: filteredRatings.length != 0, targetObjName: u.Name, targetObjId : u._id})
                            m.RatingsOfManager.push(rating);
                            
                        })
                        //Round is only complete if all players have been rated appriopriately.
                        m.IsComplete = m.RatingsByManager.every(r => r.IsComplete) && m.RatingsOfManager.every(r => r.IsComplete);  
                        

                    }   
               
                    //go thru all players and push their data to team view object
                    
                    t.Players.forEach((teamMember, i) => {  

                        teamMember.Job = game.CurrentRound.UserJobs[teamMember._id];
                        m.Members.push(teamMember);
                        
                    });
                
                    m.CurrentRound = game.CurrentRound;

                    mappings.push(m);
                
                });
            

                res.json(mappings);


        }
        catch(err) {    
            res
            .status(500)
            .send("Error")
        }
    }

    public async GoToNext(req: Request, res: Response){
        let limitrecords=10;

        function getRandomArbitrary(min, max) {
          return Math.ceil(Math.random() * (max - min) + min);
        }

    
    
        let random = monRoundChangeLookupModel.count({},(err,count) => {
    
           var skipRecords = getRandomArbitrary(1, count-limitrecords);
    
           monRoundChangeLookupModel.findOne().skip(skipRecords).exec(
            function (err, result) {
              // Tada! random user
              console.log(result) 
            })
    
        });

        
    }

    public routes(){
        this.router.post("/round/:gameid", this.ChangeRound.bind(this));
        this.router.get("/getroundchangelookups", this.getRoundChangeLookups.bind(this))
        this.router.get("/getroundstatus/:gameid", this.GetTeamsFinished.bind(this))

    }
}

export default new FacilitationCtrl().router;