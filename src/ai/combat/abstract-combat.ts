import {TargetInformation} from "./target-information";
import {Entity} from "../../definitions/game";
import {partyMerchant} from "../config";
import {HuntingHandler} from "../tasks/hunting";
import {getCharacter} from "../tasks/common";

export abstract class AbstractCombat {
    protected targetInformation?: TargetInformation = undefined;
    protected target?: Entity;

    public abstract attack(): Promise<void>;

    public abstract setTargetInfo(targetInformation: TargetInformation): Promise<void>;

    constructor(protected huntingHandler: HuntingHandler) {
    }

    protected async getNewTarget(mon_type: string): Promise<Entity | undefined> {
        if (!this.targetInformation) {
            return;
        }

        //override type if hunt is active
        let me = getCharacter(character.name);
        // @ts-ignore
        const hunt = me.s["monsterhunt"];
        if ((hunt.c > 0) && this.huntingHandler.whiteListHuntingTargets.indexOf(hunt.id) !== -1) {
            set_message('🏹');
            mon_type = hunt.id;
        } else {
            set_message('⚔');
        }

        let commonTargetId = localStorage.getItem('commonTargetId');
        let commonTargetMap = localStorage.getItem('commonTargetX') || 'main';
        let commonTargetX = +(localStorage.getItem('commonTargetX') || 0);
        let commonTargetY = +(localStorage.getItem('commonTargetY') || 0);
        if (this.targetInformation.allAttackSameTarget && commonTargetId) {
            // console.log('⚔ using common existing target');
            this.target = get_monster(commonTargetId);
            if (!this.target) {
                let me = getCharacter(character.name)!;
                let dX = Math.abs((commonTargetX || 0) - me.x);
                let dY = Math.abs((commonTargetY || 0) - me.y);
                let dist = Math.sqrt(dX * dX + dY * dY);
                if (dist > 300 && !smart.moving) {
                    smart_move({map: commonTargetMap, x: commonTargetX, y: commonTargetY});
                } else if (dist <= 300) {
                    localStorage.removeItem('commonTargetId');
                    localStorage.removeItem('commonTargetMap');
                    localStorage.removeItem('commonTargetX');
                    localStorage.removeItem('commonTargetY');
                }

                return undefined;
            }
        } else {
            if (this.targetInformation.allAttackSameTarget) {
                this.target = get_nearest_monster({type: mon_type, target: partyMerchant});
                if (!this.target) {
                    this.target = get_nearest_monster({type: mon_type});
                }
            } else {
                this.target = get_nearest_monster({type: mon_type, target: partyMerchant});
                if (!this.target) {
                    this.target = await get_nearest_monster({no_target: true, type: mon_type});
                }
                if (!this.target) {
                    //if no other target, then attack something
                    this.target = get_nearest_monster({type: mon_type});
                }
                if (!this.target && !smart.moving) {
                    console.log('moving to general monster area for', mon_type);
                    smart_move(mon_type)
                }
                // console.log('hunting',target,mon_type);

            }
            if (this.target && this.targetInformation.allAttackSameTarget && !commonTargetId) {
                // console.log('⚔ saving new common target');
                localStorage.setItem('commonTargetId', this.target.id!);
                localStorage.setItem('commonTargetX', ''+this.target.x);
                localStorage.setItem('commonTargetY', ''+this.target.y);
                localStorage.setItem('commonTargetMap', this.target.map);
            }
        }
        return this.target;
    }

}
