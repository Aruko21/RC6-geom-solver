import Constraint from "./Solver/Constraint";

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

    addItemToConstraint = (event) => {
        const constraintType = event.detail.type;
        const constraintItem = event.detail.item;

        switch (constraintType) {
            case Constraint.constraintMap.fixation: {
                console.log("add element for fixation");
                this.tmpElements.push(constraintItem);
                this.addConstraint(constraintType);
                break;
            }
            case Constraint.constraintMap.joint:
            case Constraint.constraintMap.distance:
            case Constraint.constraintMap.parallelism:
            case Constraint.constraintMap.perpendicularity:
            case Constraint.constraintMap.horizontality:
            case Constraint.constraintMap.verticality:
            case Constraint.constraintMap.pointToLine:
            case Constraint.constraintMap.angle: {
                if (this.tmpElements.length === 0) {
                    console.log("add first element for constraint");
                    this.tmpElements.push(constraintItem);
                } else if (this.tmpElements.length === 1) {
                    console.log("add second element for constraint");
                    this.tmpElements.push(constraintItem);
                    this.addConstraint(constraintType);
                }
                break;
            }
            default: {
                console.error("Unknown constraint type: ", constraintType);
                console.trace();
            }
        }
    }

    cancelConstraintHandler() {

    }

    addConstraint(type) {
        console.log("check constraints: ", this.tmpElements);
        this.callback(new Constraint({
            elements: [...this.tmpElements],
            type: type
        }));
        this.tmpElements = [];
    }
}