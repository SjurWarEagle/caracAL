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
export default {myHelpers};


export class Stocks {
    static minCntHP = 5_000;
    static minCntMP = 5_000;

    static minReservceMerchantHP = 5_000;
    static minReservceMerchantMP = 5_000;

}
