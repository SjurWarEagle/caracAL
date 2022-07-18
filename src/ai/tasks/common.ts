import config, {getValue, partyLeader, partyMerchant, setValue, Stocks} from "../config";
import {Entity} from "../../definitions/game";
import {BroadCastHandler} from "./broadcasts";

export const ACTIVE_HUNT_INFO = 'ACTIVE_HUNT_INFO';
export const ACTIVE_HUNT_MISSING = 'ACTIVE_HUNT_MISSING';
export type PlayerActivity = "COMBAT" | "SHOPPING";
export let minutes = 1_000 * 60 * 5;
let lastRegeneration=0;

// export type PlayerActivity = "COMBAT" | "SHOPPING" | "TRAVEL";
// let lastDistanceCheckToLeader: number = 0;

export function on_party_invite(name: string) // called by the inviter's name
{
    accept_party_invite(name);
}

export function startAcceptingInvites() {
    setInterval(function () {
        // log("accept invite loop")
        if (character.party && character.party !== partyLeader) {
            // wrong party
            console.log("I (" + character.name + ") am in party \"" + character.party + "\" but want to be in party \"" + partyLeader + "\"");
            leave_party();
        } else if (!character.party) {
            // console.log(character.name + " would accept invite");
            accept_party_invite(partyLeader);
        }
    }, 1_000);
}

export function startTransferLootToMerchant(): void { // called by the inviter's name
    setInterval(function () {
        // todo what is this for?
        // const currentActivity = getValue("currentActivityMerchant") || getCurrentActivityMerchant();
        // if (currentActivity === "SHOPPING") {
        //   //already on the way
        //   return;
        // }

        let merchant = getCharacter(partyMerchant);
        if (!merchant) {
            return;
        }
        const dist = simple_distance(merchant, character);
        if (dist > 100) {
            return;
        }

        let amount = 100_000;
        if (character.gold >= amount) {
            log("Sending " + amount + " gold to " + merchant.name);
            send_gold(merchant, amount);
        }

        for (let i = 0; i < character.items.length - 1; i++) {
            const item = character.items[i];
            if (!item) {
                continue;
            }
            let itemName = item.name;
            // console.log(i,itemName,item.q)
            if (itemName === "mpot0") {
                let amount = item.q || 0;
                amount = Math.max(0, amount - Stocks.minCntMP);
                if (amount > 0) {
                    log("Sending " + amount + " " + itemName + " to " + merchant.name);
                    send_item(merchant, i, amount);
                }
            } else if (itemName === "hpot0") {
                let amount = item.q || 0;
                amount = Math.max(0, amount - Stocks.minCntHP);
                if (amount > 0) {
                    log("Sending " + amount + " " + itemName + " to " + merchant.name);
                    send_item(merchant, i, amount);
                }
            } else {
                let amount = item.q || 1;
                if (amount > 0) {
                    log("Sending " + amount + " " + itemName + " to " + merchant.name);
                    send_item(merchant, i, amount);
                }
            }
        }
    }, 1_000);
}

export function startBuffing() {
    setInterval(function () {
        config.myHelpers.forEach(name => {
            buff(name);
        });
    }, 4500);
    //4 sec would be enough, just a bit buffer
}

function buff(name: string) {
    let target = getCharacter(name);
    if (!target) {
        return;
    }

    if (simple_distance(target, character) > 200) {
        return;
    }

    // @ts-ignore
    if (target.s && !target.s["mluck"] && can_use("mluck")) {
        log("Buffing " + target.name);
        use_skill("mluck", target);
    }
}

export function startRevive() {
    setInterval(function () {
        if (character.rip) {
            setTimeout(respawn, 15000);
            return;
        }
    }, 500);
}

export async function walkToGroupLead(broadcast: BroadCastHandler) {
    if (character.rip) {
        setTimeout(respawn, 15000);
        return;
    }
    if (is_moving(character)) {
        return;
    }
    if (character.name === partyLeader) {
        //I'm leader, no need to follow myself
        return;
    }
    set_message('to leader')
    let lastDistanceCheckToLeader = +getValue("lastDistanceCheckToLeader-" + character.name);
    if (Date.now() - lastDistanceCheckToLeader < 10_000) {
        // reduce the number of checks, the distance will not change every ms.
        // log("not doing distance check")
        return;
    }
    setValue("lastDistanceCheckToLeader-" + character.name, "" + Date.now());
    // if (character.name === partyMerchant) {
    //   log("walkToGroupLead " + lastDistanceCheckToLeader);
    // }


    if (character.bank) {
        if (!smart.moving) {
            await smart_move("main")
            return;
        }
    }

    let mainChar = getCharacter(partyLeader);
    if (!mainChar) {
        // log("Leader '" + partyLeader + "' not in sight, checking last broadcast.");
        let me = getCharacter(character.name)!;
        let dX = Math.abs(broadcast.lastLeaderPosition.x - me.x);
        let dY = Math.abs(broadcast.lastLeaderPosition.y - me.y);
        let dist = Math.sqrt(dX * dX + dY * dY);
        if (dist > 150) {
            smart_move({x: broadcast.lastLeaderPosition.x + 5, y: broadcast.lastLeaderPosition.y + 5});
        }

    } else {
        let dist = simple_distance(mainChar, getCharacter(character.name));
        if (dist > 150) {
            smart_move({x: mainChar.real_x || 5, y: mainChar.real_y || 5});
        }
    }


    // log("calc distance");
    // console.error("distance=" + dist);
    // log("distance=" + dist);
}


export function determineMonsterTypeMatchingLevel(): string {
    let rc;
    if (character.level < 30) {
        rc = "goo";
    } else if (character.level < 35) {
        rc = "crab";
    } else if (character.level < 40) {
        rc = "bee";
    } else if (character.level < 50) {
        rc = "tortoise";
    } else if (character.level < 70) {
        rc = "pppompom";
    } else {
        rc = "spider";
    }

    //manual overrride
    rc = "spider";
    rc = "bee";
    rc = "crab";

    return rc;

}

export function usePotionIfNeeded(): void {
    let oneSecond = 1_000;
    let msSinceLastRegen = Date.now()-lastRegeneration;
    let isMoreThan_1Sec = msSinceLastRegen > oneSecond;
    let isMoreThan_2Sec = msSinceLastRegen > 2*oneSecond;

    if (character.hp / character.max_hp <= .6 && isMoreThan_1Sec) {
        use("use_hp");
        lastRegeneration = Date.now();
    } else if (character.mp / character.max_mp <= .6 && isMoreThan_1Sec) {
        use("use_mp");
        lastRegeneration = Date.now();
    } else if (character.hp / character.max_hp < .99 && isMoreThan_2Sec) {
        use_skill("regen_hp");
        lastRegeneration = Date.now();
    } else if (character.mp / character.max_mp < .99 && isMoreThan_2Sec) {
        use_skill("regen_mp");
        lastRegeneration = Date.now();
    }

}

export async function attackClosestMonster(mon_type: string): Promise<void> {
    const target = get_nearest_monster({no_target: true, type: mon_type});

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

// export function inviteToParty(name: string): void {
//   if (!get_player(name)) {
//     return;
//   }
//
//   if (!get_player(name)!.party || get_player(name)!.party !== character.name) {
//     send_party_invite(name);
//   }
// }

export function startPartyInvite() {
    setInterval(() => {
        config.myHelpers.forEach((name) => {
            if (!parent.party.hasOwnProperty(name) && getCharacter(name) != null && character.name != name) {
                log("Sending Invite to: " + name);
                send_party_invite(name);
            }
        });
    }, 30_000);
}

export function getCharacter(name: string): Entity | undefined {
    if (parent.caracAL) {
        // const candidate = parent.X.characters.find(x => x.name === name);
        // console.log('no idea how to do this');
        return get_player(name);
    } else if (top) {
        // @ts-ignore
        for (const iframe of top.$("iframe")) {
            let char = iframe.contentWindow.character;
            if (!char) continue; // Character isn't loaded yet
            if (char.name === name) {
                return char;
            }
        }
        return undefined;
    } else {
        console.log('TODO');
        return get_player(name);
    }
}

export function getCharacterPosition(name: string): { x: number, y: number } | undefined {
    if (parent.caracAL) {
        const candidate = parent.X.characters.find(x => x.name === name);
        if (candidate) {
            return {x: candidate.x, y: candidate.y};
        }
    } else if (top) {
        // @ts-ignore
        for (const iframe of top.$("iframe")) {
            let char = iframe.contentWindow.character;
            if (!char) continue; // Character isn't loaded yet
            if (char.name === name) {
                return char;
            }
        }
        return undefined;
    } else {
        console.log('TODO');
        return undefined;
    }
}

export function getInventorySlotOfItem(itemName: string) {
    for (let i = 0; i < character.items.length; i++) {
        if (character.items[i] && character.items[i]!.name === itemName) {
            return i;
        }
    }
}

