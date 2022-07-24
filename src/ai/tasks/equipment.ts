import {Tools} from "../../tools";

export class EquipmentHandler {
    private tool = new Tools();
    private itemsToUpgrade: string[] = ['hpbelt', 'hpamulet', 'ringsj']
    private itemsToSell: string[] = ['stinger','coat1','pants1']

    // private itemsToUpgrade: string[] = ['hpbelt']

    public async sellStuff(): Promise<number> {
        let total = 0;
        for (let itemName of this.itemsToSell) {
            const cnt = await this.tool.getInventorySlotsForItems(itemName);
            for (let slot of cnt) {
                await sell(slot,1);
            }
        }
        return total;

    }
    public async getNumberOfStuffToSell(): Promise<number> {
        let total = 0;
        for (let itemName of this.itemsToSell) {
            const cnt = this.tool.getInventoryStock(itemName);
            total += cnt;
        }
        return total;

    }

    public async getNumberOfPossibleUpgradeActions(): Promise<number> {
        // console.log('getNumberOfPossibleUpgradeActions');
        let numberOfActions = 0;
        //level 0-1
        for (let level = 0; level < 2; level++) {
            for (let itemName of this.itemsToUpgrade) {
                const cnt = this.tool.getInventoryStockWithSpecialLevel(itemName, level);
                // if (cnt >= 3) {
                // console.log(character.name + ': I could upgrade ' + itemName + ' ' + Math.floor(cnt / 3) + 'x times (level ' + level + ')');
                // }
                numberOfActions += Math.floor(cnt / 3);
            }
        }
        return numberOfActions;
    }

    public async startBeNotNaked(): Promise<void> {
        setInterval(async () => {
            for (const slot of await this.findEmptySlots()) {
                for (const item of character.items) {
                    const inventorySlot = character.items.indexOf(item);
                    if (item && !item.q) {
                        let slotToSearch = await this.convertToGenericSlotType(slot);
                        // console.log(item.name,G.items[item.name].type,slotToSearch);
                        if (G.items[item.name].type === slotToSearch) {
                            try {
                                // console.log('trying to equip', inventorySlot, slot, item);
                                await equip(inventorySlot, slot);
                                return;
                            } catch (e) {

                            }
                        }
                    }
                }
            }
        }, 120_000);
    }

    private async findEmptySlots(): Promise<string[]> {
        let rc: string[] = [];
        for (const slot of Object.keys(character.slots)) {
            // @ts-ignore
            if (!character.slots[slot]) {
                if (rc.indexOf(slot) === -1) {
                    rc.push(slot);
                }
            }
        }
        // console.log('slots', rc);
        return rc;
    }

    private async convertToGenericSlotType(slot: string): Promise<string> {
        return slot
            .replace('offhand', 'shield')
            .replace(/[0-9]/g, "")
            ;
    }

    async performRandomCompound(): Promise<void> {
        for (let level = 0; level < 2; level++) {
            for (let itemName of this.itemsToUpgrade) {
                const cnt: number[] = await this.tool.getInventorySlotsForItemsWithSpecialLevel(itemName, level);
                if (cnt.length >= 3) {
                    if (character.q.compound) {
                        console.log("Already combining something!");
                        return;
                    }
                    await compound(cnt[0], cnt[1], cnt[2], locate_item("cscroll0"));
                }
            }
        }
    }
}
