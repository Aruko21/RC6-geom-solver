import Primitive from "./Primitive";

export default class Line extends Primitive {
    constructor() {
        super();

        this.beginPoint = null;
        this.endPoint = null;
        this.angle = 0.0;
        this.length = 0.0;

        this.type = PointDot.primitivesMap.line;
    }

    getPoints() {
        return [this.beginPoint, this.endPoint];
    }
}