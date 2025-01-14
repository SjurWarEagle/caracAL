type ItemName = string; // TODO: Same as with skills

interface ISpellCasting {
    fishing?: { "ms": number };
    mining?: { "ms": number };
    town?: { "ms": number };
}

interface ISkillUsage {
    compound?: { "ms": number };
    upgrade?: { "ms": number };
}

export interface ICharacter extends Entity {
    slots: { [T in keyof string]: ItemInfo };
    bank?: { [T: string]: ItemInfo };
    c: ISpellCasting;
    q: ISkillUsage;
    ping?: number;
    party?: string;
    name: string;
    map: string;
    range: number;
    items: (ItemInfo | undefined)[];
    ctype: string;
    rip: boolean;
    afk: string;
    gold: number;
    xp: number;
    y: number;
    level: number;
    x: number;
    max_xp: number;
    moving: boolean;

    on(cm: string, msg: (m: ICmMessage) => void): void;

}

export interface ICmMessage {
    name: string,
    message: string,
    characAL: boolean
}

export interface ISmartActions {
    moving: boolean;
}

export type EntityId = string;

export interface Drawing {
    destroy: () => void;
}

export interface IDestination {
    x: number;
    y: number;
}

export interface IDestinationSmart {
    map?: string;
    to: string;
    x?: number;
    y?: number;
    return?: boolean;
}

export class ItemInfo {
    level?: number;
    q?: number;
    name: string;
    type?: string;
    g?: number;
    oldPosition?: number;
}

export interface BuffInfo {
    f: string;
    // duration in ms
    ms: number;
    /**
     * server
     */
    sn?: string;
    /**
     * monster type
    */
    id?: string;
    c?: number;
}

export interface Entity {
    party?: string;
    name?: string;
    id?: string;
    real_x?: number;
    real_y?: number;
    going_x?: number;
    going_y?: number;
    range?: number;
    level?: number;
    hp: number;
    cc: number;
    map: string;
    speed: number;
    resistance: number;
    armor: number;
    max_hp: number;
    mp: number;
    max_mp: number;
    attack: number;
    target: string;
    damage: number;
    dreturn?: number;
    xp: number;
    y: number;
    x: number;
    type: string;
    mtype?: string;
    transform?: any;
    dead: boolean;
    visible: boolean;
    npc?: boolean;
    // Buffs are 's' ???? -_-
    s?: { [T in keyof SkillName]: BuffInfo };
}

export interface Monster extends Entity {
    mtype: string;
    id: string;
    range: number;
}

export interface SkillInfo {
    mp?: number;
    name: number;
    cooldown: number;
    ratio?: number;
    range?: number;
}

export interface GameInfo {
    skills: { [T in SkillName]: SkillInfo };
    items: { [T in ItemName]: ItemInfo };
    monsters: { [id: string]: Monster };
    levels: { [id: string]: number };
}

interface CaracChar {
    map: string;
    name: string;
    x: number;
    y: number;
    in: string;
}

interface CaracAL {
    characters: CaracChar[];
}

declare global {
    interface Window {
        clear_game_logs(): void;

        PIXI: any;
        caracAL: boolean;
        pings: any;
        character: ICharacter;
        tracker: any;
        C: any;
        socket: any;
        smart_eval: any;
        X: CaracAL;
        party_list: string[];
        party: { [name: string]: ICharacter };
        entities: { [id: string]: Entity };

        start_runner(): void;

        stop_runner(): void;
    }

    var game: any;
    var $: any;
    var character: ICharacter;
    var game_logs: any[];
    var G: GameInfo;
    var C: any;
    var S: any;
    var clear_game_logs: () => void;
    var smart: ISmartActions;
    var handle_death: () => void;

    function respawn(): void;

    function log(msg: string): void;

    function is_on_cooldown(msg: string): boolean;

    function locate_item(msg: string): number;

    function consume(inventorySlot: number): void;

    function start_character(name: string, script: string): void;

    function stop_character(name: string, script?: string): void;

    function map_key(key: string, thing: string, arg?: string): void;

    function unmap_key(key: string): void;

    function can_use(skill: SkillName): boolean;

    /**
     * sell an item from character.items by it's order - 0 to N-1
     */
    function sell(idx: number, quantity: number): void;
    function is_disabled(entity:Entity): boolean;

    //async
    function compound(slot1: number, slot2: number, slot3: number, scroll: number, outputSlot?: number): Promise<any>;

    function bank_retrieve(pack: string, pack_num: number, inventorySlot: number): void;

    function bank_store(inventorySlot: number, pack: string, pack_num: number): void;

    function swap(a: number, b: number): void;

    function can_attack(entity: Entity): boolean;

    function equip(inventorySlot: number, slot?: string): void

    function buy_with_gold(item: ItemName, q: number): void;

    function use(skill: SkillName, target?: Entity): void;

    function reduce_cooldown(skill: SkillName, time: number): void;

    function use_skill(skill: SkillName, target?: Entity): void;
    function use_skill(skill: SkillName, targets: Entity[]): void;

    function heal(entity: Entity): void;

    function attack(entity: Entity): Promise<void>;

    function loot(): void;

    /**
     * Item is in the first slot[0], scroll is in the second[1]
     */
    function upgrade(itemPos: number, scrollPos: number, offeringPos?: number): void;

    function load_code(foo: string): void;

    function send_cm(to: string, data: any): void;

    function game_log(msg: string, color?: string): void;

    function leave_party(): void;

    function get_monster(id: string): Entity | undefined;

    function accept_party_invite(from: string): void;

    function get_nearest_monster(type?: { no_target?: boolean, type?: string, target?: string, min_xp?: number, max_att?: number },
                                 target?: Entity | string,
                                 where?: { min_xp: number, max_att: number }): Entity;

    function send_party_invite(to: string): void;

    function is_in_range(entity: Entity): boolean;
    function is_in_range(entity: Entity,skill:string): boolean;

    function get_targeted_monster(): any;

    function request_party_invite(to: string): void;

    function set_message(msg: string, colour?: string): void;

    function send_gold(target: Entity, number: number): void;

    function send_item(target: Entity, slot: number, cnt: number): void;

    function get_player(name: string): Entity | undefined;

    function set(name: string, value: any): void;

    function get(name: string): any;

    function change_target(target: Entity, send?: boolean): void;

    function get_target_of(entity: Entity): Entity | undefined;

    function distance(from: Entity | undefined, to: Entity | undefined): number;

    function simple_distance(from: Entity | undefined, to: Entity | undefined): number;

    function is_moving(entity: Entity): number;

    function move(x: number, y: number): void;

    function can_move_to(x: number, y: number): boolean;

    function bank_deposit(gold: number): Promise<void>;

    function smart_move(dest: IDestinationSmart | IDestination | Entity | string, onSuccess?: any): Promise<void>;

    function is_moving(char: any): void;

    function xmove(x: number, y: number): void;

    function show_json(stuff: any): void;

    function can_move(args: { map: string; x: number; y: number; going_x: number; going_y: number }): boolean;

    function stop(what: string): void;

    function clear_drawings(): void;

    function draw_circle(x: number, y: number, radius: number, size?: number, color?: number): Drawing;

    function draw_line(x: number, y: number, x2: number, y2: number, size?: number, color?: number): Drawing;

    var handle_command: undefined | ((command: string, args: string) => void);
    var on_cm: undefined | ((from: string, data: any) => void);
    // var on_map_click: undefined | ((x: number, y: number) => boolean);
    var on_party_invite: undefined | ((from: string) => void);
    var on_party_request: undefined | ((from: string) => void);
}

export type SkillName =
    | "use_town"
    | "move_right"
    | "blink"
    | "mluck"
    | "gm"
    | "hp"
    | "mp"
    | "darkblessing"
    | "monsterhunt"
    | "move_up"
    | "supershot"
    | "move_left"
    | "massproduction"
    | "interact"
    | "phaseout"
    | "revive"
    | "regen_hp"
    | "regen_mp"
    | "stack"
    | "charge"
    | "partyheal"
    | "3shot"
    | "quickpunch"
    | "rspeed"
    | "taunt"
    | "stomp"
    | "stop"
    | "shadowstrike"
    | "pure_eval"
    | "cburst"
    | "hardshell"
    | "use_mp"
    | "burst"
    | "toggle_inventory"
    | "toggle_stats"
    | "agitate"
    | "poisonarrow"
    | "warcry"
    | "mcourage"
    | "use_hp"
    | "curse"
    | "toggle_character"
    | "travel"
    | "5shot"
    | "move_down"
    | "esc"
    | "toggle_run_code"
    | "attack"
    | "heal"
    | "track"
    | "absorb"
    | "toggle_code"
    | "open_snippet"
    | "throw"
    | "invis"
    | "cleave"
    | "energize"
    | "light"
    | "snippet"
    | "mining"
    | "fishing"
    | "4fingers"
    | "quickstab"
    | "magiport"
    | "pcoat"
    | "scare";
