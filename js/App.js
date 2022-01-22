import Action from "./Action";
import Solver from "./Solver/Solver";
import Plotter from "./Plotter";


export default class App {
    constructor(uicore) {
        this.uicore = uicore;
        this.canvasField = this.uicore.view.element;

        this.primitives = [];
        this.constraints = [];

        this.currentAction = new Action();
        this.solver = new Solver();
        this.plotter = new Plotter({
            callback: (primitive) => {
                this.primitives.push(primitive);
                this.canvasField.dispatchEvent(new CustomEvent("primitiveAdd"));
                this.updateActionState(Action.actionsMap.edit);
            },
            eventScope: this.canvasField,
            uicore: this.uicore
        });
    }

    init() {
        this.initGui();

        this.uicore.view.onMouseDown = (event) => {
            console.log("mouse down event: ", event.point);
            switch (this.currentAction.type) {
                case Action.actionsMap.create: {
                    this.canvasField.dispatchEvent(new CustomEvent("pointAdd", {detail: {
                            point: event.point,
                            objectType: this.currentAction.object
                        }}));
                    break;
                }
                case Action.actionsMap.constraint: {
                    this.canvasField.dispatchEvent(new CustomEvent("pointAdd", {detail: {
                            point: event.point,
                            objectType: this.currentAction.object
                        }}));
                    break;
                }
            }
        }

        // this.uicore.view.onMouseMove = (event) => {
        //     Catch hover on every item
            // this.uicore.project.hitTestAll(event.point);
        // }

        this.canvasField.addEventListener("needsolve", () => this.solver.solve(this.constraints));
    }

    initGui() {
        // Обработчики для изменения режима работы - редактирование, создание примитива/ограничения

        this.uicore.view.onKeyDown = (event) => {
            if (event.key === "escape") {
                this.updateActionState(Action.actionsMap.edit)
                this.canvasField.dispatchEvent(new Event("cancel"));
            }
        }

        document.querySelectorAll(".gs-primitive-create-btn").forEach((button) => {
            const primitiveType = button.dataset.primitive;
            button.addEventListener("click", (event) => {
                this.updateActionState(Action.actionsMap.create, primitiveType);
            });
        });

        document.querySelectorAll(".gs-constraint-create-btn").forEach((button) => {
            const constraintType = button.dataset.constraint;
            button.addEventListener("click", (event) => {
                this.updateActionState(Action.actionsMap.constraint, constraintType);
            });
        });
    }

    updateActionState(actionType, actionObject = "") {
        console.log(`action state update on '${actionType}' type with '${actionObject}' object`);
        this.currentAction.type = actionType;
        this.currentAction.object = actionObject;
    }
}
