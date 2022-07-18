export interface ICombat {
    attack(mon_type: string): Promise<void>;
}
