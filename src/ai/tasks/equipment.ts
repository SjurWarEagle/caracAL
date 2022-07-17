export class EquipmentHandler {
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
}
