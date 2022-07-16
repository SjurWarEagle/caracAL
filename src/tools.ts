export class Tools {
    public static sortInventory(): void {
        set_message('sorting', '#FF0000');

        let marker = setInterval(() => {
            function compare(a: string, b: string) {
                //replace special items to be sorted at the very start
                if (a === "hpot0") {
                    a = "aaaaaaaaaa1";
                }
                if (a === "mpot0") {
                    a = "aaaaaaaaaa2";
                }
                if (b === "hpot0") {
                    b = "aaaaaaaaaa1";
                }
                if (b === "mpot0") {
                    b = "aaaaaaaaaa2";
                }
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
