import {
    ACTIVE_HUNT_INFO,
    ACTIVE_HUNT_MISSING,
    getCharacter,
    getFarmingLocationForMonsterType,
    myDistance
} from "./common";
import {partyLeader} from "../config";
import {BroadCastHandler} from "./broadcasts";
import {BuffInfo} from "../../definitions/game";

// @ts-ignore
let daisy = parent.G.maps.main.npcs[23];
let monsterHunterLocations = {
    x: daisy.position[0],
    y: daisy.position[1] + 10
};


export class HuntingHandler {
    private rememberedHunts: { [char: string]: BuffInfo | undefined } = {};
    public whiteListHuntingTargets: string[] = ["goo", 'bee', 'chicken', 'bee', 'arcticbee', 'snake', 'osname'];

    // frog - only if ranges char, evade is too much
    // 'snake','croc' - are at high level a bit too hard :(
    // 'tortoise' hitting too hard
    private currentHuntTarget?: string;

    constructor(private broadcasthandler: BroadCastHandler) {
    }

    public async getTypOfMonsterToHunt(): Promise<string | undefined> {
        // use old target if still valid to avoid hopping between the targets and so only running around
        if (this.currentHuntTarget) {
            if (this.checkIfHuntTargetStillValid()) {
                return this.currentHuntTarget;
            } else {
                this.currentHuntTarget = undefined;
            }
        }
        this.currentHuntTarget = this.getNewHuntTarget();
        return this.currentHuntTarget;
    }

    public receiveBroadCastHunts() {
        this.broadcasthandler.receiveBroadCastHunts();
        character.on("cm", (msg) => {
            // @ts-ignore
            const data = JSON.parse(msg.message);
            if (data.type === ACTIVE_HUNT_MISSING) {
                this.rememberedHunts[msg.name] = undefined;
            } else if (data.type === ACTIVE_HUNT_INFO) {
                // @ts-ignore
                this.rememberedHunts[msg.name] = data;
            }
        });
    }

    public startBroadCastHunts() {
        this.broadcasthandler.broadcastHunts(character.name)
        setInterval(() => {
            let me = getCharacter(character.name);
            // @ts-ignore
            let data = me.s["monsterhunt"];
            if (me && me.s && data) {
                data.type = ACTIVE_HUNT_INFO;
            } else {
                data = {};
                data.type = ACTIVE_HUNT_MISSING;
            }
            let msg = JSON.stringify(data)
            send_cm(partyLeader, msg);
        }, 1_000);
    }

    /**
     * @return if quest can be followed
     */
    public async huntForQuest(): Promise<boolean> {
        if (character.ctype == "merchant") {
            return false;
        }
        let me = getCharacter(character.name);
        if (!me || !me.s) {
            return false;
        }
        // @ts-ignore
        const hunt = me.s["monsterhunt"];

        if (!hunt) {
            return false;
        }

        // if ((hunt.c > 0) && this.whiteListHuntingTargets.indexOf(hunt.id) !== -1) {
        //     //attack is done by the common target-findinging in combat
        //     // await attackClosestMonster(hunt.id);
        //     return true;
        // }

        return false;
    }


    /**
     * @return if quest can be turned in
     */
    public async finishHuntingQuestIfDone(): Promise<boolean> {
        if (character.ctype == "merchant") {
            return false;
        }
        let me = getCharacter(character.name);
        if (!me || !me.s) {
            return false;
        }
        // @ts-ignore
        const hunt = me.s["monsterhunt"];

        if (!hunt) {
            return false;
        }
        if (hunt.c <= 0) {
            if (!smart.moving) {
                // console.log("turning in monsterhunter-quest, to main map");
                await smart_move('main', async () => {
                    // console.log("turning in monsterhunter-quest, to daisy");
                    await smart_move(monsterHunterLocations)
                });
            } else {
                // @ts-ignore
                parent.socket.emit("monsterhunt");
            }
            return true;
        }
        return false;
    }

    public getNewHuntingQuest(): boolean {
        if (character.ctype == "merchant") {
            return false;
        }
        let me = getCharacter(character.name);
        if (!me || !me.s) {
            return false;
        }

        // @ts-ignore
        if (!me.s["monsterhunt"]) {
            // @ts-ignore
            // console.log(monsterHunterLocations);
            if (!smart.moving) {
                console.log("fetching new monsterhunter-quest");
                smart_move('main', () => {
                    smart_move(monsterHunterLocations);
                });
            } else {
                if (myDistance(character, monsterHunterLocations) < 50) {
                    // @ts-ignore
                    parent.socket.emit("monsterhunt");
                    setTimeout(() => {
                        // @ts-ignore
                        parent.socket.emit("monsterhunt");
                    }, (character.ping || 100) * 2);
                }
            }
            return true;
        } else {
            // let hunt = me.s["monsterhunt"];
            // @ts-ignore
            // log("Have:" + hunt.id, "(" + hunt.c + ")");
        }
        return false;
    }

    private checkIfHuntTargetStillValid(): boolean {
        for (let char of Object.keys(this.rememberedHunts)) {
            const hunt = this.rememberedHunts[char];

            if (hunt && hunt.id === this.currentHuntTarget
                && this.currentHuntTarget
                && hunt.c
                && hunt.c > 0) {
                // someone needs what we currently hunt, so all ok
                return true;
            }
        }
        return false;

    }

    private getNewHuntTarget(): string | undefined {
        for (let char of Object.keys(this.rememberedHunts)) {
            const hunt = this.rememberedHunts[char];
            // console.log(char, 'hunt', hunt);

            if (hunt
                && hunt.id
                && hunt.c
                //we know where to hunt
                && getFarmingLocationForMonsterType(hunt.id)
                && hunt.c > 0) {
                // someone needs what we currently hunt, so all ok
                return hunt.id!;
            }
        }
        return undefined;
    }
}
