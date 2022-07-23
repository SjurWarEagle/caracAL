import {ItemInfo} from "./definitions/game";
import {sortBy} from "lodash";

export class Tools {

    public getInventoryStockWithSpecialLevel(itemName: string, level: number): number {
        let candidate = character.items.find((item) => {
            return !!(item && (item.name === itemName && (item.level || 0) === level));
        });
        let availableInInventory = 0;
        if (candidate) {
            availableInInventory = candidate.q || 0;
        }

        return availableInInventory;
    }

    public getInventoryStock(itemName: string): number {
        let candidate = character.items.find((item) => {
            // noinspection PointlessBooleanExpressionJS
            return !!(item && (item.name === itemName));
        });
        let availableInInventory = 0;
        if (candidate) {
            availableInInventory = candidate.q || 0;
        }

        return availableInInventory;
    }


    private convertToSortingName(itemName: string) {
        if (!itemName) {
            return itemName;
        }

        switch (itemName.toLowerCase()) {
            case "tracker":
                return "aaaaa0";
            case "hpot0":
                return "aaaaa1";
            case "mpot0":
                return "bbbbb0";
            case "hpot1":
                return "aaaaa5";
            case "mpot1":
                return "bbbbb1";
            case "cscroll0":
                return "ccccc";
            case "scroll0":
                return "ddddd";
            case "pickaxe":
                return "eeeee";
            case "rod":
                return "fffff";
            default:
                return itemName;
        }
    }

    /**
     * Sorts the inventory
     *
     * NOTE first time this will look chaotic, this is because there may be cyclic sorting results and
     * this logic only does the first step to not run into a loop.
     * so it needs to restart multiple times.
     */
    public async sortInventory(): Promise<void> {

        let items = JSON.parse(JSON.stringify(character.items));
        await this.storeOldPositions(items);
        items = await this.sortByName(items);
        let movements = await this.calculateInventoryMovesToBeSorted(items);
        await this.breakCircles(movements);

        if (movements && movements.length > 0) {
            set_message('sorting', '#FF0000');
        }

        for (let movement of movements) {
            swap(movement.oldPosition, movement.newPosition);
            await new Promise(r => setTimeout(r, (character.ping || 100) * 2));
        }

    }

    public async sortBank(): Promise<void> {
        set_message('sorting Bank', '#FF0000');

        if (!character.bank) {
            return;
        }

        const inventorySlotForBankSorting1 = 41;
        const inventorySlotForBankSorting2 = 40;
        if (character.items[inventorySlotForBankSorting1]) {
            // no free slot :(
            return;
        }
        if (character.items[inventorySlotForBankSorting2]) {
            // no free slot :(
            return;
        }

        let items = JSON.parse(JSON.stringify(character.bank.items0));
        // console.log(items);
        await this.storeOldPositions(items);
        // console.log(items);
        items = await this.sortByName(items);
        let movements = await this.calculateInventoryMovesToBeSorted(items);
        // console.log('movements', movements);
        await this.breakCircles(movements);
        // console.log('movements', movements);

        for (let movement of movements) {
            await bank_retrieve('items0', movement.oldPosition, inventorySlotForBankSorting1);
            await new Promise(r => setTimeout(r, (character.ping || 100) * 2));
            await bank_retrieve('items0', movement.newPosition, inventorySlotForBankSorting2);
            await new Promise(r => setTimeout(r, (character.ping || 100) * 2));
            // console.log('bank_retrieve(\'items0\', ' + movement.oldPosition + ', ' + inventorySlotForBankSorting + ');');
            await new Promise(r => setTimeout(r, (character.ping || 100) * 2));
            await bank_store(inventorySlotForBankSorting1, 'items0', movement.newPosition);
            await new Promise(r => setTimeout(r, (character.ping || 100) * 2));
            await bank_store(inventorySlotForBankSorting2, 'items0', movement.oldPosition);
            // console.log('bank_store(' + (inventorySlotForBankSorting) + ', \'items0\', ' + movement.newPosition + ');');
            //swap(movement.oldPosition, movement.newPosition);
            // await new Promise(r => setTimeout(r, (character.ping || 100) * 2));
        }

    }

    public async moveOrderExists(newOrder: MoveOrder, orders: MoveOrder[]): Promise<boolean> {
        let exist = false;
        for (let order of orders) {
            if (
                ((order.newPosition === newOrder.newPosition) && (order.oldPosition === newOrder.oldPosition))
                || ((order.oldPosition === newOrder.newPosition) && (order.oldPosition === newOrder.newPosition))
                || ((order.newPosition === newOrder.oldPosition) && (order.newPosition === newOrder.oldPosition))
            ) {
                exist = true;
            }
        }
        return exist;
    }

    public async calculateInventoryMovesToBeSorted(items: ItemInfo[]): Promise<MoveOrder[]> {
        const rc: { oldPosition: number, newPosition: number }[] = []
        for (let i = 0; i < items.length; i++) {
            if (items[i] && items[i].oldPosition !== i) {
                if (!await this.moveOrderExists({oldPosition: i, newPosition: items[i].oldPosition || 0}, rc)) {

                    rc.push({
                        oldPosition: items[i].oldPosition || 0,
                        newPosition: i
                    });
                }
            }
        }
        return rc;
    }

    public async storeOldPositions(items: ItemInfo[]): Promise<void> {
        for (let i = 0; i < items.length; i++) {
            if (items[i]) {
                items[i].oldPosition = i;
            }
        }
    }

    public async sortByName(items: ItemInfo[]): Promise<ItemInfo[]> {
        return sortBy(items, (item) => {
            if (!item) {
                return this.convertToSortingName('xxxxxxxx')
            }

            // add the old position to name,
            // this ensures, that Ring, Ring are sorted as Ring1, Ring2
            // so the order will never change.

            // also add level to sorting, but reverse as highest level shall be on left
            return this.convertToSortingName(item.name) + (99 - (item.level || 0)) + item.oldPosition
        });
    }

    public async checkForLoopStart(movements: MoveOrder[]): Promise<boolean> {
        for (let movement of movements) {
            if (await this.checkForLoop(movement, movements)) {
                return true;
            }
        }
        return false;
    }

    /**
     * this is just primitive check if there is a loop of 5 elements,
     * yeah it's no real loop, but it's what I got working, recursion somehow always returned garbage.
     * @param movement
     * @param movements
     */
    public async checkForLoop(movement: MoveOrder, movements: MoveOrder[]): Promise<boolean> {
        if (!movement) {
            return false;
        }
        let current: MoveOrder | undefined = movement;
        for (let i = 0; i < 50; i++) {
            current = movements.find(m => m.oldPosition === current!.newPosition);
            if (!current) {
                return false;
            }
        }

        return true;
    }

    async breakCircles(movements: MoveOrder[]) {
        const toRemove: MoveOrder[] = [];
        for (let movement of movements) {
            while (await this.checkForLoop(movement, movements)) {
                movements.splice(movements.indexOf(movement), 1);
            }
        }

        for (let moveOrderToDelete of toRemove) {
            movements.splice(movements.indexOf(moveOrderToDelete), 1);
        }
    }
}

export class MoveOrder {
    public oldPosition: number = 0;
    public newPosition: number = 0;
}
