import Primitive from "./Primitive";

export default class Line extends Primitive {
    constructor({
        beginPoint,
        endPoint,
        ...args
    }) {
        super(args);

        this.type = PointDot.primitivesMap.line;

        this.beginPoint = beginPoint;
        this.endPoint = endPoint;
        this.angle = endPoint.point.subtract(beginPoint.point).angle;
        this.length = endPoint.point.getDistance(beginPoint.point);

        // let segments = [this.beginPoint.point, this.endPoint.point];
        // this.lineView = new this.uicore.Path(segments);

        this.lineView = new this.uicore.Path.Line(beginPoint.point, endPoint.point);
        console.log("check line: ", this.lineView);

        // this.beginPoint.pointView.position = this.lineView.segments[0].point;
        // this.beginPoint.point = this.beginPoint.pointView.position;
        //
        // this.endPoint.pointView.position = this.lineView.segments[1].point;
        // this.endPoint.point = this.endPoint.pointView.position;

        this.lineView.style = {
            strokeColor: "black",
            strokeWidth: 1
        };

    }

    getPoints() {
        return [this.beginPoint, this.endPoint];
    }
}