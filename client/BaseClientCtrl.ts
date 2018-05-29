'use strict';

export default class SapienUtils
{
    //----------------------------------------------------------------------
    //
    //  Properties
    //
    //----------------------------------------------------------------------

    static BASE_REST_URL: string = "";
    static get _BASE_REST_URL(): string{
        const protocol = !window.location.host.includes('local') ? "https:" : "http:";
        const port = !window.location.host.includes('local') ? ":8443" : ":4000";
        this.BASE_REST_URL = protocol +  "//" + window.location.hostname + port + "/sapien/api/";
        return this.BASE_REST_URL;
    }


    static BASE_SOCKET_URL: string = "";
    static get _BASE_SOCKET_URL(): string{        
        const protocol = !window.location.host.includes('local') ? "https:" : "http:";
        const port = !window.location.host.includes('local') ? ":8443" : ":4000";
        this.BASE_SOCKET_URL = !window.location.host.includes('local') ? ":9443" : ":5000";
        return this.BASE_REST_URL;
    }
    //----------------------------------------------------------------------
    //
    //  Constructor
    //
    //----------------------------------------------------------------------


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



}