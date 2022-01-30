import Primitive from "./Primitive/Primitive";


export default class Sidebar {
    static sidebarId = "sidebar-menu";
    static primitivesListId = "primitives-list";
    static constraintsListId = "constraints-list";

    constructor({
        eventScope,
        primitives,
        constraints
    }) {
        this.element = document.getElementById(Sidebar.sidebarId);
        this.primitivesList = document.getElementById(Sidebar.primitivesListId);
        this.constraintsList = document.getElementById(Sidebar.constraintsListId);

        this.eventScope = eventScope;

        this.primitives = primitives;
        this.constraints = constraints;

        this.eventScope.addEventListener("primitiveAdd", this.update);
        this.eventScope.addEventListener("primitiveMove", this.update);
        this.eventScope.addEventListener("constraintAdd", this.update);
    }

    update = () => {
        this.primitivesList.innerHTML = "";
        this.constraintsList.innerHTML = "";

        this.primitives.forEach((primitive) => {
            const element = this.getPrimitiveItem(primitive);
            this.primitivesList.appendChild(element);
        });

        this.constraints.forEach((constraint) => {
            const element = this.getConstraintItem(constraint);
            this.constraintsList.appendChild(element);
        });
    }

    getPrimitiveItem(primitive) {
        const item = document.createElement("li");
        const itemTextWrapper = document.createElement("div");
        item.className = "nav-item";
        itemTextWrapper.className = "nav-link p-0";

        let itemText = "";
        switch (primitive.type) {
            case Primitive.primitivesMap.point: {
                const pointX = primitive.point.x.toFixed(1);
                const pointY = primitive.point.y.toFixed(1);
                itemText = `[${primitive.id}] Point | <span class="text-muted">(x:${pointX}; y:${pointY})</span>`;
                break;
            }
            case Primitive.primitivesMap.line: {
                const beginX = primitive.beginPoint.point.x.toFixed(1);
                const beginY = primitive.beginPoint.point.y.toFixed(1);
                const endX = primitive.endPoint.point.x.toFixed(1);
                const endY = primitive.endPoint.point.y.toFixed(1);
                itemText = `[${primitive.id}] Line | <span class="text-muted">(x:${beginX}; y:${beginY}) (x:${endX}; y:${endY})</span>`;
                break;
            }
            default: {
                throw new Error(`[Sidebar Error]: there's no primitive type: ${primitive.type}`);
            }
        }

        itemTextWrapper.innerHTML = itemText;
        item.appendChild(itemTextWrapper);

        return item;
    }

    getConstraintItem(constraint) {
        const item = document.createElement("li");
        const itemTextWrapper = document.createElement("div");
        item.className = "nav-item";
        itemTextWrapper.className = "nav-link p-0";

        let primitivesTextList = [];
        constraint.elements.forEach((primitive) => {
            primitivesTextList.push(`${primitive.type} (id: ${primitive.id})`);
        });

        const itemText = `[${constraint.id}] ${constraint.type} |  <span class="text-muted"> primitives: [${primitivesTextList.join("; ")}] </span>`;

        itemTextWrapper.innerHTML = itemText;
        item.appendChild(itemTextWrapper);

        return item;
    }
}
