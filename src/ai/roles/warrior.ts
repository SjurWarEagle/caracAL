import {startPartyInvite} from "../tasks/common";
import {Fighter} from "./fighter";
import {BroadCastHandler} from "../tasks/broadcasts";

export class Warrior extends Fighter {

    constructor() {
        super();
        startPartyInvite();

        setInterval(() => {
            this.broadcastHandler.broadcastToTeam(BroadCastHandler.BROADCAST_LEADER_POSITION,
                {
                    x: character.real_x,
                    y: character.real_y
                }
            );
        }, 10_000)

    }
}


new Warrior();
