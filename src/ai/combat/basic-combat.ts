import {TargetInformation} from "./target-information";
import {determineMonsterTypeMatchingLevel} from "../tasks/common";
import {AbstractCombat} from "./abstract-combat";

export class BasicCombat extends AbstractCombat {

    constructor() {
        super();
        this.targetInformation = {
            mon_type: determineMonsterTypeMatchingLevel(),
            allAttackSameTarget: false,
        }
    }

    public async setTargetInfo(targetInformation: TargetInformation): Promise<void> {
        this.targetInformation = targetInformation;
    }

    /**
     * primitive attack, just hit when ready
     */
    public async attack(): Promise<void> {
        const mon_type: string = this.targetInformation!.mon_type;
        let target = this.getNewTarget(mon_type);

        if (target) {
            change_target(target);
            if (can_attack(target)) {
                try {
                    await attack(target);
                } catch (e) {
                    // log(JSON.stringify(e));
                }
            } else {
                const dist = simple_distance(target, character);
                if (!is_moving(character)
                    && dist > character.range - 10) {
                    if (can_move_to(target.real_x!, target.real_y!)) {
                        await move((target.real_x! + character.real_x!) / 2, (target.real_y! + character.real_y!) / 2);
                    } else {
                        await smart_move(target);
                    }
                }
            }
        } else if (!is_moving(character)) {
            smart_move(mon_type);
        }

    }

}
