export class Tools {
    private static convertToSortingName(itemName: string) {
        if (!itemName) {
            return itemName;
        }

        switch (itemName.toLowerCase()) {
            case "hpot0":
                return "aaaaa0";
            case "mpot0":
                return "bbbbb0";
            case "hpot1":
                return "aaaaa1";
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

    public static sortInventory(): void {
        set_message('sorting', '#FF0000');

        let marker = setInterval(() => {
            let compare = (a: string, b: string) => {
                //replace special items to be sorted at the very start
                a = this.convertToSortingName(a);
                b = this.convertToSortingName(b);
                return a.localeCompare(b);
            }

            for (let idx = 0; idx < character.items.length; idx++) {
                // console.log("loop, idx", idx);
                let current = character.items[idx];
                if (idx + 1 > character.items.length) {
                    return;
                }
                let next = character.items[idx + 1];
                if (next && !current) {
                    swap(idx, idx + 1);
                    return;
                } else if (next && current) {
                    if (compare(current.name, next.name) > 0) {
                        // console.log("sorting", current.name, next.name);
                        swap(idx, idx + 1);
                        return;
                    }
                }
                if (idx + 1 >= character.items.length) {
                    log("habe fertig");
                    console.log("habe fertig");
                    set_message('Code Active', '#FFFFFF');
                    clearInterval(marker);
                    return;
                }
            }
        }, 100);
    }

}
