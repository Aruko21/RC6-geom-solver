import Primitive from "./Primitive/Primitive";
import PointDot from "./Primitive/Point";
import Line from "./Primitive/Line";


export default class Plotter {
    constructor({
        callback,
        eventScope,
        uicore
    }) {
        this.callback = callback;
        this.uicore = uicore;
        this.eventScope = eventScope;

        this.tmpElements = [];

        this.eventScope.addEventListener("pointAdd", this.pointAddHandler);
        this.eventScope.addEventListener("cancel", this.cancelPlotHandler);
    }

    pointAddHandler = (event) => {
        const pointEvent = event.detail;

        switch (pointEvent.objectType) {
            case Primitive.primitivesMap.point: {
                this.tmpElements.push(new PointDot({
                    point: pointEvent.point,
                    uicore: this.uicore
                }));
                this.addPrimitive(pointEvent.objectType);
                break;
            }
            case Primitive.primitivesMap.line: {
                if (this.tmpElements.length === 0) {
                    console.log("PLOT FIRST DOT");
                    this.tmpElements.push(new PointDot({
                        point: pointEvent.point,
                        uicore: this.uicore
                    }));
                } else if (this.tmpElements.length === 1) {
                    console.log("PLOT SECOND DOT");
                    this.tmpElements.push(new PointDot({
                        point: pointEvent.point,
                        uicore: this.uicore
                    }));
                    this.addPrimitive(pointEvent.objectType);
                }
                break;
            }
            default: {
                console.error("Unknown primitive type: ", pointEvent.objectType);
                console.trace();
            }
        }
    }

    cancelPlotHandler() {

    }

    addPrimitive(type) {
        switch (type) {
            case Primitive.primitivesMap.point: {
                this.callback(this.tmpElements[0]);
                break;
            }
            case Primitive.primitivesMap.line: {
                const line = new Line({
                    beginPoint: this.tmpElements[0],
                    endPoint: this.tmpElements[1],
                    uicore: this.uicore
                });
                this.callback(line);
                break;
            }
        }

        this.tmpElements = [];
    }
}