import {Fighter} from "./fighter";
import {Position, Wingman} from "../combat/strategies/wingman";

export class Mage extends Fighter {

    constructor() {
        super();
        this.combatStrategy = new Wingman(Position.NW, this.huntingHandler, this.broadcastHandler);
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

new Mage();
