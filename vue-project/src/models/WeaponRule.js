export class WeaponRule {
    constructor(data = {}){
        this.id = data.id ?? 0;
        this.name = data.nome ?? 0;
        this.text = data.testo ?? 0;
    }
}