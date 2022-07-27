import {
    determineMonsterTypeMatchingLevel,
    PlayerActivity,
    startAcceptingInvites,
    startRevive,
    startTransferLootToMerchant,
    usePotionIfNeeded,
    walkToGroupLead
} from "../tasks/common";
import {StatisticDistributor} from "../tasks/statistic";
import {BroadCastHandler} from "../tasks/broadcasts";
import {HuntingHandler} from "../tasks/hunting";
import {StockMonitor} from "../tasks/restock";
import {ShoppingHandler} from "../tasks/shopping";
import {EquipmentHandler} from "../tasks/equipment";
import {AbstractCombat} from "../combat/abstract-combat";
import {CharAvgCollector} from "../tasks/char-avg-collector";
import {TrackTrixCollector} from "../tasks/track-trix-collector";


export abstract class Fighter {
    protected currentActivity: PlayerActivity = "COMBAT";
    protected broadcastHandler = new BroadCastHandler();
    protected charAvgCollector: CharAvgCollector = new CharAvgCollector();
    protected huntingHandler = new HuntingHandler(this.broadcastHandler);
    protected combatStrategy?: AbstractCombat | undefined;
    protected equipmentHandler = new EquipmentHandler();
    protected shoppingHandler = new ShoppingHandler();
    protected trackTrixCollector = new TrackTrixCollector;
    protected statisticDistributor = new StatisticDistributor(new CharAvgCollector(), this.trackTrixCollector);
    protected stockMonitor = new StockMonitor(this.broadcastHandler);


    protected constructor() {
        this.statisticDistributor.startPublishingCharSpecificData();
        this.statisticDistributor.startPublishingCharAvgData();

        this.broadcastHandler.listenForLastLeaderPosition();
        this.broadcastHandler.listenForTarget();
        this.huntingHandler.startBroadCastHunts();

        this.stockMonitor.startWatchingInventoryStock();
        this.equipmentHandler.startBeNotNaked();
        this.charAvgCollector.startCollecting();

        startRevive();
        startTransferLootToMerchant();
        startAcceptingInvites();
        // this.shoppingHandler.startRequestingCommonStuff(character);

        setInterval(async () => {
            if (character.rip) {
                setTimeout(respawn, 15000);
                return;
            }

            usePotionIfNeeded();
            loot();

            if (await this.performRoleSpecificTasks()) {
                return;
            }

            if (this.huntingHandler.getNewHuntingQuest()) {
                set_message('➕🏹');
                return;
            }
            if (await this.huntingHandler.finishHuntingQuestIfDone()) {
                set_message('🆗🏹');
                return;
            }

            if (this.currentActivity !== "COMBAT") {
                return;
            }

            if (await this.huntingHandler.huntForQuest()) {
                return;
            }
            await walkToGroupLead(this.broadcastHandler);
            set_message('⚔')


            if (this.combatStrategy) {
                await this.combatStrategy.setTargetInfo(determineMonsterTypeMatchingLevel());
                await this.combatStrategy.attack();
            }
        }, (character.ping || 100) * 2);

    }

    abstract performRoleSpecificTasks(): Promise<boolean>;
}

