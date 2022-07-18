import {
    PlayerActivity,
    startAcceptingInvites,
    startBuffing,
    startRevive,
    usePotionIfNeeded,
    walkToGroupLead
} from "../tasks/common";
import {ShoppingHandler} from "../tasks/shopping";
import {getValue} from "../config";
import {BroadCastHandler} from "../tasks/broadcasts";
import {HuntingHandler} from "../tasks/hunting";
import {StockMonitor} from "../tasks/restock";
import {startReportingGrafana} from "../tasks/statistic";
import {Tools} from "../../tools";
import {EquipmentHandler} from "../tasks/equipment";
import {ResourceGathering} from "../tasks/resource-gathering";
import {ICombat} from "../combat/icombat";
import {JustRunAway} from "../combat/just-run-away";

let lastCheckActivity = 0;

export class Merchant {
    public currentActivity: PlayerActivity = "COMBAT";
    protected broadcastHandler = new BroadCastHandler();
    protected resourceGathering = new ResourceGathering();
    protected equipmentHandler = new EquipmentHandler();
    protected shoppingHandler = new ShoppingHandler();
    protected combatStrategy: ICombat = new JustRunAway();
    protected huntingHandler = new HuntingHandler(this.broadcastHandler);
    protected stockMonitor = new StockMonitor(this.broadcastHandler);

    async start() {
        await this.equipmentHandler.startBeNotNaked();

        await this.stockMonitor.startCollectingRequests();
        this.broadcastHandler.listenForLastLeaderPosition();
        this.huntingHandler.receiveBroadCastHunts();
        setInterval(() => {
            this.huntingHandler.reportHunts();
        }, 60_000);

        setInterval(() => {
            Tools.sortInventory();
        }, 60_000);

        startReportingGrafana();
        startRevive();
        startBuffing();
        startAcceptingInvites();
        // this.shoppingHandler.startRequestingCommonStuff(character);
        await this.stockMonitor.startDistributeOrders();

        this.shoppingHandler.startRestockMonitoring();
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
            if (character.gold < 1_000_000 && character.bank) {
                set_message('leave bank')
                await smart_move("main")
                return false;
            }
            if (character.bank) {
                await bank_deposit(500_000);
                return true;
            } else {
                set_message('to bank')
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

            if (await this.resourceGathering.isGatheringNeeded()) {
                if (character.mp < 120 && !character.c.mining) {
                    // regen mana, but do not abort mining!
                    usePotionIfNeeded();
                }
                return;
            }
            set_message('💰');

            usePotionIfNeeded();
            loot();

            if (Date.now() - lastCheckActivity < 10_000) {
                return;
            } else {
                set_message('Code: ' + this.currentActivity);
                lastCheckActivity = Date.now();
                if (this.currentActivity === "SHOPPING") {
                    log(this.currentActivity + " === \"SHOPPING\" going to city");
                    await this.shoppingHandler.travelToCity(this);
                    return;
                } else if (this.currentActivity !== "COMBAT") {
                    log(this.currentActivity + " !== \"COMBAT\" doing nothing");
                    return;
                }
                if (await needDepositToBank()) {
                    await set_message("bank ops")
                    return;
                }
                await walkToGroupLead(this.broadcastHandler);
                await this.combatStrategy.attack();
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
