import {
    PlayerActivity, startAcceptingInvites, startBuffing, startRevive, startSelfHeal,
    usePotionIfNeeded,
    walkToGroupLead
} from "../tasks/common";
import {startRequestingCommonStuff, startTransferRequestedItemsToTeam, travelToCity} from "../tasks/shopping";
import {getValue} from "../config";
import {BroadCastHandler} from "../tasks/broadcasts";
import {HuntingHandler} from "../tasks/hunting";
import {startRestockMonitoring} from "../tasks/restock";
import {startReportingGrafana} from "../tasks/statistic";

// let currentActivity: PlayerActivity = "COMBAT";
let lastCheckActivity = 0;

export class Merchant {
    protected currentActivity: PlayerActivity = "COMBAT";
    protected broadcastHandler = new BroadCastHandler();
    protected huntingHandler = new HuntingHandler(this.broadcastHandler);

    constructor() {

    }

    start() {

        this.broadcastHandler.listenForLastLeaderPosition();
        this.huntingHandler.receiveBroadCastHunts();
        setInterval(() => {
            this.huntingHandler.reportHunts();
        }, 10_000);

        startReportingGrafana();
        startRevive();
        startSelfHeal();
        startBuffing();
        startAcceptingInvites();
        startRequestingCommonStuff(character);
        startTransferRequestedItemsToTeam();

        startRestockMonitoring();
        setInterval(() => {
            const newActivity = getValue("currentActivityMerchant") || this.currentActivity;
            if (newActivity !== this.currentActivity) {
                this.currentActivity = newActivity;
            }
            // log("currentActivityMerchant:" + this.currentActivity);
        }, 1_000);


        async function needDepositToBank() {
            if (character.gold < 1_000_000) {
                return false;
            }
            if (character.bank) {
                await bank_deposit(500_000);
                return true;
            } else {
                await smart_move("bank", async () => {
                    await bank_deposit(500_000);
                });
                return true;
            }
        }

        setInterval(async () => {

            if (character.rip) {
                setTimeout(respawn, 15000);
                return;
            }

            usePotionIfNeeded();
            loot();

            if (Date.now() - lastCheckActivity < 10_000) {
                return;
            } else {
                set_message('Code: ' + this.currentActivity);
                lastCheckActivity = Date.now();
                if (this.currentActivity === "SHOPPING") {
                    log(this.currentActivity + " === \"SHOPPING\" going to city");
                    travelToCity();
                    return;
                } else if (this.currentActivity !== "COMBAT") {
                    log(this.currentActivity + " !== \"COMBAT\" doing nothing");
                    return;
                }
                if (await needDepositToBank()) {
                    set_message("bank ops")
                    return;
                }
                walkToGroupLead(this.broadcastHandler);
            }
        }, 200);

    }
}

// noinspection JSUnusedLocalSymbols
/**
 * called by the inviter's name
 * @param name
 */
function on_party_invite(name: string) {
    accept_party_invite(name);
}


new Merchant().start();
