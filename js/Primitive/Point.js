import Primitive from "./Primitive";

export default class PointDot extends Primitive {
    static dotRadius = 2;

    constructor({
        point,
        ...args
    } = {}) {
        super(args);

        const pointView = new this.uicore.Path.Circle(new this.uicore.Point(point), PointDot.dotRadius);

        pointView.style = {
            fillColor: "black",
            strokeColor: "black",
            strokeWidth: 1
        };

        // point.x, point.y
        this.point = null;
    }
}