import {TargetInformation} from "./target-information";
import {Entity} from "../../definitions/game";
import {partyMerchant} from "../config";
import {HuntingHandler} from "../tasks/hunting";
import {getCharacter} from "../tasks/common";

export abstract class AbstractCombat {
    protected targetInformation?: TargetInformation = undefined;

    public abstract attack(): Promise<void>;

    public abstract setTargetInfo(targetInformation: TargetInformation): Promise<void>;

    constructor(protected huntingHandler: HuntingHandler) {
    }

    protected getNewTarget(mon_type: string): Entity | undefined {
        if (!this.targetInformation) {
            return;
        }

        //override type if hunt is active
        let me = getCharacter(character.name);
        // @ts-ignore
        const hunt = me.s["monsterhunt"];
        if ((hunt.c > 0) && this.huntingHandler.whiteListHuntingTargets.indexOf(hunt.id) !== -1) {
            mon_type = hunt.id;
        }


        let target;
        let commonTargetId = localStorage.getItem('commonTargetId');
        if (this.targetInformation.allAttackSameTarget && commonTargetId) {
            // console.log('⚔ using common existing target');
            target = get_monster(commonTargetId);
            if (!target) {
                //target was killed?
                localStorage.removeItem('commonTargetId');
                return undefined;
            }
        } else {
            if (this.targetInformation.allAttackSameTarget) {
                target = get_nearest_monster({type: mon_type, target: partyMerchant});
                if (!target) {
                    target = get_nearest_monster({type: mon_type});
                }
            } else {
                target = get_nearest_monster({type: mon_type, target: partyMerchant});
                if (!target) {
                    target = get_nearest_monster({no_target: true, type: mon_type});
                }
            }
            if (target && this.targetInformation.allAttackSameTarget && !commonTargetId) {
                // console.log('⚔ saving new common target');
                localStorage.setItem('commonTargetId', target.id!);
            }
        }
        return target;
    }

}
