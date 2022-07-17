import {ICharacter} from "../../definitions/game";
import config, {getValue, setValue, Stocks} from "../config";
import {Merchant} from "../roles/merchant";

type ShoppingItemName = "hp" | "mp";

class ShoppingListEntry {
    public item: ShoppingItemName = "hp";
    public amount: number = 0;
}

class ShoppingList {
    public entries: ShoppingListEntry[] = [];
}

export class ShoppingHandler {

    public async travelToCity(p: Merchant) {
        const availableHP = this.getInventoryStock("hpot0");
        const requestedHP = this.getTotalRequested("hpot0");
        let missingHP = Math.min(Stocks.minReservceMerchantHP, (requestedHP - availableHP));
        const availableMP = this.getInventoryStock("mpot0");
        const requestedMP = this.getTotalRequested("mpot0");
        let missingMP = Math.min(Stocks.minReservceMerchantMP, (requestedMP - availableMP));

        const availableUpgrade = this.getInventoryStock("scroll0");
        const availableCombound = this.getInventoryStock("cscroll0");

        let amountToBuyUpgrade = Math.max(20 - availableUpgrade, 0);
        let amountToBuyCombound = Math.max(20 - availableCombound, 0);
        let amountToBuyHP = Math.max(missingHP, Stocks.minReservceMerchantHP * 1.2 - availableHP, 0);
        let amountToBuyMP = Math.max(missingMP, Stocks.minReservceMerchantMP * 1.2 - availableMP, 0);

        if (amountToBuyHP <= 0 && amountToBuyMP <= 0 && amountToBuyUpgrade <= 0 && amountToBuyCombound <= 0) {
            console.log("💰 Nothing needed to buy, returning to loot collection.");
            p.currentActivity = "COMBAT";
            return;
        }

        if (character.gold < 10_000) {
            console.log("💰 not enough gold");
            p.currentActivity = "COMBAT";
            return;
        }

        if (character.c.town) {
            //already teleporting
            return;
        }

        if (smart.moving) {
            //already on the way
            return;
        }

        set_message('trvl city')
        await smart_move({x: -180, y: -110}, () => {
            // console.log("💰 I have reached the city");

            console.log("💰 trying to buy " + amountToBuyMP + " MP and " + amountToBuyHP + " HP");
            console.log("💰 trying to buy " + amountToBuyUpgrade + " upg and " + amountToBuyCombound + " cmb");

            if (amountToBuyUpgrade > 0) {
                set_message('buy scroll0')
                buy_with_gold("scroll0", amountToBuyUpgrade);
            }

            if (amountToBuyCombound > 0) {
                set_message('buy cscroll0')
                buy_with_gold("cscroll0", amountToBuyCombound);
            }

            if (amountToBuyHP > 0) {
                set_message('buy hpot0')
                buy_with_gold("hpot0", amountToBuyHP * 1.5);
            }

            if (amountToBuyMP > 0) {
                set_message('buy mpot0')
                buy_with_gold("mpot0", amountToBuyMP * 1.5);
            }

            setValue("currentActivityMerchant", "COMBAT");
        });

    }

    public findMissingMP(char: ICharacter): number {
        const minAmount = 2000;
        let neededAmount = minAmount;

        const candidate = char.items.filter(item => item && (item.name === "mpot0"));
        if (candidate && candidate.length > 0) {
            neededAmount = Math.max(0, minAmount - (candidate[0]!.q || 0));
        }
        return neededAmount;
    }

    public findMissingHP(char: ICharacter): number {
        const minAmount = 2000;
        let neededAmount = minAmount;

        const candidate = char.items.filter(item => item && (item.name === "hpot0"));
        if (candidate && candidate.length > 0) {
            neededAmount = Math.max(0, minAmount - (candidate[0]!.q || 0));
        }
        return neededAmount;
    }


    public getTotalRequested(itemName: string) {
        let total = 0;
        config.myHelpers.forEach(requester => {
            const charShoppingList = getValue("shopping-" + requester) as ShoppingList;
            if (!charShoppingList) {
                return -1;
            }

            let candidate = charShoppingList.entries.find(value => value.item === itemName);
            if (candidate) {
                total += candidate.amount;
            }
        });

        return total;
    }

    public startRequestingCommonStuff(character: ICharacter) {
        setInterval(() => {
            this.requestItem("hp", this.findMissingHP(character), character.name);
            this.requestItem("mp", this.findMissingMP(character), character.name);
        }, 1_000, 30_000);
    }

    private requestItem(itemName: ShoppingItemName, amount: number, requester: string) {
        // log("!!!!!!!!!!!!!!!!!!!!requestItem " + requester + "," + amount + "," + itemName.trim());

        if (!getValue("shopping-" + requester)) {
            setValue("shopping-" + requester, new ShoppingList());
            // log("creating for " + requester);
        }

        const charShoppingList = getValue("shopping-" + requester) as ShoppingList;
        // console.log(charShoppingList);
        if (!charShoppingList.entries) {
            charShoppingList.entries = [];
        }
        let candidate = charShoppingList.entries.filter(value => value.item === itemName);
        if (candidate && candidate.length > 0) {
            candidate[0].amount = amount;
        } else {
            charShoppingList.entries.push({item: itemName, amount: amount});
        }
        setValue("shopping-" + requester, charShoppingList);
    }

    // public getRequestedForChar(itemName: string, requester: string): number {
    //     const charShoppingList = getValue("shopping-" + requester) as ShoppingList;
    //     // console.log(charShoppingList);
    //     if (!charShoppingList) {
    //         return 0;
    //     }
    //     let candidate = charShoppingList.entries.find(value => value.item === itemName);
    //     if (candidate) {
    //         return candidate.amount;
    //     } else {
    //         return 0;
    //     }
    // }

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

    public startRestockMonitoring() {
        setInterval(() => {
            let stockMP = this.getStock("mpot0");
            let stockHP = this.getStock("hpot0");
            let stockUpgrade = this.getStock("scroll0");
            let stockCmb = this.getStock("cscroll0");
            if (stockMP < 200) {
                set_message("restocking (MP🧪)!");
                setValue("currentActivityMerchant", "SHOPPING");
            } else if (stockUpgrade < 10) {
                set_message("Need restocking (upg)!");
                setValue("currentActivityMerchant", "SHOPPING");
            } else if (stockCmb < 10) {
                set_message("Need restocking (cmb)");
                setValue("currentActivityMerchant", "SHOPPING");
            } else if (stockHP < 200) {
                set_message("restocking (HP♥)!");
                setValue("currentActivityMerchant", "SHOPPING");
            } else {
                setValue("currentActivityMerchant", "COMBAT");
            }
        }, 10_000);
    }

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
