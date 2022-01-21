export default class Action {
    static actionsMap = {
        edit: "edit",
        create: "create",
        constraint: "constraint"
    };

    constructor(actionType = Action.actionsMap.edit, actionObject = "") {
        this.type = actionType;
        this.object = actionObject;

    }
}