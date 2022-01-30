export default class Primitive {
    static uniqueId = 1;

    static primitivesMap = {
        point: "point",
        line: "line"
    };

    constructor({
        uicore
    } = {}) {
        this.id = Primitive.uniqueId++;
        this.uicore = uicore;
        this.eventScope = this.uicore.view.element;
        this.type = null;
    }
}