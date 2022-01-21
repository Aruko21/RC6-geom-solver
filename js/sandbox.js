export default class Sandbox {
    constructor(uicore) {
        this.uicore = uicore;

        this.values = {
            fixLength: false,
            fixAngle: false,
            showCircle: false,
            showAngleLength: true,
            showCoordinates: false
        };

        this.vectorStart = new this.uicore.Point();
        this.vector = null;
        this.vectorPrevious = null;
        this.vectorItem = null;
        this.items = [];
        this.dashedItems = [];

        this.dashItem = null;
    }

    init() {
        // Example from paper.js docs

        this.uicore.view.onMouseDown = (event) => {
            console.log("mouse down event");

            const end = this.vectorStart.add(this.vector);
            let create = false;

            if (event.modifiers.shift && this.vectorItem) {
                this.vectorStart = end;
                create = true;
            } else if (this.vector && (event.modifiers.option || end && end.getDistance(event.point) < 10)) {
                create = false;
            } else {
                this.vectorStart = event.point;
            }
            if (create) {
                this.dashItem = this.vectorItem;
                this.vectorItem = null;
            }
            this.processVector(event, true);
            //	document.redraw();
        };

        this.uicore.view.onMouseDrag = (event) => {
            console.log("mouse drag event");
            if (!event.modifiers.shift && this.values.fixLength && this.values.fixAngle) {
                this.vectorStart = event.point;
            }

            this.processVector(event, event.modifiers.shift);
        };

        this.uicore.view.onMouseUp = (event) => {
            console.log("mouse up event");
            this.processVector(event, false);
            if (this.dashItem) {
                this.dashItem.dashArray = [1, 2];
                this.dashItem = null;
            }
            this.vectorPrevious = this.vector;
        };
    }

    processVector(event, drag) {
        console.log("check event.point: ", event.point);
        this.vector = event.point.subtract(this.vectorStart);
        if (null != this.vectorPrevious) {
            if (this.values.fixLength && this.values.fixAngle) {
                this.vector = this.vectorPrevious;
            } else if (this.values.fixLength) {
                this.vector.length = this.vectorPrevious.length;
            } else if (this.values.fixAngle) {
                this.vector = this.vector.project(this.vectorPrevious);
            }
        }
        this.drawVector(drag);
    }

    drawVector(drag) {
        if (null != this.items) {
            this.items.forEach((item) => item.remove());
        }

        if (this.vectorItem) {
            this.vectorItem.remove();
        }

        this.items = [];
        // Приведение вектора к указанной длине (нормирование)
        const arrowVector = this.vector.normalize(10);

        const end = this.vectorStart.add(this.vector);
        this.vectorItem = new this.uicore.Group([
            new this.uicore.Path([this.vectorStart, end]),
            new this.uicore.Path([
                end + arrowVector.rotate(135),
                end,
                end + arrowVector.rotate(-135)
            ])
        ]);

        this.vectorItem.strokeWidth = 0.75;
        this.vectorItem.strokeColor = '#e4141b';
        // Display:
        this.dashedItems = [];
        // Draw Circle
        if (this.values.showCircle) {
            this.dashedItems.push(new this.uicore.Path.Circle({
                center: this.vectorStart,
                radius: this.vector.length
            }));
        }
        // Draw Labels
        if (this.values.showAngleLength) {
            this.drawAngle(this.vectorStart, this.vector, !drag);
            if (!drag)
                this.drawLength(this.vectorStart, end, this.vector.angle < 0 ? -1 : 1, true);
        }

        const quadrant = this.vector.quadrant;
        if (this.values.showCoordinates && !drag) {
            this.drawLength(this.vectorStart, this.vectorStart + [this.vector.x, 0],
                [1, 3].indexOf(quadrant) !== -1 ? -1 : 1, true, this.vector.x, 'x: ');
            this.drawLength(this.vectorStart, this.vectorStart + [0, this.vector.y],
                [1, 3].indexOf(quadrant) !== -1 ? 1 : -1, true, this.vector.y, 'y: ');
        }
        this.dashedItems.forEach((item) => {
            item.strokeColor = 'black';
            item.dashArray = [1, 2];
            this.items.push(item);
        });
        // Update palette
        this.values.x = this.vector.x;
        this.values.y = this.vector.y;
        this.values.length = this.vector.length;
        this.values.angle = this.vector.angle;
    }

    drawAngle(center, vector, label) {
        const radius = 25, threshold = 10;

        if (vector.length < radius + threshold || Math.abs(vector.angle) < 15) { return; }

        const from = new this.uicore.Point(radius, 0);
        const through = from.rotate(this.vector.angle / 2);
        const to = from.rotate(this.vector.angle);
        const end = center + to;

        this.dashedItems.push(new this.uicore.Path.Line(
            center, center.add( new this.uicore.Point(radius + threshold, 0) )
        ));

        this.dashedItems.push(new this.uicore.Path.Arc(center + from, center + through, end));

        const arrowVector = to.normalize(7.5).rotate(this.vector.angle < 0 ? -90 : 90);
        this.dashedItems.push(new this.uicore.Path([
            end + arrowVector.rotate(135),
            end,
            end + arrowVector.rotate(-135)
        ]));

        if (label) {
            // Angle Label
            const text = new this.uicore.PointText(
                center.add(through.normalize(radius + 10).add(new this.uicore.Point(0, 3)))
            );

            text.content = Math.floor(vector.angle * 100) / 100 + '°';
            text.fillColor = 'black';
            this.items.push(text);
        }
    }

    drawLength(fromPoint, to, sign, label, value, prefix) {
        const lengthSize = 5;
        if ((to.subtract(fromPoint)).length < lengthSize * 4) { return; }

        this.vector = to.subtract(fromPoint);
        const awayVector = this.vector.normalize(lengthSize).rotate(90 * sign);
        const upVector = this.vector.normalize(lengthSize).rotate(45 * sign);
        const downVector = upVector.rotate(-90 * sign);
        const lengthVector = this.vector.normalize(
            this.vector.length / 2 - lengthSize * Math.sqrt(2)
        );
        const line = new this.uicore.Path();
        line.add(fromPoint.add(awayVector));
        line.lineBy(upVector);
        line.lineBy(lengthVector);
        line.lineBy(upVector);

        const middle = line.lastSegment.point;
        line.lineBy(downVector);
        line.lineBy(lengthVector);
        line.lineBy(downVector);
        this.dashedItems.push(line);
        if (label) {
            // Length Label
            const textAngle = Math.abs(this.vector.angle) > 90
                ? 180 + this.vector.angle : this.vector.angle;
            // Label needs to move away by different amounts based on the
            // vector's quadrant:
            const away = (sign >= 0 ? [1, 4] : [2, 3]).indexOf(this.vector.quadrant) !== -1 ? 8 : 0;
            value = value || this.vector.length;
            const text = new this.uicore.PointText({
                point: middle + awayVector.normalize(away + lengthSize),
                content: (prefix || '') + Math.floor(value * 1000) / 1000,
                fillColor: 'black',
                justification: 'center'
            });
            text.rotate(textAngle);
            this.items.push(text);
        }
    }
}
