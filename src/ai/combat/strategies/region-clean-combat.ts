import {AbstractCombat} from "../abstract-combat";
import {HuntingHandler} from "../../tasks/hunting";
import {BroadCastHandler} from "../../tasks/broadcasts";
import {getFarmingLocationForMonsterType, move_half_way, myDistance} from "../../tasks/common";
import {Entity} from "../../../definitions/game";
import config, {partyMerchant} from "../../config";

export class RegionCleanCombat extends AbstractCombat {

    constructor(protected huntingHandler: HuntingHandler, protected broadcastHandler: BroadCastHandler) {
        super(huntingHandler, broadcastHandler);
    }

    async attack(): Promise<void> {
        let currentTarget = get_targeted_monster();

        if (!currentTarget) {
            // no target? then get one
            currentTarget = await this.findNewTarget();
        }
        if (currentTarget) {
            if (distance(character, currentTarget) > character.range) {
                // console.log('moving to target ', currentTarget);
                if (!smart.moving && !is_moving(character)) {
                    await move_half_way({
                        x: currentTarget.real_x || currentTarget.x,
                        y: currentTarget.real_y || currentTarget.y
                    });
                }
            } else {
                if (get_targeted_monster() !== currentTarget) {
                    change_target(currentTarget);
                }
                if (can_attack(currentTarget) && !is_disabled(character)) {
                    try {
                        await attack(currentTarget);
                    } catch (e: any) {
                        if (e && e.reason && e.reason !== 'not_found') {
                            //enemy might be killed already
                            console.error('error attacking', e);
                        }
                    }
                }
            }
        } else {
            //no target in range, then move to farming position
            if (!this.targetInformation!.farmingLocation) {
                if (!this.targetInformation) {
                    this.targetInformation = {
                        mon_type: 'goo',
                        allAttackSameTarget: false
                    }
                }
                this.targetInformation.farmingLocation = getFarmingLocationForMonsterType('default');
            }
            if (this.targetInformation!.farmingLocation && myDistance(character, this.targetInformation!.farmingLocation) > 20) {
                if (!smart.moving && !is_moving(character)) {
                    if (this.targetInformation!.farmingLocation.map !== character.map) {
                        console.log('switching map because', this.targetInformation!.farmingLocation.map, '!==', character.map);
                        await smart_move(this.targetInformation!.farmingLocation.map);
                    } else {
                        console.log('moving to farming location', this.targetInformation!.farmingLocation);
                        await smart_move(this.targetInformation!.farmingLocation);
                    }
                }
            }
        }
    }

    private async findNewTarget(): Promise<Entity | undefined> {
        if (is_disabled(character)) {
            //if I cannot act, then I do not need a target
            return undefined;
        }
        const maxDistanceFromFarmingLocation: number = 300;

        if (this.targetInformation!.farmingLocation) {
            if (myDistance(character, this.targetInformation!.farmingLocation) > 2 * maxDistanceFromFarmingLocation) {
                return undefined;
            }
        }

        let candidatesAttackingTeam = Object.values(parent.entities).filter((entity) => {
            return !entity.dead
                && entity.visible
                && this.hasHandleableDamageReturn(entity)
                && entity.mtype
                && entity.mtype !== 'plantoid'
                && entity.xp
                && entity.xp > 0
                //only assist if target has much health or is dangerous
                && (
                    this.isAttackingMerchant(entity)
                    || this.isAttackingTeamMemberAndMonsterIsDangerousForThem(entity)
                )
                && entity.type === 'monster'
                && (myDistance(character, entity) <= 320)
        });
        for (let candidate of candidatesAttackingTeam) {
            if (can_use('taunt')) {
                change_target(candidate);
                use_skill('taunt');
            }
        }
        if (candidatesAttackingTeam && candidatesAttackingTeam.length > 0) {
            // console.log('new target', candidates[0].name);
            return candidatesAttackingTeam[0];
        }

        let candidatesAttackingMe = Object.values(parent.entities).filter((entity) => {
            return !entity.dead
                && entity.visible
                && entity.mtype
                && entity.mtype !== 'plantoid'
                && entity.xp
                && this.hasHandleableDamageReturn(entity)
                && entity.xp > 0
                && entity.target == character.name
                && entity.type === 'monster'
                && (myDistance(character, entity) < 400)
        });
        if (candidatesAttackingMe && candidatesAttackingMe.length > 0) {
            // console.log('new target', candidates[0].name);
            return candidatesAttackingMe[0];
        }

        if (!this.targetInformation || !this.targetInformation.farmingLocation) {
            return
        }

        let candidates = Object.values(parent.entities).filter((entity) => {
            return !entity.dead
                && entity.visible
                && this.hasHandleableDamageReturn(entity)
                && entity.mtype
                && entity.mtype !== 'plantoid'
                && entity.xp
                && entity.xp > 0
                && (!entity.target
                    || entity.target === character.name
                )
                && entity.type === 'monster'
                && myDistance(character, entity) < maxDistanceFromFarmingLocation * 2
                && myDistance(character, this.targetInformation!.farmingLocation!) < maxDistanceFromFarmingLocation
        });
        candidates = candidates.sort((a, b) => {
            // the closer to center of farming location, the more interesting
            return myDistance(a, this.targetInformation!.farmingLocation!) - myDistance(b, this.targetInformation!.farmingLocation!);
        })

        // // clear_drawings();
        // // candidates.forEach(entity => {
        // //     draw_circle(entity.real_x || entity.x, (entity.real_y || entity.y), 10, 2, 0xFF0000);
        // // })
        // //
        // // await this.drawHelperCircles(this.farmingLocation, character, maxDistanceFromFarmingLocation);

        if (candidates && candidates.length > 0) {
            // console.log('new target', candidates[0].name);
            return candidates[0];
        }
        return undefined;
    }

    private isAttackingMerchant(entity: Entity): boolean {
        return entity.target === partyMerchant;
    }

    private isAttackingTeamMemberAndMonsterIsDangerousForThem(monster: Entity): boolean {
        const attackingTeam = (monster.target === config.myHelpers[1]
            || monster.target === config.myHelpers[2]);
        const dangerForTeam = monster.attack > 100 && (monster.hp / monster.max_hp) > 0.75;
        return attackingTeam && dangerForTeam;
    }

    // private async drawHelperCircles(farmingLocation: { x: number; y: number }, character: ICharacter, maxDistanceFromFarmingLocation: number) {
    //     await clear_drawings();
    //
    //     if (farmingLocation) {
    //         draw_circle(farmingLocation.x, farmingLocation.y, maxDistanceFromFarmingLocation, 4, 0x00FFFF);
    //     }
    //     // draw_circle(character.x, character.y, 100, 4, 0x00FFFF);
    //
    // }
    private hasHandleableDamageReturn(entity: Entity): boolean {
        if (!entity.dreturn) {
            return true;
        }
        if (entity.dreturn && entity.dreturn <= 30) {
            return true;
        }
        return false;
    }
}

// function get_nearest_monster(args) {
//     //args:
//     // max_att - max attack
//     // min_xp - min XP
//     // target: Only return monsters that target this "name" or player object
//     // no_target: Only pick monsters that don't have any target
//     // path_check: Checks if the character can move to the target
//     // type: Type of the monsters, for example "goo", can be referenced from `show_json(G.monsters)` [08/02/17]
//     var min_d = 999999, target = null;
//
//     if (!args) args = {};
//     if (args && args.target && args.target.name) args.target = args.target.name;
//     if (args && args.type == "monster") game_log("get_nearest_monster: you used monster.type, which is always 'monster', use monster.mtype instead");
//     if (args && args.mtype) game_log("get_nearest_monster: you used 'mtype', you should use 'type'");
//
//     for (let id in parent.entities) {
//         var current = parent.entities[id];
//         if (current.type != "monster" || !current.visible || current.dead) continue;
//         if (args.type && current.mtype != args.type) continue;
//         if (args.min_xp && current.xp < args.min_xp) continue;
//         if (args.max_att && current.attack > args.max_att) continue;
//         if (args.target && current.target != args.target) continue;
//         if (args.no_target && current.target && current.target != character.name) continue;
//         if (args.path_check && !can_move_to(current)) continue;
//         var c_dist = parent.distance(character, current);
//         if (c_dist < min_d) min_d = c_dist, target = current;
//     }
//     return target;
// }
