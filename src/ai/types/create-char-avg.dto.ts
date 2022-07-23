export class CreateCharAvgDto {
    /**
     * creation timestamp
     */
    public createdAt?: number;

    public receivedHits?: number;
    public charName?: string;
    public kills?: number;
    public interval?: number;
    public cntDoneAttack: number = 0;
    public cntMissed: number = 0;
    public cntHit: number = 0;
    public cntKill: number = 0;
    public deltaGold: number = 0;
    public deltaXP: number = 0;
    public damageDone: number = 0;
    public damageTaken: number = 0;
}
