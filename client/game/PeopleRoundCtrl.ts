'use strict';
import BaseRoundCtrl from './BaseRoundCtrl';

export default class PeopleRoundCtrl extends BaseRoundCtrl
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------


    
    //----------------------------------------------------------------------
    //
    //  Constructor
    //
    //----------------------------------------------------------------------

    constructor(reactComp: React.Component<any, any>) {
        super(reactComp);
        setTimeout(() => {
            this.updateContent([{
                Header: "Test Header",
                Body: "Test Body",
                EditMode: false
            }])
            console.log("CONTENT UPDATED", this.dataStore);
        },2)
    }

    //----------------------------------------------------------------------
    //
    //  Event Handlers
    //
    //----------------------------------------------------------------------
    updateContent(newContent:any){
        super.updateICContent(newContent, 0)
    }


    //----------------------------------------------------------------------
    //
    //  Methods
    //
    //----------------------------------------------------------------------



}