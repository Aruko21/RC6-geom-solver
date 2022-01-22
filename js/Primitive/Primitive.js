export default class Primitive {
    static primitivesMap = {
        point: "point",
        line: "line"
    };

    constructor({
        uicore
    } = {}) {
        this.uicore = uicore;
        this.eventScope = this.uicore.view.element;
        this.type = null;
    }
}