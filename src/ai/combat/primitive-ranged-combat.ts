import {Entity, ICharacter} from "../../definitions/game";
import {TargetInformation} from "./target-information";
import {determineMonsterTypeMatchingLevel} from "../tasks/common";
import {AbstractCombat} from "./abstract-combat";
import {HuntingHandler} from "../tasks/hunting";

export class PrimitiveRangedCombat extends AbstractCombat{

    constructor(protected huntingHandler:HuntingHandler) {
        super(huntingHandler);
        this.targetInformation = {
            mon_type: determineMonsterTypeMatchingLevel(),
            allAttackSameTarget: false,
        }
    }

    /**
     * primitive attack, just hit when ready
     */
    public async attack(): Promise<void> {
        const mon_type: string = this.targetInformation!.mon_type;

        const minDistance = character.range * 0.75;
        const maxDistance = character.range * 0.95;
        let target = this.getNewTarget(mon_type);


        await this.drawHelperCircle(character, target!, minDistance, maxDistance);
        if (target) {
            change_target(target);

            if (await this.mustIncreaseDistance(minDistance, target)) {
                //try shooting while running away
                // return;
                // console.log('mustIncreaseDistance=true');
            }
            if (can_attack(target)) {
                try {
                    await attack(target);
                } catch (e) {
                    // log(JSON.stringify(e));
                }
            } else {
                const newPosition = this.generateNewPosition(target);
                const dist = simple_distance(target, character);
                if (!is_moving(character)
                    && dist > maxDistance) {
                    if (can_move_to(newPosition.x, newPosition.y)) {
                        await move((newPosition.x + character.real_x!) / 2, (newPosition.y + character.real_y!) / 2);
                    } else {
                        await smart_move(target);
                    }
                }
            }
        } else if (!is_moving(character)) {
            this.moveToNextMonster(mon_type);
        }

    }

    private moveToNextMonster(mon_type: string) {
        smart_move(mon_type);
    }

    private async mustIncreaseDistance(minDistance: number, target: Entity): Promise<boolean> {
        if (!target) {
            // console.log('no target');
            return false;
        }
        if (simple_distance(character, target) > minDistance) {
            // console.log('far enough away ',simple_distance(character, target),minDistance);
            return false;
        }
        const newPosition = this.generateNewPosition(target)
        // if (can_move_to(newPosition.x, newPosition.y)) {
        // moveTo(newPosition.x, newPosition.y);
        move(newPosition.x, newPosition.y);
        // console.log('moveTo('+newPosition.x+', '+newPosition.y+')');

        // moveTo(newPosition.x, newPosition.y);
        // }
        return true;

    }

    private async drawHelperCircle(character: ICharacter, target: Entity, minDistance: number, maxDistance: number) {
        if (parent.caracAL) {
            //not needed if no ui
            return;
        }
        await clear_drawings();
        if (!target) {
            return;
        }
        const newPosition = this.generateNewPosition(target);
        draw_circle(character.real_x || character.x, character.real_y || character.y, minDistance, 2, 0xFF0000);
        draw_circle(character.real_x || character.x, character.real_y || character.y, maxDistance, 2, 0x00FF00);

        draw_circle(newPosition.x, newPosition.y, 10, 4, 0x00FFFF);

        draw_circle(target.real_x || target.x, (target.real_y || target.y) - 6, 10, 4, 0x0000FF);
        draw_line(character.real_x || character.x
            , character.real_y || character.y - 6
            , target.real_x || target.x
            , (target.real_y || target.y) - 6
            , 1
            , 0xFF0000);

    }

    private generateNewPosition(target: Entity) {
        const meX = (character.real_x || character.x);
        const meY = (character.real_y || character.y);

        const tX = (target.real_x || target.x);
        const tY = (target.real_y || target.y);


        let x;
        let y;

        if (meX > tX) {
            x = 20;
        } else {
            x = -20;
        }
        if (meY > tY) {
            y = 20;
        } else {
            y = -20;
        }

        return {
            // x: x,
            // y: y
            x: meX + x,
            y: meY + y
        };

    }

    public async setTargetInfo(targetInformation: TargetInformation): Promise<void> {
        this.targetInformation = targetInformation;
    }

}
