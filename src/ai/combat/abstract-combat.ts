import {TargetInformation} from "./target-information";
import {Entity} from "../../definitions/game";

export abstract class AbstractCombat {
    protected targetInformation?: TargetInformation = undefined;


    public abstract attack(): Promise<void>;

    public abstract setTargetInfo(targetInformation: TargetInformation): Promise<void>;

    protected getNewTarget(mon_type: string): Entity | undefined {
        if (!this.targetInformation) {
            return;
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
                target = get_nearest_monster({type: mon_type});
            } else {
                target = get_nearest_monster({no_target: true, type: mon_type});
            }
            if (target && this.targetInformation.allAttackSameTarget && !commonTargetId) {
                // console.log('⚔ saving new common target');
                localStorage.setItem('commonTargetId', target.id!);
            }
        }
        return target;
    }

}
