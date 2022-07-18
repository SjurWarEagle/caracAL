
export class BasicCombat {
    /**
     * primitive attack, just hit when ready
     * @param mon_type
     */
    public async attack(mon_type: string): Promise<void> {
        const target = get_nearest_monster({no_target: true, type: mon_type});

        if (target) {
            change_target(target);
            if (can_attack(target)) {
                try {
                    await attack(target);
                } catch (e) {
                    // log(JSON.stringify(e));
                }
            } else {
                const dist = simple_distance(target, character);
                if (!is_moving(character)
                    && dist > character.range - 10) {
                    if (can_move_to(target.real_x!, target.real_y!)) {
                        await move((target.real_x! + character.real_x!) / 2, (target.real_y! + character.real_y!) / 2);
                    } else {
                        await smart_move(target);
                    }
                }
            }
        } else if (!is_moving(character)) {
            smart_move(mon_type);
        }

    }
}
