export class ResourceGathering {
    constructor() {
    }

    public async isGatheringNeeded(): Promise<boolean> {
        if (await this.goMine()) {
            set_message('⛏')
            return true;
        }

        if (await this.goFishing()) {
            set_message('🐟')
            return true;
        }

        // set_message('idle')
        return false;
    }

    private async goFishing(): Promise<boolean> {
        let spot = {map: "main", x: -1368, y: -82};

        // @ts-ignore
        let currentWeapon = character.slots["mainhand"] ? character.slots["mainhand"].name : undefined;
        let fishingRodSlot = locate_item("rod"); // returns slotnum OR -1 if cannot find

        if (is_on_cooldown('fishing')) {
            return false;
        }

        if (character.c.fishing) {
            //already fishing
            return true;
        }

        if (character.x != spot.x && character.y != spot.y) {
            if (smart.moving) {
                return true;
            }
            await smart_move({map: spot.map, x: spot.x, y: spot.y});
        }

        if (character.mp < 120) {
            //need to regen for mana
            return true;
        }
        set_message('🐟')
        if (currentWeapon != "rod") {
            // log("Fishing rod not equipped");
            if (fishingRodSlot == -1) {
                console.log(character.name + " cannot fish without fishing rod.")
                return false;
            } else {
                //log("Equipping Fishing Rod");
                await equip(fishingRodSlot);
            }
        }

        await use_skill('fishing');
        //await smart_move("main");

        return true;
    }

    private async goMine(): Promise<boolean> {
        let miningSpot = {map: 'tunnel', x: -264, y: -196};

        // @ts-ignore
        let currentWeapon = character.slots["mainhand"] ? character.slots["mainhand"].name : undefined;
        let pickaxeSlot = locate_item("pickaxe"); // returns slotnum OR -1 if cannot find

        if (is_on_cooldown('mining')) {
            //mining is on cooldown, so leave the mine
            // console.log("Mining is on cooldown");
            if (character.map === 'tunnel') {
                if (!smart.moving) {
                    smart_move("main");
                }
            }
            return false;
        }

        if (character.c.mining) {
            //already mining
            return true;
        }

        if (character.x != miningSpot.x && character.y != miningSpot.y) {
            if (smart.moving) {
                //console.log("Already moving to Mining Spot")
                return true;
            }
            console.log("Moving to Mining Spot")
            set_message('⛏')

            await smart_move({map: miningSpot.map, x: miningSpot.x, y: miningSpot.y});
        }

        if (character.mp < 120) {
            //need to regen for mana
            console.log("not enough mana for mining")
            return true;
        }
        if (currentWeapon != "pickaxe") {
            // log("Pickaxe not equipped");
            if (pickaxeSlot == -1) {
                console.log(character.name + " cannot mine without pickaxe.")
                return false;
            } else {
                //log("Equipping Pickaxe");
                await equip(pickaxeSlot);
            }
        }

        use_skill('mining');
        if (!character.c.mining) {
            // smart_move("main");
        }

        return true;
    }
}
