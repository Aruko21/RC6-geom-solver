export default class Primitive {
    static primitivesMap = {
        point: "point",
        line: "line"
    };

    constructor({
        uicore
    } = {}) {
        this.uicore = uicore;
        this.type = null;
    }
}