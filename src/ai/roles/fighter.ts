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
import {BasicCombat} from "../combat/basic-combat";
import {AbstractCombat} from "../combat/abstract-combat";
import {CharAvgCollector} from "../tasks/char-avg-collector";


export class Fighter {
    protected currentActivity: PlayerActivity = "COMBAT";
    protected broadcastHandler = new BroadCastHandler();
    protected charAvgCollector: CharAvgCollector = new CharAvgCollector();
    protected huntingHandler = new HuntingHandler(this.broadcastHandler);
    protected combatStrategy: AbstractCombat = new BasicCombat(this.huntingHandler);
    protected equipmentHandler = new EquipmentHandler();
    protected shoppingHandler = new ShoppingHandler();
    protected statisticDistributor = new StatisticDistributor(new CharAvgCollector());
    protected stockMonitor = new StockMonitor(this.broadcastHandler);


    constructor() {
        this.statisticDistributor.startPublishingCharSpecificData();
        this.statisticDistributor.startPublishingCharAvgData();

        let broadcast = new BroadCastHandler();
        broadcast.listenForLastLeaderPosition();
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
                set_message('🏹');
                return;
            }
            await walkToGroupLead(broadcast);
            set_message('⚔')


            await this.combatStrategy.setTargetInfo({
                mon_type: determineMonsterTypeMatchingLevel(),
                allAttackSameTarget: false,
            });
            await this.combatStrategy.attack();
        }, (character.ping || 100) * 2);

    }
}

