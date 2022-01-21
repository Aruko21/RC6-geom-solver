import Constraint from "./Constraint";

class JacobiansMap {
    constructor() {
    }

    getJacobian(constraintType, params) {
        switch(constraintType) {
            case Constraint.constraintMap.joint: {
                break;
            }
            case Constraint.constraintMap.distance: {
                break;
            }
            case Constraint.constraintMap.parallelism: {
                break;
            }
            case Constraint.constraintMap.perpendicularity: {
                break;
            }
            case Constraint.constraintMap.verticality: {
                break;
            }
            case Constraint.constraintMap.horizontality: {
                break;
            }
            case Constraint.constraintMap.angle: {
                break;
            }
            case Constraint.constraintMap.pointToLine: {
                break;
            }
            case Constraint.constraintMap.fixation: {
                break;
            }
            default: {
                console.error("Unknown type of constraint: ", constraintType);
                console.trace();
            }
        }
    }
}

const jacobiansMap = new JacobiansMap();

export default jacobiansMap;