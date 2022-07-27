import {Fighter} from "./fighter";
import {Position, Wingman} from "../combat/strategies/wingman";

export class Ranger extends Fighter {

    constructor() {
        super();
        this.combatStrategy = new Wingman(Position.SW, this.huntingHandler, this.broadcastHandler);
        // this.combatStrategy = new PrimitiveRangedCombat(this.huntingHandler, this.broadcastHandler);
    }

    async performRoleSpecificTasks(): Promise<boolean> {
        return false;
    }
}

// noinspection JSUnusedLocalSymbols
/**
 * called by the inviter's name
 * @param name
 */
function on_party_invite(name: string) {
    log("Received party invite from " + name);
    accept_party_invite(name);
}

//startCommonFighterLoops(currentActivity);


new Ranger();
