import jacobiansMap from "./JacobiansMap";
import {all} from "mathjs";

export default class Constraint {
    static constraintMap = {
        joint: "joint",
        distance: "distance",
        parallelism: "parallelism",
        perpendicularity: "perpendicularity",
        verticality: "verticality",
        horizontality: "horizontality",
        angle: "angle",
        pointToLine: "point-to-line",
        fixation: "fixation"
    };

    constructor({
        elements,
        type,
        params
    }) {
        // список элементов, участвующих в ограничении (точки и линии)
        this.elements = elements;

        // список элементов, участвующих в ограничении (лямбды)
        this.lambdasIdx = [];
        
        this.type = type;
        this.params = params;
        // params.distance = что-то
        // params.angle = угол

        this.isNeedSolving = true;
    }

    getPoints() {
        let allPoints = [];
        this.elements.forEach(primitive => allPoints.push(...primitive.getPoints()));
        return allPoints;
    }
}