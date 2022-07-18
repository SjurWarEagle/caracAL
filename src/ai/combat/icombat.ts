import {TargetInformation} from "./target-information";

export interface ICombat {
    attack(): Promise<void>;
    setTargetInfo(targetInformation: TargetInformation): Promise<void>;
}
