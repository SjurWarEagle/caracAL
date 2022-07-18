map_key("1", "snippet", "resetAll()");

function restart(charName, role) {
    // if (character.name === "aefvngrsiopfnbvourfbn") {
    //   //this entry is just for prevending sortInventory() get treeshaken
    //   sortInventory();
    // }
    if (character.name === charName) {
        load_code("merchant");
        //I'm already running, no char needs starting
        return;
    }
    log("Restarting " + charName);
    stop_character(charName);
    start_character(charName, role);

}

function resetAll() {
    restart("Sjur", "warrior");
    restart("Elvira", "priest");
    restart("WarEagle", "mage");
    restart("Schnapper", "merchant");
}


map_key("2", "snippet", "sortInventory()");

function sortInventory() {
    set_message('sorting', '#FF0000');

    let marker = setInterval(() => {
        function compare(a, b) {
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


let file_op_copy = JSON.parse(JSON.stringify(parent.file_op));
// console.log(JSON.stringify(file_op_copy));
// console.log(JSON.stringify(parent.file_op));

function mapFilenameToScriptName(filename) {
    const to = filename.indexOf(".");
    return filename.substring(0, to);
}

function mapFilenameToChar(filename) {
    let s = mapFilenameToScriptName(filename);
    if (s === "mage") {
        return "WarEagle";
    } else if (s === "merchant") {
        return "Schnapper";
    } else if (s === "warrior") {
        return "Sjur";
    } else if (s === "priest") {
        return "Elvira";
    } else {
        return undefined;
    }
}

setInterval(() => {
    for (entry of Object.keys(file_op_copy)) {
        const a = new Date(Date.parse(parent.file_op[entry])).toLocaleTimeString();
        const b = new Date(Date.parse(file_op_copy[entry])).toLocaleTimeString();
        if (a !== b) {
            console.log("File " + entry + " was changed!");
            const charName = mapFilenameToChar(entry);
            const scriptName = mapFilenameToScriptName(entry);
            if (charName && scriptName) {
                restart(charName, scriptName);
            }
        }
    }
    file_op_copy = JSON.parse(JSON.stringify(parent.file_op));

}, 2_000);

// start my code after executing this file, because most likely it was stopped
load_code("merchant");

unmap_key("3");
unmap_key("4");
unmap_key("5");
unmap_key("6");
unmap_key("7");
unmap_key("Q");
unmap_key("W");
unmap_key("E");
unmap_key("R");
unmap_key("X");
unmap_key("T");
unmap_key("B");


for (let slot of Object.keys(character.slots)) {
    //console.log(slot);
    //console.log(character.slots[slot]);
    // if slot is not filled exists
    if (!character.slots[slot]) {
        console.log("need " + slot);
    }
}
