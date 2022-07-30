import {Fighter} from "./fighter";
import config, {partyMerchant} from "../config";
import {Position, Wingman} from "../combat/strategies/wingman";
import {Entity} from "../../definitions/game";

export class Priest extends Fighter {
    private lastHeal: number = Date.now();

    constructor() {
        super();
        this.combatStrategy = new Wingman(Position.NE, this.huntingHandler, this.broadcastHandler);
        // this.combatStrategy = new PrimitiveRangedCombat(this.huntingHandler, this.broadcastHandler);
    }

    public async startHealingTeam(): Promise<void> {
        setInterval(() => {

        }, 10_000);
    }

    async neededToCastGroupHeal(): Promise<boolean> {
        if (is_on_cooldown('partyheal')) {
            return false;
        }
        if (character.mp < 400) {
            return false;
        }

        const allCharNames: string[] = [];
        allCharNames.push(...config.myHelpers)
        allCharNames.push(partyMerchant)
        for (const name of allCharNames) {
            // if (name === character.name) {
            //     continue;
            // }
            const target = get_player(name);
            if (((target?.hp || 1) / (target?.max_hp || 1)) <= 0.5) {
                // heal the complete party if any member is < 50%
                // idea is "emergency heal"
                await use_skill('partyheal')
            }
        }
        return false;
    }

    async neededToCastHeal(): Promise<boolean> {
        const allCharNames: string[] = [];
        allCharNames.push(character.name)
        allCharNames.push(...config.myHelpers)
        allCharNames.push(partyMerchant)
        //heal and attack use same cooldown
        if (is_on_cooldown("attack")) {
            return true;
        }
        let lowestHealthPercent = 1;
        let target: Entity | undefined;
        for (const name of allCharNames) {
            // if (name === character.name) {
            //     continue;
            // }
            let tmpTarget = get_player(name);
            if (!tmpTarget) {
                // console.log('target "' + name + '" not in range');
                continue;
            }
            if (tmpTarget.hp <= 0) {
                //dead
                continue;
            }
            if ((tmpTarget?.max_hp || 0) - (tmpTarget?.hp || 0) <= character.attack * 0.5) {
                //healthy enough
                //not at full health
                //and not if only half the potential is used, better to heal someone else if needed
                continue;
            }
            if (simple_distance(character, tmpTarget) <= character.range) {
                // console.log('healing "' + name + '" (' + target?.hp + '/' + target?.max_hp + ')');
                if (tmpTarget.hp / tmpTarget.max_hp < lowestHealthPercent) {
                    lowestHealthPercent = tmpTarget.hp / tmpTarget.max_hp;
                    target = tmpTarget;
                }
            }
            if (target) {
                this.lastHeal = Date.now();
                await heal(target);
            }
        }
        return false;

    }

    /**
     * @return if other actions shall be forbidden
     */
    async performRoleSpecificTasks(): Promise<boolean> {
        if (await this.neededToCastHeal()) {
            return true;
        }
        // noinspection RedundantIfStatementJS
        if (await this.neededToCastGroupHeal()) {
            return true;
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


new Priest().startHealingTeam();
