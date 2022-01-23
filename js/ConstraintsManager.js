import Constraint from "./Solver/Constraint";
import PointDot from "./Primitive/Point";
import Line from "./Primitive/Line";

export default class ConstraintsManager {
    constructor({
        callback,
        eventScope
    }) {
        this.callback = callback;
        this.eventScope = eventScope;

        this.tmpElements = [];
        this.params = {};

        this.eventScope.addEventListener("constraintItemAdd", this.addItemToConstraint);
        this.eventScope.addEventListener("cancel", this.cancelConstraintHandler);
    }

    addItemToConstraint = (event) => {
        const constraintType = event.detail.type;
        const constraintItem = event.detail.item;

        switch (constraintType) {
            case Constraint.constraintMap.fixation: {
                if (this.checkOnePoint(constraintItem, constraintType)) {
                    this.addConstraint(constraintType);
                }
                break;
            }
            case Constraint.constraintMap.distance: {
                if (this.checkTwoPoints(constraintItem, constraintType)) {
                    this.params.distance = prompt("Enter the distance: ");
                    this.addConstraint(constraintType);
                }
                break;
            }
            case Constraint.constraintMap.joint: {
                if (this.checkTwoPoints(constraintItem, constraintType)) {
                    this.addConstraint(constraintType);
                }
                break;
            }
            case Constraint.constraintMap.horizontality:
            case Constraint.constraintMap.verticality: {
                if (this.checkOneLine(constraintItem, constraintType)) {
                    this.addConstraint(constraintType);
                }
                break;
            }
            case Constraint.constraintMap.parallelism:
            case Constraint.constraintMap.perpendicularity: {
                if (this.checkTwoLines(constraintItem, constraintType)) {
                    this.addConstraint(constraintType);
                }
                break;
            }
            case Constraint.constraintMap.pointToLine: {
                if (this.checkLineAndPoint(constraintItem, constraintType)) {
                    this.addConstraint(constraintType);
                }
                break;
            }
            case Constraint.constraintMap.angle: {
                if (this.checkTwoLines(constraintItem, constraintType)) {
                    this.params.angle = prompt("Enter the angle: ");
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

    checkOnePoint(constraintItem, constraintType) {
        if (constraintItem instanceof PointDot) {
            console.log("add element for fixation");
            this.tmpElements.push(constraintItem);
            return true;
        } else {
            alert(`'${constraintType}' constraint requires a Point`)
        }
        return false;
    }
    checkTwoPoints(constraintItem, constraintType) {
        if (this.tmpElements.length === 0) {
            if (constraintItem instanceof PointDot) {
                console.log("add first element for constraint");
                this.tmpElements.push(constraintItem);
            } else {
                alert(`'${constraintType}' constraint requires a Points`)
            }
        } else if (this.tmpElements.length === 1) {
            if (constraintItem instanceof PointDot) {
                console.log("add second element for constraint");
                this.tmpElements.push(constraintItem);
                return true;
            } else {
                alert(`'${constraintType}' constraint requires a Points`)
            }
        }
        return false;
    };
    checkOneLine(constraintItem, constraintType) {
        if (constraintItem instanceof Line) {
            console.log("add element for fixation");
            this.tmpElements.push(constraintItem);
            return true;
        } else {
            alert(`'${constraintType}' constraint requires a Line`)
        }
        return false;
    }
    checkTwoLines(constraintItem, constraintType) {
        if (this.tmpElements.length === 0) {
            if (constraintItem instanceof Line) {
                console.log("add first element for constraint");
                this.tmpElements.push(constraintItem);
            } else {
                alert(`'${constraintType}' constraint requires a Lines`)
            }
        } else if (this.tmpElements.length === 1) {
            if (constraintItem instanceof Line) {
                console.log("add second element for constraint");
                this.tmpElements.push(constraintItem);
                return true;
            } else {
                alert(`'${constraintType}' constraint requires a Lines`)
            }
        }
        return false;
    }
    checkLineAndPoint(constraintItem, constraintType) {
        if (this.tmpElements.length === 0) {
            console.log("add first element for constraint");
            this.tmpElements.push(constraintItem);
        } else if (this.tmpElements.length === 1) {
            if ((this.tmpElements[0] instanceof Line && constraintType instanceof PointDot) ||
                (this.tmpElements[0] instanceof PointDot && constraintType instanceof Line)) {
                console.log("add second element for constraint");
                this.tmpElements.push(constraintItem);
                return true;
            } else {
                alert(`'${constraintType}' constraint requires a Point and Line`);
                this.tmpElements = [];
            }
        }
        return false;
    }

    addConstraint(type) {
        console.log("check constraints: ", this.tmpElements);
        this.callback(new Constraint({
            elements: [...this.tmpElements],
            type: type,
            params: this.params
        }));
        this.tmpElements = [];
    }
}