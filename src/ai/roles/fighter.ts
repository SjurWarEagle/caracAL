import {
    determineMonsterTypeMatchingLevel,
    PlayerActivity,
    startAcceptingInvites,
    startRevive,
    startTransferLootToMerchant,
    usePotionIfNeeded,
    walkToGroupLead
} from "../tasks/common";
import {startReportingGrafana} from "../tasks/statistic";
import {BroadCastHandler} from "../tasks/broadcasts";
import {HuntingHandler} from "../tasks/hunting";
import {StockMonitor} from "../tasks/restock";
import {ShoppingHandler} from "../tasks/shopping";
import {EquipmentHandler} from "../tasks/equipment";
import {BasicCombat} from "../combat/basic-combat";
import {AbstractCombat} from "../combat/abstract-combat";


export class Fighter {
    protected currentActivity: PlayerActivity = "COMBAT";
    protected broadcastHandler = new BroadCastHandler();
    protected combatStrategy: AbstractCombat = new BasicCombat();
    protected equipmentHandler = new EquipmentHandler();
    protected shoppingHandler = new ShoppingHandler();
    protected huntingHandler = new HuntingHandler(this.broadcastHandler);
    protected stockMonitor = new StockMonitor(this.broadcastHandler);


    constructor() {
        let broadcast = new BroadCastHandler();
        broadcast.listenForLastLeaderPosition();
        this.huntingHandler.startBroadCastHunts();

        this.stockMonitor.startWatchingInventoryStock();
        this.equipmentHandler.startBeNotNaked();

        startReportingGrafana();
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
            if (this.huntingHandler.finishHuntingQuestIfDone()) {
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

