import {partyMerchant, Stocks} from "../config";
import {BroadCastHandler, SupplyOrder} from "./broadcasts";
import {getCharacter, getInventorySlotOfItem} from "./common";

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
                // console.log('trying to distribute', requesterName, value);
                let requester = get_player(requesterName);
                if (!requester) {
                    // not close by
                    console.log('requester not close by');
                    return;
                }
                value.forEach((cnt, itemName) => {
                    if (requesterName === partyMerchant) {
                        return;
                    }
                    const target = get_player(requesterName);
                    //check target range
                    const slot = getInventorySlotOfItem(itemName);
                    // console.log(target, !!target);
                    // console.log(slot, !!slot);
                    if (target && slot !== undefined) {
                        console.log('Sending ' + cnt + 'x ' + itemName + ' from slot ' + slot + ' to ' + target.name);
                        send_item(target, slot, cnt);
                        // remove supply-request because it's done now
                        this.openRequests.get(requesterName)!.delete(itemName);
                        if (this.openRequests.get(requesterName) && this.openRequests.get(requesterName)!.size == 0) {
                            this.openRequests.delete(requesterName);
                        }
                    }
                })
            });
            // console.log(this.openRequests);
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
            // console.log(this.openRequests);
        });
    }

    public async startWatchingInventoryStock(): Promise<void> {
        setInterval(async () => {

            let currentTracker = this.getStock('tracker')
            if (currentTracker < 1) {
                await this.broadCastHandler.orderItems(partyMerchant, 1, 'tracker', character.name);
            }
            let currentCntHP0 = this.getStock('hpot0')
            if (currentCntHP0 < Stocks.minCntHP0) {
                await this.broadCastHandler.orderItems(partyMerchant, Stocks.minCntHP0 - currentCntHP0, 'hpot0', character.name);
            }
            let currentCntHP1 = this.getStock('hpot1')
            if (currentCntHP1 < Stocks.minCntHP1) {
                await this.broadCastHandler.orderItems(partyMerchant, Stocks.minCntHP1 - currentCntHP1, 'hpot1', character.name);
            }
            let currentCntMP0 = this.getStock('mpot0')
            if (currentCntMP0 < Stocks.minCntMP0) {
                await this.broadCastHandler.orderItems(partyMerchant, Stocks.minCntMP0 - currentCntMP0, 'mpot0', character.name);
            }
            let currentCntMP1 = this.getStock('mpot1')
            if (currentCntMP1 < Stocks.minCntMP1) {
                await this.broadCastHandler.orderItems(partyMerchant, Stocks.minCntMP1 - currentCntMP1, 'mpot1', character.name);
            }
        }, 10_000)
    }

    //FIXME duplicate with shopping.ts
    public getStock(itemName: string): number {
        let candidate = character.items.find((item) => {
            // noinspection PointlessBooleanExpressionJS
            return !!(item && (item.name === itemName));
        });

        let availableMP = 0;
        if (candidate) {
            availableMP = candidate.q || 0;
        }

        return availableMP;

    }

}

