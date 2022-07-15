import {
    attackClosestMonster,
    determineMonsterTypeMatchingLevel,
    PlayerActivity,
    startAcceptingInvites,
    startRevive,
    startSelfHeal,
    startTransferLootToMerchant,
    usePotionIfNeeded,
    walkToGroupLead
} from "../tasks/common";
import {startRequestingCommonStuff} from "../tasks/shopping";
import {startReportingGrafana} from "../tasks/statistic";
import {BroadCastHandler} from "../tasks/broadcasts";
import {HuntingHandler} from "../tasks/hunting";
import {StockMonitor} from "../tasks/restock";


export class Fighter {
    protected currentActivity: PlayerActivity = "COMBAT";
    protected broadcastHandler = new BroadCastHandler();
    protected huntingHandler = new HuntingHandler(this.broadcastHandler);
    protected stockMonitor = new StockMonitor(this.broadcastHandler);


    constructor() {
        let broadcast = new BroadCastHandler();
        broadcast.listenForLastLeaderPosition();
        this.huntingHandler.startBroadCastHunts();

        this.stockMonitor.startWatchingInventoryStock();

        startReportingGrafana();
        startRevive();
        startSelfHeal();
        startTransferLootToMerchant();
        startAcceptingInvites();
        startRequestingCommonStuff(character);

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

            await attackClosestMonster(determineMonsterTypeMatchingLevel());
        }, (character.ping || 100) * 2);

    }
}

