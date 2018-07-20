import { Router, Request, Response, NextFunction } from 'express';
import * as mongoose from 'mongoose';
import RoundModel from '../../shared/models/RoundModel';
import SchemaBuilder from '../SchemaBuilder';
import SubRoundModel from '../../shared/models/SubRoundModel';
import MessageModel from '../../shared/models/MessageModel';
import UserModel, { JobName } from '../../shared/models/UserModel';
import AuthUtils, { PERMISSION_LEVELS } from '../AuthUtils';

const messageSchObj = SchemaBuilder.fetchSchema(MessageModel);
const monMessageSchema = new mongoose.Schema(messageSchObj);
export const monMessageModel = mongoose.model("message", monMessageSchema);


const schObj = SchemaBuilder.fetchSchema(RoundModel);
schObj.SubRounds = [{ type: mongoose.Schema.Types.ObjectId, ref: "subround" }];

//consider leaving content off default queries
//schObj.Content = { type: String, select: false }

const monSchema = new mongoose.Schema(schObj);
export const monRoundModel = mongoose.model("round", monSchema);

const qSchObj = SchemaBuilder.fetchSchema(SubRoundModel);
const qSubSchema = new mongoose.Schema(qSchObj);
export const monQModel = mongoose.model("question", qSubSchema);

const subSchObj = SchemaBuilder.fetchSchema(SubRoundModel);
subSchObj.Questions = [{ type: mongoose.Schema.Types.ObjectId, ref: "question" }];
subSchObj.LeaderMessages = [{ type: mongoose.Schema.Types.ObjectId, ref: "message" }];
subSchObj.ICMessages = [{ type: mongoose.Schema.Types.ObjectId, ref: "message" }];
subSchObj.ChipCoMessages = [{ type: mongoose.Schema.Types.ObjectId, ref: "message" }];
subSchObj.IntegratedSystemsMessages = [{ type: mongoose.Schema.Types.ObjectId, ref: "message" }];

const monSubSchema = new mongoose.Schema(subSchObj);

export const monSubRoundModel = mongoose.model("subround", monSubSchema);


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
        
        try {
            let rounds = await monRoundModel.find();
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

    public async GetRound(req: Request, res: Response):Promise<any> {
        
        const ID = req.params.round;
        console.log("TRYING TO GET ROUND WITH NAME: ", ID);
        try {
            let round = await monRoundModel.findOne({Name: ID});
            if (!round) {
              res.status(400).json({ error: 'No round' });
            } else {
              res.json(round);
            }
        } catch(err) {
            ( err: any ) => res.status(500).json({ error: err });
        }
        
    }

    public async GetSubRound(req: Request, res: Response):Promise<any> {
        
        const ID = req.params.subround;
        const job = this._getMessageProp(req.params.job);
        console.log("TRYING TO GET ROUND WITH NAME: ", ID);
        try {
            let round = await monSubRoundModel.findOne({Name: ID}).populate("Questions").populate(job);
            if (!round) {
              res.status(400).json({ error: 'No round' });
            } else {
              res.json(round);
            }
        } catch(err) {
            ( err: any ) => res.status(500).json({ error: err });
        }
        
    }

    public async SaveRound(req: Request, res: Response):Promise<any> {
        const roundToSave = req.body as RoundModel;
        console.log(roundToSave, roundToSave.Name, roundToSave.Name.length);

        try{
            if(!roundToSave.Name || !roundToSave.Name.length || !roundToSave._id) {
                console.log("HERE")
                var savedRound = await monRoundModel.create(roundToSave);
            } else {
                var savedRound = await monRoundModel.findOneAndUpdate({Name: roundToSave.Name}, roundToSave, {new: true})
                console.log(savedRound);
            }
            res.json(savedRound);
        }
        catch{

        }
    }

    public async SaveMessage(req: Request, res: Response):Promise<any>{
        const message = req.body as MessageModel;

        try{
            if(!message._id) {
                console.log("HERE")
                var savedMessage = await monMessageModel.create(message);
            } else {
                var savedMessage = await monMessageModel.findByIdAndUpdate(message._id, message, {new: true})
            }
            res.json(savedMessage);

            //do we need to update a SubRound?
            /*const sr = await monSubRoundModel.findById(message.RoundId).then(r => r ? Object.assign(new SubRoundModel, r) : null);

            if(sr){
                const prop = this._getMessageProp(message.Job);
                if(prop && sr[prop]){
                    sr[prop] = sr[prop].filter(id => id != message._id).concat(message._id);
                    req.body = sr;
                    await this.SaveSubRound(req, res);
                }
            }*/

        }
        catch{

        }



    }


    public async SaveSubRound(req: Request, res: Response):Promise<any> {
        const subRoundToSave = req.body as SubRoundModel;
        console.log(subRoundToSave, subRoundToSave.Name, subRoundToSave.Name.length);

        //const dbRoundModel = new monRoundModel(roundToSave); 
        
        try{
            if(!subRoundToSave.Name || !subRoundToSave.Name.length || !subRoundToSave._id) {
                console.log("HERE")
                var savedRound = await monSubRoundModel.create(subRoundToSave).then(r => r.toObject() as SubRoundModel);
            } else {
                var savedRound = await monSubRoundModel.findOneAndUpdate({Name: subRoundToSave.Name}, subRoundToSave, {new: true}).then(r => r.toObject() as SubRoundModel);
                console.log(savedRound);
            }

            //Make sure parent round contains subround
            const parentRound = await monRoundModel.findById(savedRound.RoundId).then(r => r.toObject() as RoundModel);
            if(parentRound && parentRound.SubRounds.indexOf(savedRound._id)){
                parentRound.SubRounds.push(savedRound._id);
                console.log(monRoundModel)
                const saveParentRound = await monRoundModel.findByIdAndUpdate(savedRound.RoundId, parentRound)
            }

            res.json(savedRound);
        }
        catch{
            res.send("couldn't save the round")
        }
    }

    private _getMessageProp(job: JobName): keyof UserModel {
        switch(job){
            case JobName.MANAGER:
                return 'LeaderMessages'
            case JobName.CHIPCO:
                return 'ChipCoMessages'
            case JobName.INTEGRATED_SYSTEMS:
                return 'IntegratedSystemsMessages'
            default:
                return 'ICMessages'
        }
    }

    public routes(){
        //this.router.all("*", cors());
        this.router.get("/", this.GetRounds.bind(this));
        this.router.get("/:round", this.GetRound.bind(this));
        this.router.get("/subround/:subround/:job", this.GetSubRound.bind(this));
        this.router.post("/",    
            (req, res, next) => AuthUtils.IS_USER_AUTHORIZED(req, res, next, PERMISSION_LEVELS.PLAYER), 
            this.SaveRound.bind(this)
        );
        this.router.post("/subround", 
            (req, res, next) => AuthUtils.IS_USER_AUTHORIZED(req, res, next, PERMISSION_LEVELS.PLAYER), 
            this.SaveSubRound.bind(this)
        );
        this.router.post("/message",            
            (req, res, next) => AuthUtils.IS_USER_AUTHORIZED(req, res, next, PERMISSION_LEVELS.PLAYER), 
            this.SaveMessage.bind(this)
        );
    }
}

export default new RoundRouter().router;