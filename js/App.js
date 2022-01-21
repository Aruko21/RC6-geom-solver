import Action from "./Action";

export default class App {
    constructor(uicore) {
        this.uicore = uicore;
        this.canvasField = this.uicore.view.element;

        this.primitives = [];
        this.constraints = [];

        this.currentAction = new Action();
    }

    init() {
        this.initGui();

        this.uicore.view.onMouseDown = (event) => {
            console.log("mouse down event: ", event.point);
            if (this.currentAction.type === Action.actionsMap.create) {
                switch (this.currentAction.object) {
                    case "point": {
                        console.log("Point primitive creating");
                        const pointView = new this.uicore.Path.Circle(new this.uicore.Point(event.point), 2);
                        pointView.style = {
                            fillColor: "black",
                            strokeColor: "black",
                            strokeWidth: 1
                        };
                        this.primitives.push(pointView);
                        break;
                    }
                    case "line": {
                        console.log("Line primitive creating");
                        break;
                    }
                    default: {
                        console.error("Unknown type of primitive: ", this.currentAction.object)
                    }
                }
            }
        }
    }

    initGui() {
        // Обработчики для изменения режима работы - редактирование, создание примитива/ограничения

        this.uicore.view.onKeyDown = (event) => {
            if (event.key === "escape") {
                this.updateActionState(Action.actionsMap.edit)
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
