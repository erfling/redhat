import * as Mongoose from "mongoose";

export default abstract class SchemaBuilder
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

    private constructor() { } // Static class cannot be instantiated

    //----------------------------------------------------------------------
    //
    //  Methods
    //
    //----------------------------------------------------------------------

    public static fetchSchema(modelClass:any):any {
        modelClass = (typeof modelClass === "function") ? new modelClass() : modelClass;
        var schemaObj:any;
        var nestedSchemaObj:any;
        if (modelClass.DbSchema) {
            schemaObj = {};
            for (var prop in modelClass) {
                if (modelClass.DbSchema[prop]) {
                    nestedSchemaObj = this.fetchSchema(modelClass.DbSchema[prop]);
                    schemaObj[prop] = nestedSchemaObj || modelClass.DbSchema[prop];
                }
            }
        } else if (Array.isArray(modelClass) && modelClass.length) {
            nestedSchemaObj = this.fetchSchema(this.getArrayType(modelClass));
            if (nestedSchemaObj) schemaObj = [nestedSchemaObj];
        }
        
        return schemaObj;
    }

    private static getArrayType(arr: any[]): Function {
        if (arr && arr.length) {
            var firstType = typeof arr[0] === "function" ? arr[0] : arr[0].constructor;
            if (arr.every(item => item ===  firstType || item.constructor === firstType)) return firstType;
        }
        return Object;
    }

}