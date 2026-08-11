export class OpAction {
    constructor(data = {}) {
        this.name = data.name || '';
        this.ap = data.ap || '';
        this.text = data.text || '';
    }
}

export class BaseOp {
    constructor(data = {}) {
        this.id = data.id || '';
        this.title = data.title || '';
        this.rule = data.rule || null;
        this.mission_actions = (data.mission_actions || []).map(action => new OpAction(action));
        this.victory_points = data.victory_points || '';
    }
}

export class CritOp extends BaseOp {
    constructor(data = {}) {
        super(data);
        this.number = data.number || 0;
    }

    get typeText() {
        return `CRIT OP`;
    }

    get typeClass() {
        return 'crit';
    }
}

export class TacOp extends BaseOp {
    constructor(data = {}) {
        super(data);
        this.archetypeId = data.archetypeId || '';
        this.archetype = data.archetype || '';
        this.reveal = data.reveal || '';
    }

    get typeText() {
        return `TAC OP - ` + this.archetype;
    }

    get typeClass() {
        return this.archetypeId;
    }
}
