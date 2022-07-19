import {Entity} from "../../definitions/game";
import {TargetInformation} from "./target-information";
import {AbstractCombat} from "./abstract-combat";


/**
 * for merchant, just avoid contact with the enemy
 */
export class JustRunAway extends AbstractCombat {

    /**
     * primitive attack, just hit when ready
     */
    public async attack(): Promise<void> {
        let target = get_nearest_monster({target: character.name});

        if (!target) {
            target = get_nearest_monster();
        }

        if (!target) {
            return
        }
        const minDistance = Math.max(target.range || 0, 100);
        await this.mustIncreaseDistance(minDistance, target);

    }

    private async mustIncreaseDistance(minDistance: number, target: Entity): Promise<boolean> {
        if (!target) {
            return false;
        }
        if (simple_distance(character, target) > minDistance) {
            return false;
        }
        const newPosition = this.generateNewPosition(target)
        move(newPosition.x, newPosition.y);
        return true;

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
        //no targeting, so nothing to remember
    }
}
