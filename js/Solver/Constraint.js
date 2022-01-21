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
        // список элементов, участвующих в ограничении
        this.elements = [];
        this.type = Constraint.constraintMap.joint;
        this.params = {};
        // params.distance = что-то
        // params.angle = угол говна
    }
}