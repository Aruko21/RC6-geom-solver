import jacobiansMap from "./JacobiansMap";

export default class Constraint {
    static constraintMap = {
        joint: "point",
        distance: "line",
        parallelism: "parallelism",
        perpendicularity: "perpendicularity",
        verticality: "verticality",
        horizontality: "horizontality",
        angle: "angle",
        pointToLine: "point-to-line",
        fixation: "fixation"
    };

    constructor() {
        // список элементов, участвующих в ограничении (точки и линии)
        this.elements = [];

        // список элементов, участвующих в ограничении (лямбды)
        this.lambdasIdx = [];
        
        this.type = Constraint.constraintMap.joint;
        this.params = {
            distance: null,
            angle: null
        };
        // params.distance = что-то
        // params.angle = угол
    }
}