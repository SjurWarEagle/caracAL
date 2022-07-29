import config, {getValue, partyLeader, partyMerchant, setValue, Stocks} from "../config";
import {Entity} from "../../definitions/game";
import {BroadCastHandler} from "./broadcasts";
import {TargetInformation} from "../combat/target-information";

export const ACTIVE_HUNT_INFO = 'ACTIVE_HUNT_INFO';
export const ACTIVE_HUNT_MISSING = 'ACTIVE_HUNT_MISSING';
export type PlayerActivity = "COMBAT" | "SHOPPING";
export let minutes = 1_000 * 60 * 5;
let lastRegeneration = 0;

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

function sendItemsToMerchant(merchant: Entity) {
    for (let idxInventory = 0; idxInventory < character.items.length - 1; idxInventory++) {
        const item = character.items[idxInventory];
        if (!item) {
            continue;
        }
        let itemName = item.name;

        if (item.name === 'tracker') {
            let currentTracker = getStock('tracker')
            // console.log(character.name + ': tracker ' + currentTracker);
            if (currentTracker > 1) {
                send_item(merchant, idxInventory, 1);
            }
        } else if (itemName === "mpot0") {
            let amount = item.q || 0;
            amount = Math.max(0, amount - Stocks.minCntMP0);
            if (amount > 0) {
                send_item(merchant, idxInventory, amount);
            }
        } else if (itemName === "hpot0") {
            let amount = item.q || 0;
            amount = Math.max(0, amount - Stocks.minCntHP0);
            if (amount > 0) {
                send_item(merchant, idxInventory, amount);
            }
        } else if (itemName === "mpot1") {
            let amount = item.q || 0;
            amount = Math.max(0, amount - Stocks.minCntMP1);
            if (amount > 0) {
                send_item(merchant, idxInventory, amount);
            }
        } else if (itemName === "hpot1") {
            let amount = item.q || 0;
            amount = Math.max(0, amount - Stocks.minCntHP1);
            if (amount > 0) {
                send_item(merchant, idxInventory, amount);
            }
        } else {
            let amount = item.q || 1;
            // console.log(item.name);
            // console.log('send_item(',merchant.name,', ',idxInventory,',', amount,');');
            if (amount > 0) {
                send_item(merchant, idxInventory, amount);
            }
        }
    }
}

export function startTransferLootToMerchant(): void { // called by the inviter's name
    setInterval(function () {
        // console.log('startTransferLootToMerchant');
        let merchant = getCharacter(partyMerchant);
        if (!merchant) {
            // console.log('startTransferLootToMerchant merchant ' + partyMerchant + ' not found');
            return;
        }
        const dist = simple_distance(merchant, character);
        // console.log('startTransferLootToMerchant.distance', dist);
        if (dist > 200) {
            // console.log('startTransferLootToMerchant merchant not close');
            return;
        }

        let amount = 100_000;
        if (character.gold >= amount) {
            send_gold(merchant, amount);
        }
        sendItemsToMerchant(merchant);
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
    if (is_moving(character)) {
        return;
    }
    if (character.name === partyLeader) {
        //I'm leader, no need to follow myself
        return;
    }
    set_message('to leader')
    let lastDistanceCheckToLeader = +getValue("lastDistanceCheckToLeader-" + character.name);
    if (Date.now() - lastDistanceCheckToLeader < 1_000) {
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
    if (mainChar) {
        if (character.map === mainChar.map) {
            let dist = simple_distance(mainChar, getCharacter(character.name));
            if (dist > 150) {
                move(mainChar.real_x || mainChar.x || 5, mainChar.real_y || mainChar.y || 5);
            }
        } else {
            await smart_move({
                map: mainChar.map,
                x: mainChar.real_x || mainChar.x || 5,
                y: mainChar.real_y || mainChar.y || 5
            });
        }
    } else {
        // log("Leader '" + partyLeader + "' not in sight, checking last broadcast.");
        let me = getCharacter(character.name)!;
        let dX = Math.abs(broadcast.lastLeaderPosition.x - me.x);
        let dY = Math.abs(broadcast.lastLeaderPosition.y - me.y);
        let dist = Math.sqrt(dX * dX + dY * dY);
        if (character.map !== broadcast.lastLeaderPosition.map) {
            await smart_move({
                map: broadcast.lastLeaderPosition.map,
                x: broadcast.lastLeaderPosition.x + 5,
                y: broadcast.lastLeaderPosition.y + 5
            });
        }
        if (character.map === broadcast.lastLeaderPosition.map && dist > 250) {
            await smart_move({
                map: broadcast.lastLeaderPosition.map,
                x: broadcast.lastLeaderPosition.x + 5,
                y: broadcast.lastLeaderPosition.y + 5
            });
        }
    }


    // log("calc distance");
    // console.error("distance=" + dist);
    // log("distance=" + dist);
}


export function determineMonsterTypeMatchingLevel(): TargetInformation {
    let rc: TargetInformation = {
        mon_type: '',
        allAttackSameTarget: true
    };
    if (character.level < 30) {
        rc.mon_type = "goo";
    } else if (character.level < 35) {
        rc.mon_type = "crab";
    } else if (character.level < 40) {
        rc.mon_type = "bee";
    } else if (character.level < 50) {
        rc.mon_type = "tortoise";
    } else if (character.level < 60) {
        rc.mon_type = "spider";
    } else if (character.level < 70) {
        rc.mon_type = "pppompom";
    } else {
        rc.mon_type = "spider";
    }

    //manual overrride
    // rc.allAttackSameTarget = true;
    rc.allAttackSameTarget = false;
    // rc.mon_type = "phoenix";
    // rc.mon_type = "spider";
    // rc.mon_type = "bee";
    rc.mon_type = "croc";
    // rc.mon_type = "goo";
    // rc.mon_type = "armadillo";
    // rc.mon_type = "osnake";
    // rc.mon_type = "snake";
    // rc.mon_type = "tortoise";
    // rc.mon_type = "minimush";

    return rc;

}

export function usePotionIfNeeded(): void {
    let oneSecond = 1_000;
    let msSinceLastRegen = Date.now() - lastRegeneration;
    let isMoreThan_1Sec = msSinceLastRegen > oneSecond;
    let isMoreThan_2Sec = msSinceLastRegen > 2 * oneSecond;

    if (character.hp / character.max_hp <= .3 && isMoreThan_1Sec) {
        consume(locate_item("hpot1"));
        lastRegeneration = Date.now();
    } else if (character.mp / character.max_mp <= .3 && isMoreThan_1Sec) {
        consume(locate_item("mpot1"));
        lastRegeneration = Date.now();
    } else if (character.hp / character.max_hp <= .6 && isMoreThan_1Sec) {
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
    let char = get_player(name);
    if (char) {
        return char;
    }
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

//FIXME duplicate with shopping.ts
export function getStock(itemName: string): number {
    let candidates = character.items.filter((item) => {
        return !!(item && (item.name === itemName));
    });

    let available = 0;
    if (candidates) {
        for (let candidate of candidates) {
            if (candidate) {
                available = +(candidate.q || 1);
            }
        }
    }
    return available;
}


//TODO rename this into something useful
export function myDistance(from: Entity, to: { x: number, y: number }): number {
    let dX = Math.abs((to.x || 0) - (from.real_x || from.x));
    let dY = Math.abs((to.y || 0) - (from.real_y || from.y));
    // noinspection UnnecessaryLocalVariableJS
    let dist = Math.sqrt(dX * dX + dY * dY);// c^2=a^2+b^2
    return dist;
}


export function getInventorySlotOfItem(itemName: string) {
    for (let i = 0; i < character.items.length; i++) {
        if (character.items[i] && character.items[i]!.name === itemName) {
            return i;
        }
    }
}
