import {TargetInformation} from "./target-information";
import {determineMonsterTypeMatchingLevel} from "../tasks/common";
import {AbstractCombat} from "./abstract-combat";
import {HuntingHandler} from "../tasks/hunting";

export class BasicCombat extends AbstractCombat {

    constructor(protected huntingHandler: HuntingHandler) {
        super(huntingHandler);
        this.targetInformation = determineMonsterTypeMatchingLevel();
    }

    public async setTargetInfo(targetInformation: TargetInformation): Promise<void> {
        this.targetInformation = targetInformation;
    }

    /**
     * primitive attack, just hit when ready
     */
    public async attack(): Promise<void> {
        const mon_type: string = this.targetInformation!.mon_type;

        if (get_targeted_monster() !== this.target) {
            //is target still the targeted entity?
            this.target = undefined;
        }


        // no target? then get one
        if (!this.target) {
            this.target = await this.getNewTarget(mon_type);
        }

        if (this.target) {
            await change_target(this.target);
            if (can_attack(this.target)) {
                try {
                    await attack(this.target);
                } catch (e) {
                    // log(JSON.stringify(e));
                }
            } else {
                const dist = simple_distance(this.target, character);
                if (!is_moving(character)
                    && dist > character.range - 10) {
                    if (can_move_to(this.target.real_x!, this.target.real_y!)) {
                        await move((this.target.real_x! + character.real_x!) / 2, (this.target.real_y! + character.real_y!) / 2);
                    } else {
                        await smart_move(this.target);
                    }
                }
            }
        } else if (!is_moving(character)) {
            smart_move(mon_type);
        }

    }

}
