import {Fighter} from "./fighter";
import {Position, Wingman} from "../combat/strategies/wingman";
import {Tools} from "../../tools";

export class Ranger extends Fighter {

    constructor() {
        super();
        this.combatStrategy = new Wingman(Position.SW, this.huntingHandler, this.broadcastHandler);
        // this.combatStrategy = new PrimitiveRangedCombat(this.huntingHandler, this.broadcastHandler);
    }

    async performRoleSpecificTasks(): Promise<boolean> {
        Tools.drawRangeCircles()

        // //Use Ranger Skills
        if (character.mp > (character.max_mp / 2)) {
            // Multi-shots (3-Shot and 5-Shot)
            if (is_on_cooldown("attack")) {
                return false;
            }
            let targets = Object.values(parent.entities)
                .filter((entity) => {
                        return !entity.dead
                            && entity.visible
                            && entity.xp
                            && entity.xp > 0
                            && (entity.level || 0 <= 1)
                            && entity.type === 'monster'
                            && entity.mtype?.indexOf('target') === -1
                            && entity.mtype?.indexOf('redfairy') === -1
                            && is_in_range(entity, "3shot")
                        // && is_in_range(entity, "5shot")
                    }
                );
            //         if (targets.length >= 5
            //             && character.mp > G.skills["5shot"].mp) {
            //             use_skill("5shot", targets);
            //             game_log("Used 5-Shot");
            //         }
            //         else if (targets.length >= 3
            if (targets.length >= 3
                && character.mp > (G.skills["3shot"].mp || 0)) {
                await use_skill("3shot", targets);
                //game_log("Used 3-Shot");
                return true;
            }
        }
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
