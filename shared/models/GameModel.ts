import FiStMa from "../FiStMa";

export default class GameModel
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    public Name: string = "";

    public Location: string = "";

    public Date: Date;

    public Misc: Array<number> = [1,2,3];

    public RoundsFistma:FiStMa<{[key:string]: any}>;

    private _Butt: string;

    public set Butt(newString: string){
        this.Misc = this.Misc.concat(this.Misc);
        this._Butt  = newString;
    }

    public get Butt(){return this._Butt}

    public DeepObj: any = {
        depth1:{
            depth2:{
                depth3:{
                    msg: "I think very deeply"
                }
            }
        }
    };

    public NoInitValue:string;
    
}