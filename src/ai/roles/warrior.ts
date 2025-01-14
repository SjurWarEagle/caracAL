import {startPartyInvite} from "../tasks/common";
import {Fighter} from "./fighter";
import {BroadCastHandler} from "../tasks/broadcasts";
import {RegionCleanCombat} from "../combat/strategies/region-clean-combat";
import {Tools} from "../../tools";

export class Warrior extends Fighter {

    constructor() {
        super();
        this.combatStrategy = new RegionCleanCombat(this.huntingHandler, this.broadcastHandler);

        this.huntingHandler.receiveBroadCastHunts();
        startPartyInvite();

        setInterval(() => {
            this.broadcastHandler.broadcastToTeam(BroadCastHandler.BROADCAST_LEADER_POSITION,
                {
                    map: character.map,
                    x: character.real_x,
                    y: character.real_y
                }
            );
        }, 1_000)
    }

    async performRoleSpecificTasks(): Promise<boolean> {
        Tools.drawRangeCircles();
        return false;
    }
}

new Warrior();
