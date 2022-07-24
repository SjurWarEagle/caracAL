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
import {StatisticDistributor} from "../tasks/statistic";
import {Tools} from "../../tools";
import {EquipmentHandler} from "../tasks/equipment";
import {ResourceGathering} from "../tasks/resource-gathering";
import {JustRunAway} from "../combat/just-run-away";
import {AbstractCombat} from "../combat/abstract-combat";
import {CharAvgCollector} from "../tasks/char-avg-collector";

let lastCheckActivity = 0;

export class Merchant {
    public currentActivity: PlayerActivity = "COMBAT";
    protected broadcastHandler = new BroadCastHandler();
    protected resourceGathering = new ResourceGathering();
    protected equipmentHandler = new EquipmentHandler();
    protected shoppingHandler = new ShoppingHandler();
    protected statisticDistributor = new StatisticDistributor(new CharAvgCollector());
    protected huntingHandler = new HuntingHandler(this.broadcastHandler);
    protected combatStrategy: AbstractCombat = new JustRunAway(this.huntingHandler, this.broadcastHandler);
    protected stockMonitor = new StockMonitor(this.broadcastHandler);

    private async needDepositToBank(): Promise<boolean> {
        if (character.gold < 1_000_000) {
            return false;
        }
        if (character.gold < 1_000_000 && character.bank) {
            set_message('leave bank')
            await smart_move("main")
            return false;
        }
        if (character.bank) {
            await this.depositStuffIntoBank();
            return true;
        } else {
            set_message('to bank')
            await smart_move("bank", async () => {
                await this.depositStuffIntoBank();
            });
            return true;
        }
    }


    async start() {
        await this.statisticDistributor.startPublishingGlobalData();
        await this.statisticDistributor.startPublishingCharSpecificData();
        await this.statisticDistributor.startPublishingCharAvgData();

        await this.equipmentHandler.startBeNotNaked();

        await this.stockMonitor.startCollectingRequests();
        this.broadcastHandler.listenForLastLeaderPosition();
        this.huntingHandler.receiveBroadCastHunts();

        setInterval(async () => {
            // await new Tools().sortBank();
            await new Tools().sortInventory();
        }, 1_000);

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


            console.log('sell:'+await this.equipmentHandler.getNumberOfStuffToSell());
            if ((await this.equipmentHandler.getNumberOfStuffToSell()) >= 5) {
                // console.log('going to combine');
                set_message('💲');
                if (!smart.moving) {
                    await smart_move('compound', async () => {
                        await this.equipmentHandler.sellStuff();
                    });
                }
                return;
            }
            if ((await this.equipmentHandler.getNumberOfPossibleUpgradeActions()) >= 2) {
                // console.log('going to combine');
                set_message('🔂');
                if (!smart.moving && !character.q.compound) {
                    // not moving and not combining
                    await smart_move('compound', async () => {
                        await this.equipmentHandler.performRandomCompound();
                    });
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
                if (await this.needDepositToBank()) {
                    await set_message("bank ops")
                    return;
                }
                await walkToGroupLead(this.broadcastHandler);
                await this.combatStrategy.attack();
            }
        }, 200);

    }

    private async depositStuffIntoBank(): Promise<void> {
        await bank_deposit(character.gold - 500_000);
        await this.statisticDistributor.publishBankContent();

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
