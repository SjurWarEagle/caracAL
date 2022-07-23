import config, {getValue, setValue, Stocks} from "../config";
import {Merchant} from "../roles/merchant";
import {Tools} from "../../tools";

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
        const tool = new Tools();
        const availableHP0 = tool.getInventoryStock("hpot0");
        const requestedHP0 = this.getTotalRequested("hpot0");
        let missingHP0 = Math.min(Stocks.minReserveMerchantHP0, (requestedHP0 - availableHP0));
        const availableHP1 = tool.getInventoryStock("hpot1");
        const requestedHP1 = this.getTotalRequested("hpot1");
        let missingHP1 = Math.min(Stocks.minReserveMerchantHP1, (requestedHP1 - availableHP1));
        const availableMP0 = tool.getInventoryStock("mpot0");
        const requestedMP0 = this.getTotalRequested("mpot0");
        let missingMP0 = Math.min(Stocks.minReserveMerchantMP0, (requestedMP0 - availableMP0));
        const availableMP1 = tool.getInventoryStock("mpot1");
        const requestedMP1 = this.getTotalRequested("mpot1");
        let missingMP1 = Math.min(Stocks.minReserveMerchantMP1, (requestedMP1 - availableMP1));

        const availableUpgrade = tool.getInventoryStock("scroll0");
        const availableCompound = tool.getInventoryStock("cscroll0");

        let amountToBuyUpgrade = Math.max(Stocks.minReserveMerchantUpgrade0 * 1.2 - availableUpgrade, 0);
        let amountToBuyCompound = Math.max(Stocks.minReserveMerchantCombound0 * 1.2 - availableCompound, 0);
        let amountToBuyHP0 = Math.max(missingHP0, Stocks.minReserveMerchantHP0 * 1.2 - availableHP0, 0);
        let amountToBuyMP0 = Math.max(missingMP0, Stocks.minReserveMerchantMP0 * 1.2 - availableMP0, 0);
        let amountToBuyHP1 = Math.max(missingHP1, Stocks.minReserveMerchantHP1 * 1.2 - availableHP1, 0);
        let amountToBuyMP1 = Math.max(missingMP1, Stocks.minReserveMerchantMP1 * 1.2 - availableMP1, 0);

        if (amountToBuyHP1 <= 0 && amountToBuyMP1 <= 0 && amountToBuyHP0 <= 0 && amountToBuyMP0 <= 0 && amountToBuyUpgrade <= 0 && amountToBuyCompound <= 0) {
            console.log("💰 Nothing needed to buy, returning to loot collection.");
            p.currentActivity = "COMBAT";
            return;
        }

        if (character.gold < 100_000) {
            //todo calc real needed gold value
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

            console.log("💰 trying to buy " + amountToBuyMP0 + " MP0 and " + amountToBuyHP0 + " HP0");
            console.log("💰 trying to buy " + amountToBuyMP1 + " MP1 and " + amountToBuyHP1 + " HP1");
            console.log("💰 trying to buy " + amountToBuyUpgrade + " upg and " + amountToBuyCompound + " cmb");

            if (amountToBuyUpgrade > 0) {
                set_message('buy scroll0')
                buy_with_gold("scroll0", amountToBuyUpgrade);
            }

            if (amountToBuyCompound > 0) {
                set_message('buy cscroll0')
                buy_with_gold("cscroll0", amountToBuyCompound);
            }

            if (amountToBuyHP0 > 0) {
                set_message('buy hpot0')
                buy_with_gold("hpot0", amountToBuyHP0 * 1.5);
            }

            if (amountToBuyMP0 > 0) {
                set_message('buy mpot0')
                buy_with_gold("mpot0", amountToBuyMP0 * 1.5);
            }

            if (amountToBuyHP1 > 0) {
                set_message('buy hpot1')
                buy_with_gold("hpot1", amountToBuyHP1 * 1.5);
            }

            if (amountToBuyMP1 > 0) {
                set_message('buy mpot1')
                buy_with_gold("mpot1", amountToBuyMP1 * 1.5);
            }

            setValue("currentActivityMerchant", "COMBAT");
        });

    }

    // public findMissingMP0(char: ICharacter): number {
    //     const minAmount = 2000;
    //     let neededAmount = minAmount;
    //
    //     const candidate = char.items.filter(item => item && (item.name === "mpot0"));
    //     if (candidate && candidate.length > 0) {
    //         neededAmount = Math.max(0, minAmount - (candidate[0]!.q || 0));
    //     }
    //     return neededAmount;
    // }

    // public findMissingHP0(char: ICharacter): number {
    //     const minAmount = 2000;
    //     let neededAmount = minAmount;
    //
    //     const candidate = char.items.filter(item => item && (item.name === "hpot0"));
    //     if (candidate && candidate.length > 0) {
    //         neededAmount = Math.max(0, minAmount - (candidate[0]!.q || 0));
    //     }
    //     return neededAmount;
    // }


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

    // public startRequestingCommonStuff(character: ICharacter) {
    //     setInterval(() => {
    //         this.requestItem("hp", this.findMissingHP0(character), character.name);
    //         this.requestItem("mp", this.findMissingMP0(character), character.name);
    //     }, 1_000, 30_000);
    // }

    // private requestItem(itemName: ShoppingItemName, amount: number, requester: string) {
    //     // log("!!!!!!!!!!!!!!!!!!!!requestItem " + requester + "," + amount + "," + itemName.trim());
    //
    //     if (!getValue("shopping-" + requester)) {
    //         setValue("shopping-" + requester, new ShoppingList());
    //         // log("creating for " + requester);
    //     }
    //
    //     const charShoppingList = getValue("shopping-" + requester) as ShoppingList;
    //     // console.log(charShoppingList);
    //     if (!charShoppingList.entries) {
    //         charShoppingList.entries = [];
    //     }
    //     let candidate = charShoppingList.entries.filter(value => value.item === itemName);
    //     if (candidate && candidate.length > 0) {
    //         candidate[0].amount = amount;
    //     } else {
    //         charShoppingList.entries.push({item: itemName, amount: amount});
    //     }
    //     setValue("shopping-" + requester, charShoppingList);
    // }

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

    public startRestockMonitoring() {
        setInterval(() => {
            let stockMP0 = this.getStock("mpot0");
            let stockHP0 = this.getStock("hpot0");
            let stockMP1 = this.getStock("mpot1");
            let stockHP1 = this.getStock("hpot1");
            let stockUpgrade = this.getStock("scroll0");
            let stockCmb = this.getStock("cscroll0");
            if (stockMP0 < Stocks.minReserveMerchantMP0) {
                set_message("restocking (MP0🧪)!");
                setValue("currentActivityMerchant", "SHOPPING");
            } else if (stockMP1 < Stocks.minReserveMerchantMP1) {
                set_message("restocking (MP1🧪)!");
                setValue("currentActivityMerchant", "SHOPPING");
            } else if (stockUpgrade < Stocks.minReserveMerchantUpgrade0) {
                set_message("Need restocking (upg)!");
                setValue("currentActivityMerchant", "SHOPPING");
            } else if (stockCmb < Stocks.minReserveMerchantCombound0) {
                set_message("Need restocking (cmb)");
                setValue("currentActivityMerchant", "SHOPPING");
            } else if (stockHP0 < Stocks.minReserveMerchantHP0) {
                set_message("restocking (HP0♥)!");
                setValue("currentActivityMerchant", "SHOPPING");
            } else if (stockHP1 < Stocks.minReserveMerchantHP1) {
                set_message("restocking (HP1♥)!");
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
