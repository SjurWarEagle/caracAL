import {partyMerchant, Stocks} from "../config";
import {BroadCastHandler, SupplyOrder} from "./broadcasts";
import {getCharacter, getInventorySlotOfItem, getStock} from "./common";

export class StockMonitor {

    private openRequests = new Map<string, Map<string, number>>();

    constructor(private broadCastHandler: BroadCastHandler) {
    }

    public async startDistributeOrders() {
        setInterval(() => {

            const merchant = getCharacter(partyMerchant);
            if (!merchant) {
                return;
            }

            this.openRequests.forEach((value, requesterName) => {
                let requester = get_player(requesterName);
                if (!requester) {
                    // not close by
                    // console.log('requester not close by');
                    return;
                }
                value.forEach((cnt, itemName) => {
                    if (requesterName === partyMerchant) {
                        return;
                    }
                    const target = get_player(requesterName);
                    //check target range
                    const slot = getInventorySlotOfItem(itemName);
                    if (target && slot !== undefined) {
                        send_item(target, slot, cnt);
                        // remove supply-request because it's done now
                        this.openRequests.get(requesterName)!.delete(itemName);
                        if (this.openRequests.get(requesterName) && this.openRequests.get(requesterName)!.size == 0) {
                            this.openRequests.delete(requesterName);
                        }
                    }
                })
            });
        }, 10_000);
    }


    public async startCollectingRequests(): Promise<void> {
        character.on("cm", (msg) => {
            const data: SupplyOrder = JSON.parse(msg.message);
            if (data.msgType !== BroadCastHandler.BROADCAST_ORDER_ITEM) {
                return;
            }
            if (!this.openRequests.get(data.requesterName)) {
                this.openRequests.set(data.requesterName, new Map())
            }
            this.openRequests.get(data.requesterName)!.set(data.itemName, data.cnt);
        });
    }

    public async startWatchingInventoryStock(): Promise<void> {
        setInterval(async () => {

            let currentTracker = getStock('tracker')
            if (currentTracker < 1) {
                await this.broadCastHandler.orderItems(partyMerchant, 1, 'tracker', character.name);
            }
            let currentCntHP0 = getStock('hpot0')
            if (currentCntHP0 < Stocks.minCntHP0) {
                await this.broadCastHandler.orderItems(partyMerchant, Stocks.minCntHP0 - currentCntHP0, 'hpot0', character.name);
            }
            let currentCntHP1 = getStock('hpot1')
            if (currentCntHP1 < Stocks.minCntHP1) {
                await this.broadCastHandler.orderItems(partyMerchant, Stocks.minCntHP1 - currentCntHP1, 'hpot1', character.name);
            }
            let currentCntMP0 = getStock('mpot0')
            if (currentCntMP0 < Stocks.minCntMP0) {
                await this.broadCastHandler.orderItems(partyMerchant, Stocks.minCntMP0 - currentCntMP0, 'mpot0', character.name);
            }
            let currentCntMP1 = getStock('mpot1')
            if (currentCntMP1 < Stocks.minCntMP1) {
                await this.broadCastHandler.orderItems(partyMerchant, Stocks.minCntMP1 - currentCntMP1, 'mpot1', character.name);
            }
        }, 10_000)
    }
}

