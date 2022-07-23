import {CreateCharAvgDto} from "../types/create-char-avg.dto";

export class CharAvgCollector {
    private avgData = new CreateCharAvgDto();

    public getAndReset(): CreateCharAvgDto {
        this.avgData.deltaXP = character.xp - this.avgData.deltaXP;
        this.avgData.deltaGold = character.gold - this.avgData.deltaGold;
        const tmp = JSON.parse(JSON.stringify(this.avgData));
        this.avgData = new CreateCharAvgDto();
        this.avgData.charName = character.name;
        this.avgData.deltaXP = character.xp;
        this.avgData.deltaGold = character.gold;
        this.avgData.interval = 60_000;
        return tmp;
    }

    public async startCollecting() {
        game.all((eventName: string, data: any) => {
            if (data.actor !== character.name) {
                //not for me
                return;
            }
            if (eventName === 'hit') {
                this.avgData.cntDoneAttack++;
                if (data.kill) {
                    this.avgData.cntKill++;
                }
                if (data.miss) {
                    this.avgData.cntMissed++;
                } else {
                    this.avgData.cntHit++;
                    this.avgData.damageDone += data.damage;
                }
            }
        })
    }
}
