import Action from "./Action";

export default class App {
    constructor(uicore) {
        this.uicore = uicore;

        this.primitives = [];
        this.constraints = [];

        this.currentAction = new Action();
    }

    init() {


        this.uicore.view.onMouseDown = (event) => {
            console.log("mouse down event: ", event.point);
        }
    }

    initGui() {
        console.log("check view: ", this.uicore.view);
    }
}