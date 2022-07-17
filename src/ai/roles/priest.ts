import {Fighter} from "./fighter";

export class Priest extends Fighter {

    constructor() {
        super();
    }

    public async startHealingTeam(): Promise<void> {
        setInterval(() => {

        }, 10_000);
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


new Priest().startHealingTeam();
