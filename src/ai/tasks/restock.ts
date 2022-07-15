import { setValue } from "../config";

export function getStock(itemName: string): number {
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

export function startRestockMonitoring() {
  setInterval(() => {
    let stockMP = getStock("mpot0");
    let stockHP = getStock("hpot0");
    if (stockMP < 200) {
      log("Need restocking (MP🧪)!");
      setValue("currentActivityMerchant", "SHOPPING");
    } else if (stockHP < 200) {
      log("Need restocking (HP♥)!");
      setValue("currentActivityMerchant", "SHOPPING");
    } else {
      setValue("currentActivityMerchant", "COMBAT");
    }
  }, 10_000);
}

