import Primitive from "./Primitive";

export default class Line extends Primitive {
    constructor({
        beginPoint,
        endPoint,
        ...args
    }) {
        super(args);

        this.type = Primitive.primitivesMap.line;

        this.beginPoint = beginPoint;
        this.endPoint = endPoint;
        this.angle = endPoint.point.subtract(beginPoint.point).angle;
        this.length = endPoint.point.getDistance(beginPoint.point);

        // let segments = [this.beginPoint.point, this.endPoint.point];
        // this.lineView = new this.uicore.Path(segments);

        this.lineView = new this.uicore.Path.Line(beginPoint.point, endPoint.point);
        console.log("check line: ", this.lineView);

        this.beginPoint.moveCallback = (newPosition) => {
            this.lineView.segments[0].point = newPosition;
        };
        this.endPoint.moveCallback = (newPosition) => {
            this.lineView.segments[1].point = newPosition;
        };

        this.lineView.style = {
            strokeColor: "black",
            strokeWidth: 1
        };

        this.init();
    }

    init() {
        this.lineView.onClick = () => {
            this.eventScope.dispatchEvent(new CustomEvent("itemSelect", {detail: {
                item: this
            }}));
        }

        this.lineView.onMouseDrag = (event) => {
            console.log("drag");
            // const mouseX = event.point.x;
            // const mouseY = event.point.y;
            // const deltaX = mouseX - this.point.x;
            // const deltaY = mouseY - this.point.y;
            // console.log("check: ", deltaX, deltaY);
            //
            // if ((Math.abs(deltaX) >= 3 || Math.abs(deltaY) >= 3)
            //     && (Math.abs(deltaX) <= 50 || Math.abs(deltaY) <= 50))
            // {
            //     this.moveDelta(new this.uicore.Point(deltaX, deltaY));
            // } else if (Math.abs(deltaX) >= 50 || Math.abs(deltaY) >= 50) {
            //     console.log("delta is more than 50");
            // }
            this.lineView.translate(event.delta);
            this.beginPoint.moveDelta(event.delta);
            this.endPoint.moveDelta(event.delta);
            this.eventScope.dispatchEvent(new CustomEvent("needSolve"));
        }
        this.lineView.onMouseMove = () => {
            this.lineView.style.strokeColor = "#1E90FF";
        }
        this.lineView.onMouseLeave = () => {
            this.lineView.style.strokeColor = "black";
        }
    }

    getPoints() {
        return [this.beginPoint, this.endPoint];
    }
}