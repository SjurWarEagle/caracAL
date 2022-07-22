import config, {partyMerchant} from "../config";
import {getCharacter} from "./common";

export class BroadCastHandler {

    public static readonly BROADCAST_ORDER_ITEM = 'BROADCAST_ORDER_ITEM';
    public static readonly BROADCAST_ACTIVE_HUNT_INFO = 'ACTIVE_HUNT_INFO';
    public static readonly BROADCAST_ACTIVE_HUNT_MISSING = 'ACTIVE_HUNT_MISSING';
    public static readonly BROADCAST_LEADER_POSITION = 'LEADER_POSITION';

    public lastLeaderPosition: { map: string, x: number, y: number } = {map: 'main', x: 0, y: 0};

    public listenForLastLeaderPosition(): void {
        character.on("cm", (msg) => {
            const data = JSON.parse(msg.message);
            //console.log('data', data);
            if (data.type === BroadCastHandler.BROADCAST_LEADER_POSITION) {
                this.lastLeaderPosition = data;
            }
        });
    }

    public receiveBroadCastHunts() {
        character.on("cm", (msg) => {
            const data = JSON.parse(msg.message);
            //console.log('data', data);
            if (data.type === BroadCastHandler.BROADCAST_ACTIVE_HUNT_MISSING) {
            }
            //console.log('rememberedHunts',rememberedHunts);
        });
        // console.log("Received a cm on character %s: %s", character.name, m));
    }

    public broadcastToTeam(type: string, data: any): void {
        data.type = type;
        let msg = JSON.stringify(data)
        config.myHelpers.forEach((name) => {
            send_cm(name, msg);
        });
    }

    public broadcastHunts(sender: string): void {
        setInterval(() => {
            let me = getCharacter(sender);
            // @ts-ignore
            let data = me.s["monsterhunt"];
            if (me && me.s && data) {
                data.type = BroadCastHandler.BROADCAST_ACTIVE_HUNT_INFO;
            } else {
                data = {};
                data.type = BroadCastHandler.BROADCAST_ACTIVE_HUNT_MISSING;
            }
            let msg = JSON.stringify(data)
            send_cm(partyMerchant, msg);
        }, 30_000);
    }

    async orderItems(partyMerchant: string, cnt: number, itemName: string, requesterName: string) {
        if (cnt <= 0) {
            return;
        }
        let data: SupplyOrder = {
            msgType: BroadCastHandler.BROADCAST_ORDER_ITEM,
            itemName: itemName,
            requesterName: requesterName,
            cnt: cnt,
        };
        // console.log(data);
        send_cm(partyMerchant, JSON.stringify(data));
    }
}


export interface SupplyOrder {
    msgType: string;
    itemName: string;
    requesterName: string;
    cnt: number;
}
