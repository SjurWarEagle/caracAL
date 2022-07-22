import {ACTIVE_HUNT_INFO, ACTIVE_HUNT_MISSING, getCharacter} from "./common";
import config, {partyMerchant} from "../config";
import {BroadCastHandler} from "./broadcasts";

// @ts-ignore
let daisy = parent.G.maps.main.npcs[23];
let monsterHunterLocations = {
    x: daisy.position[0],
    y: daisy.position[1]
};

const rememberedHunts: { [char: string]: any } = {};

export class HuntingHandler {
    public whiteListHuntingTargets: string[] = ["goo", 'bee', 'chicken'];

    // frog - only if ranges char, evade is too much

    constructor(private broadcasthandler: BroadCastHandler) {
    }

    public receiveBroadCastHunts() {
        this.broadcasthandler.receiveBroadCastHunts();
        character.on("cm", (msg) => {
            // @ts-ignore
            const data = JSON.parse(msg.message);
            if (data.type === ACTIVE_HUNT_MISSING) {
                rememberedHunts[msg.name] = undefined;
            } else if (data.type === ACTIVE_HUNT_INFO) {
                // @ts-ignore
                rememberedHunts[msg.name] = data;
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
            // console.log('msg',msg);
            send_cm(partyMerchant, msg);
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
                await smart_move('main', () => {
                    // console.log("turning in monsterhunter-quest, to daisy");
                    smart_move(monsterHunterLocations)
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
                log("fetching new monsterhunter-quest");
                smart_move('main', () => {
                    smart_move(monsterHunterLocations);
                });
            } else {
                // if (is_in_range(daisy)) {
                // @ts-ignore
                parent.socket.emit("monsterhunt");
                setTimeout(() => {
                    // @ts-ignore
                    parent.socket.emit("monsterhunt");
                }, (character.ping || 100) * 2);
                // }
            }
            return true;
        } else {
            // let hunt = me.s["monsterhunt"];
            // @ts-ignore
            // log("Have:" + hunt.id, "(" + hunt.c + ")");
        }
        return false;
    }

    public reportHunts() {
        let report = "\n";
        report
            += "+ " + "-".padEnd(10, "-")
            + " + " + "-".padEnd(10, "-")
            + " + " + "-".padStart(10, "-")
            + " + " + "-".padStart(10, "-")
            + " +\n";
        report
            += "| " + "Char".padEnd(10)
            + " | " + "Target".padEnd(10)
            + " | " + "Cnt".padEnd(10)
            + " | " + "Duration".padEnd(10)
            + " |\n";
        report
            += "+ " + "-".padEnd(10, "-")
            + " + " + "-".padEnd(10, "-")
            + " + " + "-".padStart(10, "-")
            + " + " + "-".padStart(10, "-")
            + " +\n";

        config.myHelpers.forEach((name) => {
            const hunt = rememberedHunts[name];
            if (!hunt) {
                report
                    += "| " + name.padEnd(10)
                    + " | " + "<none>".padEnd(10)
                    + " | " + "<none>".padStart(10)
                    + " | " + "<none>".padStart(10)
                    + " |\n";
                return;
            }

            report
                += "| " + name.padEnd(10)
                + " | " + hunt.id.padEnd(10)
                + " | " + ("" + hunt.c).padStart(10)
                + " | " + (this.msToTime(hunt.ms)).padStart(10)
                + " |\n";
        });
        report
            += "+ " + "-".padEnd(10, "-")
            + " + " + "-".padEnd(10, "-")
            + " + " + "-".padStart(10, "-")
            + " + " + "-".padStart(10, "-")
            + " +\n";

        console.log(report);
    }

    private msToTime(duration: number) {
        // let milliseconds = Math.floor((duration % 1000) / 100);
        let seconds: string | number = Math.floor((duration / 1000) % 60);
        let minutes: string | number = Math.floor((duration / (1000 * 60)) % 60);
        let hours: string | number = Math.floor((duration / (1000 * 60 * 60)) % 24);

        hours = (hours < 10) ? "0" + hours : hours;
        minutes = (minutes < 10) ? "0" + minutes : minutes;
        seconds = (seconds < 10) ? "0" + seconds : seconds;

        return hours + ":" + minutes + ":" + seconds;
    }
}
