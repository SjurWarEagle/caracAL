import {MoveOrder, Tools} from "./tools";

describe("check sorting", () => {
    it("store old positions - none", async () => {
        const tools = new Tools();
        const input: MoveOrder[] = [];
        let result = await tools.moveOrderExists({oldPosition: 1, newPosition: 2}, input);
        expect(result).toBeDefined();
        expect(result).toBeFalsy();

        input.push({newPosition: 0, oldPosition: 1})
        result = await tools.moveOrderExists({oldPosition: 1, newPosition: 2}, input);
        expect(result).toBeDefined();
        expect(result).toBeFalsy();

        input.push({newPosition: 1, oldPosition: 2})
        result = await tools.moveOrderExists({oldPosition: 1, newPosition: 2}, input);
        expect(result).toBeDefined();
        expect(result).toBeTruthy();

        input.splice(0);
        input.push({newPosition: 2, oldPosition: 1})
        result = await tools.moveOrderExists({oldPosition: 1, newPosition: 2}, input);
        expect(result).toBeDefined();
        expect(result).toBeTruthy();

    });
    it("store old positions - none", async () => {
        const tools = new Tools();
        const input: [] = [];
        await tools.storeOldPositions(input);
        expect(input).toBeDefined();
        expect(input.length).toBe(0);

    });
    it("store old positions - one", async () => {
        const tools = new Tools();
        const input: any[] = [];
        input.push({})
        await tools.storeOldPositions(input);
        expect(input).toBeDefined();
        expect(input.length).toBe(1);
        expect(input[0].oldPosition).toBe(0);
    });

    it("store old positions - small", async () => {
        const tools = new Tools();
        const input: any[] = [];
        input.push({name: 'b'})
        input.push({name: 'a'})
        const result = await tools.sortByName(input);
        expect(result).toBeDefined();
        expect(result.length).toBe(2);
        expect(result[0].name).toBe('a');
        expect(result[1].name).toBe('b');
    });

    it("calc move orders - none needed", async () => {
        const tools = new Tools();
        const input: any[] = [];
        input.push({name: 'a', oldPosition: 0})
        input.push({name: 'b', oldPosition: 1})
        // @ts-ignore
        const result = await tools.calculateInventoryMovesToBeSorted(input);
        expect(result).toBeDefined();
        expect(result.length).toBe(0);
    });

    it("calc move orders - small", async () => {
        const tools = new Tools();
        const input: any[] = [];
        input.push({name: 'b', oldPosition: 1})
        input.push({name: 'a', oldPosition: 0})
        // @ts-ignore
        const result = await tools.calculateInventoryMovesToBeSorted(input);
        expect(result).toBeDefined();
        expect(result.length).toBe(1);
    });

    it("calc move orders - med", async () => {
        const tools = new Tools();
        let input: any[] = [];
        input.push({name: 'a'})
        input.push({name: 'c'})
        input.push({name: 'b'})
        input.push({name: 'd'})
        // @ts-ignore
        await tools.storeOldPositions(input);
        input = await tools.sortByName(input);
        const result = await tools.calculateInventoryMovesToBeSorted(input);
        expect(result).toBeDefined();
        expect(result.length).toBe(1);
    });

    it("calc move orders - bigger", async () => {
        const tools = new Tools();
        let input: any[] = [];
        input.push({name: 'f'})
        input.push({name: 'a'})
        input.push({name: 'c'})
        input.push({name: 'b'})
        input.push({name: 'd'})
        input.push({name: 'e'})
        // @ts-ignore
        await tools.storeOldPositions(input);
        input = await tools.sortByName(input);
        const result = await tools.calculateInventoryMovesToBeSorted(input);
        expect(result).toBeDefined();
        expect(result.length).toBe(5);
    });

    it("movement loop detection - empty", async () => {
        const tools = new Tools();
        let input: any[] = [];
        const start = {oldPosition: 1, newPosition: 2};
        // @ts-ignore
        const result = await tools.checkForLoop(start, input, []);
        expect(result).toBeDefined();
        expect(result).toBeFalsy();
    });

    it("movement loop detection - yes", async () => {
        const tools = new Tools();
        let input: any[] = [];
        input.push({oldPosition: 1, newPosition: 2})
        input.push({oldPosition: 2, newPosition: 3})
        input.push({oldPosition: 3, newPosition: 1})
        input.push({oldPosition: 4, newPosition: 1})
        // @ts-ignore
        await tools.storeOldPositions(input);
        input = await tools.sortByName(input);
        const result = await tools.calculateInventoryMovesToBeSorted(input);
        expect(result).toBeDefined();
        expect(result).toBeTruthy();
    });

    it("movement loop detection - no", async () => {
        const tools = new Tools();
        let input: any[] = [];
        input.push({oldPosition: 1, newPosition: 6})
        input.push({oldPosition: 2, newPosition: 7})
        input.push({oldPosition: 3, newPosition: 8})
        input.push({oldPosition: 4, newPosition: 9})
        // @ts-ignore
        let result = await tools.checkForLoopStart(input);
        expect(result).toBeDefined();
        expect(result).toBeFalsy();
    });

    it("check loop - rl", async () => {
        const tools = new Tools();
        let input: any[] = [
            // 22 -> 0 -> 21 -> 24 -> 7 -> 8 -> 4 -> 18 -> 9 -> 19 -> 6 -> 20 -> 23 -> 17 -> 16 -> 2 -> 22
            {"oldPosition": 22, "newPosition": 0},
            {"oldPosition": 15, "newPosition": 1},
            {"oldPosition": 16, "newPosition": 2},
            {"oldPosition": 8, "newPosition": 4},
            {"oldPosition": 19, "newPosition": 6},
            {"oldPosition": 24, "newPosition": 7},
            {"oldPosition": 7, "newPosition": 8},
            {"oldPosition": 18, "newPosition": 9},
            {"oldPosition": 14, "newPosition": 13},
            {"oldPosition": 27, "newPosition": 14},
            {"oldPosition": 13, "newPosition": 15},
            {"oldPosition": 17, "newPosition": 16},
            {"oldPosition": 23, "newPosition": 17},
            {"oldPosition": 4, "newPosition": 18},
            {"oldPosition": 9, "newPosition": 19},
            {"oldPosition": 6, "newPosition": 20},
            {"oldPosition": 0, "newPosition": 21},
            {"oldPosition": 2, "newPosition": 22},
            {"oldPosition": 20, "newPosition": 23},
            {"oldPosition": 21, "newPosition": 24},
            {"oldPosition": 1, "newPosition": 25},
            {"oldPosition": 25, "newPosition": 26},
            {"oldPosition": 26, "newPosition": 27}
        ];
        // @ts-ignore
        let result = await tools.checkForLoopStart(input);
        expect(result).toBeDefined();
        expect(result).toBeTruthy();
    });

    it("debug", async () => {
        const tools = new Tools();
        let input: any[] = [
            // 22 -> 0 -> 21 -> 24 -> 7 -> 8 -> 4 -> 18 -> 9 -> 19 -> 6 -> 20 -> 23 -> 17 -> 16 -> 2 -> 22
            {"oldPosition": 122, "newPosition": 20},
            {"oldPosition": 22, "newPosition": 0},
            {"oldPosition": 15, "newPosition": 1},
            {"oldPosition": 16, "newPosition": 2},
            {"oldPosition": 8, "newPosition": 4},
            {"oldPosition": 19, "newPosition": 6},
            {"oldPosition": 24, "newPosition": 7},
            {"oldPosition": 7, "newPosition": 8},
            {"oldPosition": 18, "newPosition": 9},
            {"oldPosition": 14, "newPosition": 13},
            {"oldPosition": 27, "newPosition": 14},
            {"oldPosition": 13, "newPosition": 15},
            {"oldPosition": 17, "newPosition": 16},
            {"oldPosition": 23, "newPosition": 17},
            {"oldPosition": 4, "newPosition": 18},
            {"oldPosition": 9, "newPosition": 19},
            {"oldPosition": 6, "newPosition": 20},
            {"oldPosition": 0, "newPosition": 21},
            {"oldPosition": 2, "newPosition": 22},
            {"oldPosition": 20, "newPosition": 23},
            {"oldPosition": 21, "newPosition": 24},
            {"oldPosition": 1, "newPosition": 25},
            {"oldPosition": 25, "newPosition": 26},
            {"oldPosition": 26, "newPosition": 27}
        ];
        // @ts-ignore
        expect(input).toBeDefined();
        // expect(input.length).toBe(23);
        expect(input.length).not.toBe(0);
        const rc = await tools.checkForLoop({"oldPosition": 122, "newPosition": 120}, input);
        expect(rc).toBeDefined();
        expect(rc).toBeFalsy();
        await tools.breakCircles(input);
        expect(input).toBeDefined();
        expect(input.length).not.toBe(0);
        expect(input.length).toBe(19);
    });
});
