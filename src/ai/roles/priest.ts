import {Fighter} from "./fighter";
import {PrimitiveRangedCombat} from "../combat/primitive-ranged-combat";
import config, {partyMerchant} from "../config";

export class Priest extends Fighter {
    private lastHeal: number = Date.now();

    constructor() {
        super();
        this.combatStrategy = new PrimitiveRangedCombat(this.huntingHandler);
    }

    public async startHealingTeam(): Promise<void> {
        setInterval(() => {

        }, 10_000);
    }

    /**
     * @return if other actions shall be forbidden
     */
    async performRoleSpecificTasks(): Promise<boolean> {
        const allCharNames: string[] = [];
        allCharNames.push(...config.myHelpers)
        allCharNames.push(partyMerchant)
        // if (!can_use('heal')) {
        //     return true;
        // }
        // if (Date.now() < this.lastHeal + 1_500) {
        //     return true;
        // }
        //heal and attack use same cooldown
        if (is_on_cooldown("attack")) {
            return true;
        }
        for (const name of allCharNames) {
            if (name === character.name) {
                continue;
            }
            const target = get_player(name);
            if (!target) {
                // console.log('target "' + name + '" not in range');
                continue;
            }
            if ((target?.hp || 0) >= (target?.max_hp || 0)) {
                //healthy enough
                continue;
            }
            if (simple_distance(character, target) <= 200) {
                //todo what is the real distance to check?!
                console.log('healing "' + name + '" (' + target?.hp + '/' + target?.max_hp + ')');
                this.lastHeal = Date.now();
                await heal(target);
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


new Priest().startHealingTeam();
