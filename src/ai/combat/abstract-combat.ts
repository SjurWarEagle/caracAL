import {TargetInformation} from "./target-information";
import {Entity} from "../../definitions/game";
import config, {partyLeader, partyMerchant} from "../config";
import {HuntingHandler} from "../tasks/hunting";
import {getCharacter} from "../tasks/common";
import {BroadCastHandler, CommonTarget} from "../tasks/broadcasts";

export abstract class AbstractCombat {
    protected targetInformation?: TargetInformation = undefined;
    protected target?: Entity;

    public abstract attack(): Promise<void>;

    public async setTargetInfo(targetInformation: TargetInformation): Promise<void> {
        this.targetInformation = targetInformation;
    }

    constructor(protected huntingHandler: HuntingHandler,
                protected broadCastHandler: BroadCastHandler) {
    }

    protected async getTargetByTargetInfo(): Promise<Entity | undefined> {
        let mon_type;
        if (this.targetInformation?.mon_type) {
            mon_type = this.targetInformation?.mon_type;
        } else {
            mon_type = 'bee';
        }

        if (!this.targetInformation) {
            return;
        }
        // console.log('looking for target with ' + JSON.stringify(this.targetInformation));

        let me = getCharacter(character.name)!;
        // @ts-ignore
        const hunt = me.s["monsterhunt"];
        if ((hunt.c > 0) && this.huntingHandler.whiteListHuntingTargets.indexOf(hunt.id) !== -1) {
            //override type if hunt is active
            set_message('🏹');
            mon_type = hunt.id;
        } else {
            set_message('⚔');
        }

        // console.log(character.name + ': commonTarget?.id=' + this.broadCastHandler.commonTarget?.id);
        if (this.targetInformation.allAttackSameTarget && this.broadCastHandler.commonTarget?.id) {
            return this.getCommonTarget();
        } else if (this.targetInformation.allAttackSameTarget && !(this.broadCastHandler.commonTarget?.id)) {
            await this.findNewCommonTarget(mon_type);
        } else {
            await this.findNewSingleTarget(mon_type)
        }

        return this.target;
    }

    private async getCommonTarget(): Promise<Entity | undefined> {
        // console.log('⚔ using common existing target');
        this.target = get_monster(this.broadCastHandler.commonTarget?.id!);
        if (!this.target) {
            let me = getCharacter(character.name)!;
            let dX = Math.abs((this.broadCastHandler.commonTarget?.x || 0) - me.x);
            let dY = Math.abs((this.broadCastHandler.commonTarget?.y || 0) - me.y);
            let dist = Math.sqrt(dX * dX + dY * dY);
            if (dist > 200 && !smart.moving) {
                if (this.broadCastHandler.commonTarget) {
                    console.log(character.name + ': there is a target, but I do not see it. Moving closer (' + this.broadCastHandler.commonTarget?.x + '/' + this.broadCastHandler.commonTarget?.y + ')');
                    try {
                        if (!smart.moving) {
                            await smart_move({
                                map: this.broadCastHandler.commonTarget?.map,
                                x: this.broadCastHandler.commonTarget?.x!,
                                y: this.broadCastHandler.commonTarget?.y!
                            });
                        }
                    } catch (e) {
                        // await smart_move('main');
                    }
                } else {
                    console.log('no target defined (still 0/0)');
                }
            } else if (dist <= 200 && character.name === partyLeader) {
                console.log(character.name + ': I am close enough but target is not here, so invalidate current target.');
                this.broadCastHandler.broadcastToTeam(BroadCastHandler.BROADCAST_REMOVE_TARGET, {})
            }

            return undefined;
        }
        return this.target;
    }

    private async findNewCommonTarget(mon_type: string) {
        if (character.name !== partyLeader) {
            // new common targets are only set by the leader to avoid clustering of the team over the map
            // and having them run fom a to b to a to b.
            return;
        }

        console.log(character.name + ': no common target, but shall attack one. so need to find new one.');
        this.target = get_nearest_monster({type: mon_type, target: partyMerchant});
        if (!this.target) {
            this.target = get_nearest_monster({type: mon_type});
        }
        for (let helper of config.myHelpers) {
            // check if there is a monster, targeting the team
            if (!this.target) {
                this.target = get_nearest_monster({type: mon_type, target: helper});
            }
        }
        if (!this.target && (!is_moving(character)) && !smart.moving) {
            // if no target was found, move in the general direction of monster type
            await smart_move(mon_type);
        }
        if (this.target
            && this.targetInformation!.allAttackSameTarget
        ) {
            const data: CommonTarget = {
                    id: this.target.id,
                    x: +(this.target.real_x || this.target.x),
                    y: +(this.target.real_y || this.target.y),
                    map: this.target.map
                }
            ;
            this.broadCastHandler.commonTarget = data;
            console.log(character.name + ': ⚔ saving new common target');
            console.log('to:', JSON.stringify(data));
            this.broadCastHandler.broadcastToTeam(BroadCastHandler.BROADCAST_NEW_TARGET, data);

        }
    }

    private async findNewSingleTarget(mon_type: string) {
        this.target = get_nearest_monster({type: mon_type, target: partyMerchant});
        if (!this.target) {
            this.target = await get_nearest_monster({no_target: true, type: mon_type});
        }
        if (!this.target) {
            //if no other target, then attack something
            this.target = get_nearest_monster({type: mon_type});
        }
        for (let helper of config.myHelpers) {
            // check if there is a monster, targeting the team
            if (!this.target) {
                this.target = get_nearest_monster({type: mon_type, target: helper});
            }
        }
        if (!this.target && !smart.moving) {
            console.log(character.name + ': moving to general monster area for', mon_type);
            await smart_move(mon_type)
        }

    }
}
