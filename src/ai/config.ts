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


export class RuntimeConfig {
}


export class Stocks {
    static minCntHP0 = 5_000;
    static minCntMP0 = 5_000;
    static minCntHP1 = 1_000;
    static minCntMP1 = 1_000;

    static minReserveMerchantHP0 = 5_000;
    static minReserveMerchantMP0 = 5_000;

    static minReserveMerchantHP1 = 1_000;
    static minReserveMerchantMP1 = 1_000;
    static minReserveMerchantCombound0 = 50;
    static minReserveMerchantUpgrade0 = 50;

}
