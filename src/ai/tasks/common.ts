import config, {getValue, partyLeader, partyMerchant, setValue, Stocks} from "../config";
import {Entity} from "../../definitions/game";
import {BroadCastHandler} from "./broadcasts";
import {TargetInformation} from "../combat/target-information";
import {HuntingHandler} from "./hunting";

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


export function getFarmingLocationForMonsterType(huntType: string): { map: string, x: number, y: number } | undefined {
    // wild boars
    // private farmingLocation: { map: string, x: number, y: number } = {map: 'winterland', x: -160, y: -1000};
    // event
    // private farmingLocation: { map: string, x: number, y: number } = {map: 'main', x: -1139, y: 1685};

    let farmingLocation = undefined;

    switch (huntType) {
        case "bee":
            farmingLocation = {map: 'main', x: 546, y: 1059};
            break;
        case "porcupine":
            //danger
            farmingLocation = {map: 'desertland', x: -842, y: 130};
            break;
        // case "XXX":
        //     farmingLocation = {map: 'main', x: , y: };
        //     break;
        // case "scorpion":
        //     farmingLocation = {map: 'main', x: , y: };
        //     break;
        case "goo":
            farmingLocation = {map: 'main', x: 16, y: 723};
            break;
        case "spider":
            farmingLocation = {map: 'main', x: 817, y: -339};
            break;
        case "armadillo":
            farmingLocation = {map: 'main', x: 518, y: 1849};
            break;
        case "squid":
        case "squidtoad":
            farmingLocation = {map: 'main', x: -1143, y: 538};
            break;
        case "croc":
            farmingLocation = {map: 'main', x: 920, y: 1650};
            break;
        case "osnake":
        case "snake":
            farmingLocation = {map: 'halloween', x: 320, y: -670};
            break;
        case "minimush":
            farmingLocation = {map: 'halloween', x: 130, y: 600};
            break;
        case "poisio":
            farmingLocation = {map: 'main', x: -252, y: 1424};
            break;
        case "arcticbee":
            farmingLocation = {map: 'winterland', x: 1108, y: -900};
            break;
        // case "stoneworm":
        // too hard
        //     farmingLocation = {map: 'spookytown', x: 823, y: 157};
        //     break;
        case "tortoise":
        case "frog":
            farmingLocation = {map: 'main', x: -1124, y: 1118};
            break;
        case "crab":
            farmingLocation = {map: 'main', x: -1213, y: -108};
            break;
        case "default":
        case "iceroamer":
            farmingLocation = {map: 'winterland', x: 635, y: -6};
            break;
    }
    return farmingLocation;
}

export async function determineMonsterTypeMatchingLevel(huntingHandler: HuntingHandler): Promise<TargetInformation> {
    let rc: TargetInformation = {
        mon_type: '',
        allAttackSameTarget: false,
        farmingLocation: getFarmingLocationForMonsterType('default'),
        // farmingLocation: {map: 'winterland', x: 1108, y: -900},
    };

    const huntType = await huntingHandler.getTypOfMonsterToHunt();
    // console.log('huntType', huntType);
    if (!huntType) {
        return rc;
    }
    rc.farmingLocation = getFarmingLocationForMonsterType(huntType);
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


export async function smart_move_half_way(to: { map: string, x: number, y: number }) {
    let x = ((character.real_x || character.x) + to.x) / 2;
    let y = ((character.real_y || character.y) + to.y) / 2;
    try {
        return smart_move({map: to.map, x: x, y: y})
    } catch (e: any) {
        console.log('error smart move', e);
        if (e && e.reason && e.reason === 'failed') {
            await smart_move(to);
        }
    }
}

export async function move_half_way(to: { x: number, y: number }) {
    let x = ((character.real_x || character.x) + to.x) / 2;
    let y = ((character.real_y || character.y) + to.y) / 2;
    return move(x, y)
}

export function getInventorySlotOfItem(itemName: string) {
    for (let i = 0; i < character.items.length; i++) {
        if (character.items[i] && character.items[i]!.name === itemName) {
            return i;
        }
    }
}

export function calculate_item_grade(def: any, level: number) {
    if (!(def.upgrade || def.compound)) return 0;
    if (level >= (def.grades || [9, 10, 11, 12])[3]) return 4;
    if (level >= (def.grades || [9, 10, 11, 12])[2]) return 3;
    if (level >= (def.grades || [9, 10, 11, 12])[1]) return 2;
    if (level >= (def.grades || [9, 10, 11, 12])[0]) return 1;
    return 0;
}
