import * as React from "react";
import SalesRoundCtrl from "./FinanceRountCtrl";
import RoundModel from "../../shared/models/RoundModel";
import * as spectacle from 'spectacle';
const { Deck, Slide } = spectacle;
import JoditEditor from 'jodit-react'
import 'jodit/build/jodit.min.css';
import * as Semantic from 'semantic-ui-react';
const { Button } = Semantic;

export default class FinanceRound extends React.Component<{}, RoundModel>
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

    constructor() {
        super({});

        this.state = new SalesRoundCtrl(this).dataStore;
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

    render() {
        var testContent = "Hello, there"
        return <div>

            <Deck
                progress="bar"
                transition={["slide"]}
            >
                <Slide bgColor="#eee">
                    <h1>You are in round 3.</h1>
                    <Button
                        color="violet"
                        basic={true}
                    >
                        Best shot
                    </Button>
                    <JoditEditor
                        content={testContent}
                        config={{
                            readonly: false // all options from https://xdsoft.net/jodit/doc/
                        }}
                        onChange={(stuff: any) => console.log(stuff)}
                    />
                </Slide>
                <Slide>Hello. This is slide Two</Slide>
                <Slide>Hello. This is slide Three</Slide>
                <Slide>Hello. This is slide Four</Slide>
                <Slide>Hello. This is slide Five</Slide>
            </Deck>
        </div>;
    }

}
/**
 *
 */