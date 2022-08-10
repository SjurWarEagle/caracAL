import {Tools} from "../../tools";

interface UpgradeWish {
    itemName: string;
    targetLevel: number
}

export class EquipmentHandler {
    private tool = new Tools();
    private itemsToCombine: UpgradeWish[] = [
        {targetLevel: 5, itemName: 'hbow'},
        {targetLevel: 5, itemName: 'hpbelt'},
        // {targetLevel: 5, itemName: 'hpamulet'},
        // {targetLevel: 5, itemName: 'ringsj'},
        {targetLevel: 3, itemName: 'dexamulet'},
        {targetLevel: 3, itemName: 'intamulet'},
        {targetLevel: 3, itemName: 'stramulet'},
        {targetLevel: 3, itemName: 'dexring'},
        {targetLevel: 3, itemName: 'intring'},
        {targetLevel: 3, itemName: 'strring'},
        {targetLevel: 3, itemName: 'vitring'}
    ];
    private itemsToSell: string[] = ['stinger', 'slimestaff',
        'coat1', 'pants1', 'shoes1', 'helmet1', 'gloves1',
        'mushroomstaff', 'cclaw', 'sshield',
        'wshoes', 'wbreeches', 'wattire', 'wcap','wgloves',
        'whiteegg', 'hpamulet', 'ringsj'
    ]
    private itemsToUpgrade: UpgradeWish[] = [
        // {targetLevel: 0, itemName: 'slimestaff'},
    ];

    // private itemsToUpgrade: string[] = ['hpbelt']

    public async sellStuff(): Promise<number> {
        let total = 0;
        for (let itemName of this.itemsToSell) {
            const cnt = await this.tool.getInventorySlotsForItems(itemName);
            for (let slot of cnt) {
                await sell(slot, 1);
            }
        }
        return total;

    }

    public async getNumberOfStuffToUpgrade(): Promise<number> {
        let total = 0;
        for (let item of this.itemsToUpgrade) {
            for (let level = 0; level < item.targetLevel; level++) {
                const cnt = this.tool.getInventoryStockWithSpecialLevel(item.itemName, level);
                total += cnt;
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

    public async getNumberOfPossibleCompoundActions(): Promise<number> {
        // console.log('getNumberOfPossibleUpgradeActions');
        let numberOfActions = 0;
        //level 0-1
        for (let item of this.itemsToCombine) {
            for (let level = 0; level < item.targetLevel; level++) {
                const cnt = this.tool.getInventoryStockWithSpecialLevel(item.itemName, level);
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

    async performRandomUpgrade(): Promise<void> {
        for (let item of this.itemsToUpgrade) {
            for (let level = 0; level < item.targetLevel; level++) {
                const cnt: number[] = await this.tool.getInventorySlotsForItemsWithSpecialLevel(item.itemName, level);
                for (let idx of cnt) {
                    if (character.q.upgrade) {
                        // console.log("Already upgrading something!");
                        return;
                    }
                    if (can_use('massproduction') && !is_on_cooldown('massproduction')) {
                        await use_skill('massproduction');
                    }
                    await upgrade(idx, locate_item("scroll0"));
                }
            }
        }
    }

    async performRandomCompound(): Promise<void> {
        for (let item of this.itemsToCombine) {
            for (let level = 0; level < item.targetLevel; level++) {
                const cnt: number[] = await this.tool.getInventorySlotsForItemsWithSpecialLevel(item.itemName, level);
                if (cnt.length >= 3) {
                    if (character.q.compound) {
                        // console.log("Already combining something!");
                        return;
                    }
                    await compound(cnt[0], cnt[1], cnt[2], locate_item("cscroll0"));
                }
            }
        }
    }
}
