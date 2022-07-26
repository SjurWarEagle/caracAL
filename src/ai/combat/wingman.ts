import {Entity, ICharacter} from "../../definitions/game";
import {determineMonsterTypeMatchingLevel} from "../tasks/common";
import {AbstractCombat} from "./abstract-combat";
import {HuntingHandler} from "../tasks/hunting";
import {BroadCastHandler} from "../tasks/broadcasts";
import {partyMerchant} from "../config";

export enum Position {
    NW, NE, SE, SW
}

/**
 * Default attack, stay close to leader so that the team is grouped up
 *
 * Enemy selection:
 * * unsure what is good
 * currently: attack who is attacking merchant/priest and within distance 300
 */
export class Wingman extends AbstractCombat {

    constructor(private position: Position, protected huntingHandler: HuntingHandler, protected broadcastHandler: BroadCastHandler) {
        super(huntingHandler, broadcastHandler);
        this.targetInformation = determineMonsterTypeMatchingLevel();
    }

    private async drawHelperCircle(target: Entity, newPosition: any) {

        await clear_drawings();

        if (newPosition) {
            draw_line(newPosition.x - 10, newPosition.y - 10, newPosition.x + 10, newPosition.y + 10, 2, 0x00FFFF);
            draw_line(newPosition.x - 10, newPosition.y + 10, newPosition.x + 10, newPosition.y - 10, 2, 0x00FFFF);
        }

        if (target) {
            draw_circle(target.real_x || target.x, (target.real_y || target.y) - 6, 10, 4, 0x0000FF);
        }
    }

    /**
     * primitive attack, just hit when ready
     */
    public async attack(): Promise<void> {

        let currentTarget = get_targeted_monster();
        if (!currentTarget) {
            currentTarget = this.findNewTarget();
        }
        if (distance(currentTarget, character) > character.range) {
            //too far away
            currentTarget = await this.findNewTarget();
        }
        if (currentTarget && currentTarget !== get_targeted_monster()) {
            change_target(currentTarget);
        }

        const newPos = this.generateSquadPosition();
        await this.drawHelperCircle(currentTarget, newPos)

        // console.log('currentTarget', currentTarget);
        if (currentTarget && !currentTarget.dead && can_attack(currentTarget)) {
            try {
                await attack(currentTarget);
            } catch (e: any) {
                if ('not_found' !== e.reason) {
                    //not_fonud can  happen, if target was killed, but how can the rest happen?
                    //console.log('e', e);
                }
            }
        }

        // let targetInfo = await this.getTargetByTargetInfo();
        // const leader = get_player(partyLeader);

        // console.log('wingman, newPos',JSON.stringify(newPos));
        if (!is_moving(character)) {
            await xmove(newPos.x, newPos.y);
        }
    }


    private generateSquadPosition() {
        const newPos = JSON.parse(JSON.stringify(this.broadcastHandler.lastLeaderPosition));
        // not be on top
        let gap = 35;
        switch (this.position) {
            case Position.NW:
                newPos.x -= gap;
                newPos.y -= gap;
                break;
            case Position.NE:
                newPos.x += gap;
                newPos.y -= gap;
                break;
            case Position.SE:
                newPos.x += gap;
                newPos.y += gap;
                break;
            case Position.SW:
                newPos.x -= gap;
                newPos.y += gap;
                break;
        }
        return newPos;
    }

    private async findNewTarget(): Promise<Entity | undefined> {
        //todo add range-limit to not search everywhere in the world
        let newTarget: Entity | undefined = get_nearest_monster({target: character.name});
        if (!newTarget) {
            newTarget = get_nearest_monster({target: partyMerchant});
        }
        if (!newTarget) {
            newTarget = get_nearest_monster();
        }
        if (newTarget) {
            if (newTarget.damage || 0 >= 200) {
                newTarget = undefined;
            }
            if (newTarget!.mtype?.startsWith('target_')) {
                newTarget = undefined;
            }
        }
        return newTarget;
    }
}
