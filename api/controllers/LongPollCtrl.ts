import { Router, Request, Response, NextFunction } from 'express';
import LongPoll from '../../shared/base-sapien/api/LongPoll';
import { AppServer } from '../AppServer'

export class LongPollCtrl{

  //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    public router: Router;
    


    //----------------------------------------------------------------------
    //
    //  Constructor
    //
    //----------------------------------------------------------------------

    constructor() {
        this.router = Router({mergeParams:true});
        this.routes();
        
    }

    public routes(){
        
    }
}

export const LongPollRouter = new LongPollCtrl().router;;