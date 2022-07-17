import {partyMerchant} from "../config";
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
                console.log('trying to distribute', requesterName, value);
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
                        console.log('Sending slot ' + slot + ' (' + cnt + ') to ' + target.name);
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

            let currentCntHP = this.getStock('hpot0')
            if (currentCntHP < 2_000) {
                await this.broadCastHandler.orderItems(partyMerchant, 2000 - currentCntHP, 'hpot0', character.name);
            }
            let currentCntMP = this.getStock('mpot0')
            if (currentCntMP < 2_000) {
                await this.broadCastHandler.orderItems(partyMerchant, 2000 - currentCntMP, 'mpot0', character.name);
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

