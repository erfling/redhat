import { Router, Request, Response, NextFunction } from 'express';

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