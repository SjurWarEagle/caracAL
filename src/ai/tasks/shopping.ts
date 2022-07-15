import { ICharacter } from "../../definitions/game";
import config, { getValue, mainCityPotionVendor, setValue } from "../config";
import {Merchant} from "../roles/merchant";

type ShoppingItemName = "hp" | "mp";

class ShoppingListEntry {
  public item: ShoppingItemName = "hp";
  public amount: number = 0;
}

class ShoppingList {
  public entries: ShoppingListEntry[] = [];
}

export function findMissingMP(char: ICharacter): number {
  const minAmount = 2000;
  let neededAmount = minAmount;

  const candidate = char.items.filter(item => item && (item.name === "mpot0"));
  if (candidate && candidate.length > 0) {
    neededAmount = Math.max(0, minAmount - (candidate[0]!.q || 0));
  }
  return neededAmount;
}

export function findMissingHP(char: ICharacter): number {
  const minAmount = 2000;
  let neededAmount = minAmount;

  const candidate = char.items.filter(item => item && (item.name === "hpot0"));
  if (candidate && candidate.length > 0) {
    neededAmount = Math.max(0, minAmount - (candidate[0]!.q || 0));
  }
  return neededAmount;
}


export function getTotalRequested(itemName: string) {
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

export function startRequestingCommonStuff(character: ICharacter) {
  setInterval(() => {
    requestItem("hp", findMissingHP(character), character.name);
    requestItem("mp", findMissingMP(character), character.name);
  }, 1_000, 30_000);
}

export function requestItem(itemName: ShoppingItemName, amount: number, requester: string) {
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
    charShoppingList.entries.push({ item: itemName, amount: amount });
  }
  setValue("shopping-" + requester, charShoppingList);
}

function getRequestedForChar(itemName: string, requester: string): number {
  const charShoppingList = getValue("shopping-" + requester) as ShoppingList;
  // console.log(charShoppingList);
  if (!charShoppingList) {
    return 0;
  }
  let candidate = charShoppingList.entries.find(value => value.item === itemName);
  if (candidate) {
    return candidate.amount;
  } else {
    return 0;
  }
}

export function getInventoryStock(itemName: string): number {
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

export function travelToCity(p: Merchant) {
  const availableHP = getInventoryStock("hpot0");
  const requestedHP = getTotalRequested("hpot0");
  let missingHP = Math.min(200, (requestedHP - availableHP));
  const availableMP = getInventoryStock("mpot0");
  const requestedMP = getTotalRequested("mpot0");
  let missingMP = Math.min(200, (requestedMP - availableMP));

  let amountToBuyHP = Math.max(missingHP, 1000 * 1.5 - availableHP, 0);
  let amountToBuyMP = Math.max(missingMP, 1000 * 1.5 - availableMP, 0);

  if (amountToBuyHP <= 0 && amountToBuyMP <= 0) {
    console.log("💰 Nothing needed to buy, returning to loot collection.");
    p.currentActivity="COMBAT";
    return;
  }

  set_message('trvl city')
  if (character.c.town) {
    //already teleporting
    return;
  }
//  use_skill("use_town");
  if (smart.moving) {
    //already on the way
    return;
  }
  smart_move(mainCityPotionVendor, () => {
    console.log("💰 I have reached the city");

    console.log("💰 trying to buy " + amountToBuyMP + " MP and " + amountToBuyHP + " HP");

    if (amountToBuyHP > 0) {
      buy_with_gold("hpot0", amountToBuyHP * 1.5);
    }

    if (amountToBuyMP > 0) {
      buy_with_gold("hpot0", missingMP * 1.5);
    }

    setValue("currentActivityMerchant", "COMBAT");
  });

}

