
export const mainCityPotionVendor = { to: "potions", return: false };

// export const mainCityPotionVendor = { x: -25, y: -130 };


export function setValue(key: string, value: any): void {
  // tmpStorage.set(key, JSON.stringify(value));
  localStorage.setItem(key, JSON.stringify(value));
}

export function getValue(key: string): any {
  const data = localStorage.getItem(key);
  // const data = tmpStorage.get(key);
  if (!data) {
    return undefined;
  }
  return JSON.parse(data);
}

export let partyLeader: string = "Sjur";
export let partyMerchant: string = "Schnapper";

let myHelpers: string[] = ["Sjur", "Kosh", "Elvira", "Schnapper"];
export default { myHelpers};
