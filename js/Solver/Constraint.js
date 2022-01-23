import jacobiansMap from "./JacobiansMap";

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
        type
    }) {
        // список элементов, участвующих в ограничении (точки и линии)
        this.elements = elements;

        // список элементов, участвующих в ограничении (лямбды)
        this.lambdasIdx = [];
        
        this.type = type;
        this.params = {
            distance: null,
            angle: null
        };
        // params.distance = что-то
        // params.angle = угол
    }
}