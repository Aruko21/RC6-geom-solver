

export default class ConstraintsManager {
    constructor({
        callback,
        eventScope
    }) {
        this.callback = callback;
        this.eventScope = eventScope;

        this.tmpElements = [];

        this.eventScope.addEventListener("constraintItemAdd", this.addItemToConstraint);
        this.eventScope.addEventListener("cancel", this.cancelConstraintHandler);
    }

    addItemToConstraint() {

    }

    cancelConstraintHandler() {

    }
}