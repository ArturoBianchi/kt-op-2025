export class TurningPointsModel {
    constructor(data = {}){
        this.crit = data.crit ?? 0;
        this.tac = data.tac ?? 0;
        this.kills = data.kills ?? 0;
    }

    get totalScore() {
        return this.crit + this.tac + this.kills;
    }
}