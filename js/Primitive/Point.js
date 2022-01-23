import Primitive from "./Primitive";

export default class PointDot extends Primitive {
    static dotRadius = 2;

    constructor({
        point,
        ...args
    } = {}) {
        super(args);
        this.type = Primitive.primitivesMap.point;

        this.point = new this.uicore.Point(point);
        this.pointView = new this.uicore.Path.Circle(this.point, PointDot.dotRadius);
        this.point = this.pointView.position;

        this.pointView.style = {
            fillColor: "black",
            strokeColor: "black",
            strokeWidth: 1
        };

        this.globalId = null;

        this.init();
    }

    init() {
        // this.pointView.onHover = () => {
        //     console.log("hover");
        // }
        this.pointView.onClick = () => {
            this.eventScope.dispatchEvent(new CustomEvent("itemSelect", {detail: {
                item: this
            }}));
        }
        this.pointView.onMouseDrag = (event) => {
            console.log("drag");
            const mouseX = event.point.x;
            const mouseY = event.point.y;
            const deltaX = mouseX - this.point.x;
            const deltaY = mouseY - this.point.y;
            console.log("check: ", deltaX, deltaY);

            if ((Math.abs(deltaX) >= 3 || Math.abs(deltaY) >= 3)
                && (Math.abs(deltaX) <= 50 || Math.abs(deltaY) <= 50))
            {
                this.moveDelta(new this.uicore.Point(deltaX, deltaY));
            } else if (Math.abs(deltaX) >= 50 || Math.abs(deltaY) >= 50) {
                console.log("delta is more than 50");
            }
        }
        this.pointView.onMouseMove = () => {
            this.pointView.style.strokeColor = "#1E90FF";
        }
        this.pointView.onMouseLeave = () => {
            this.pointView.style.strokeColor = "black";
        }
    }

    moveDelta(delta) {
        this.point.x += delta.x;
        this.point.y += delta.y;
        // this.pointView.position = this.pointView.position.add(delta);
        // this.point = this.pointView.position;
        console.log("check point view: ", this.pointView);
    }

    getPoints() {
        return [this,];
    }
}