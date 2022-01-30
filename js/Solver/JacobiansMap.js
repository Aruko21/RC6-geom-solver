import Constraint from "./Constraint";
import matrices, {cos, create, all} from "mathjs";

const math = create(all)

class JacobiansMap {
    constructor() {
    }

    getJacobian(constraint, deltaX, params) {
        let j = 0;

        switch (constraint.type) {
            case Constraint.constraintMap.joint: {
                /*  deltaX: [0] - dx1,          constraint.elements:    [0] - point1,
                            [1] - dy1,                                  [1] - point2
                            [2] - dx2, 
                            [3] - dy2, 
                            [4] - lambda1
                            [5] - lambda2
                */
                j = [[1, 0, 0, 0, -1, 0],    //dx1
                    [0, 1, 0, 0, 0, -1],     //dy1
                    [0, 0, 1, 0, 1, 0],    //dx2
                    [0, 0, 0, 1, 0, 1],     //dy2
                    [-1, 0, 1, 0, 0, 0],    //lambda1
                    [0, -1, 0, 1, 0, 0]     //lambda2
                ];
                break;
            }
            case Constraint.constraintMap.distance: {
                /*  deltaX: [0] - dx1,          constraint.elements:    [0] - point1,       params.distance
                            [1] - dy1,                                  [1] - point2        params.angle
                            [2] - dx2, 
                            [3] - dy2, 
                            [4] - lambda
                */
                j = [[1 + 2 * deltaX[4], 0, -2 * deltaX[4], 0,
                    2 * (constraint.elements[0].point.x + deltaX[0] - constraint.elements[1].point.x + deltaX[2])],    //dx1
                    [0, 1 + 2 * deltaX[4], 0, -2 * deltaX[4],
                        2 * (constraint.elements[0].point.y + deltaX[1] - constraint.elements[1].point.y + deltaX[3])],    //dy1
                    [-2 * deltaX[4], 0, 1 + 2 * deltaX[4], 0,
                        2 * (constraint.elements[1].point.x + deltaX[2] - constraint.elements[0].point.x + deltaX[0])],    //dx2
                    [0, -2 * deltaX[4], 0, 1 + 2 * deltaX[4],
                        2 * (constraint.elements[1].point.y + deltaX[3] - constraint.elements[0].point.y + deltaX[1])],    //dy2
                    [2 * (constraint.elements[0].point.x + deltaX[0] - constraint.elements[1].point.x + deltaX[2]),
                        2 * (constraint.elements[0].point.y + deltaX[1] - constraint.elements[1].point.y + deltaX[3]),
                        2 * (constraint.elements[1].point.x + deltaX[2] - constraint.elements[0].point.x + deltaX[0]),
                        2 * (constraint.elements[1].point.y + deltaX[3] - constraint.elements[0].point.y + deltaX[1]), 0]  //lambda
                ];
                break;
            }
            case Constraint.constraintMap.parallelism: {
                /*  deltaX: [0] - dx1           constraint.elements:    [0] - line1 (x1, x2, y1, y2)
                            [1] - dy1                                   [1] - line2 (x3, x4, y3, y4) 
                            [2] - dx2
                            [3] - dy2
                            [4] - dx3
                            [5] - dy3
                            [6] - dx4
                            [7] - dy4
                            [8] - lambda 
                */
                j = [[1, 0, 0, 0, 0, deltaX[8], 0, -deltaX[8],
                    constraint.elements[1].beginPoint.point.y + deltaX[5] - constraint.elements[1].endPoint.point.y - deltaX[7]],  //dx1
                    [0, 1, 0, 0, -deltaX[8], 0, deltaX[8], 0,
                        constraint.elements[1].endPoint.point.x + deltaX[6] - constraint.elements[1].beginPoint.point.x - deltaX[4]],  //dy1
                    [0, 0, 1, 0, 0, -deltaX[8], 0, deltaX[8],
                        constraint.elements[1].endPoint.point.y + deltaX[7] - constraint.elements[1].beginPoint.point.y - deltaX[5]],  //dx2
                    [0, 0, 0, 1, deltaX[8], 0, -deltaX[8], 0,
                        constraint.elements[1].beginPoint.point.x + deltaX[4] - constraint.elements[1].endPoint.point.x - deltaX[6]],  //dy2
                    [0, -deltaX[8], 0, deltaX[8], 1, 0, 0, 0,
                        constraint.elements[0].endPoint.point.y + deltaX[3] - constraint.elements[0].beginPoint.point.y - deltaX[1]],  //dx3
                    [deltaX[8], 0, -deltaX[8], 0, 0, 1, 0, 0,
                        constraint.elements[0].beginPoint.point.x + deltaX[0] - constraint.elements[0].endPoint.point.x - deltaX[2]],  //dy3
                    [0, deltaX[8], 0, -deltaX[8], 0, 0, 1, 0,
                        constraint.elements[0].beginPoint.point.y + deltaX[1] - constraint.elements[0].endPoint.point.y - deltaX[3]],  //dx4
                    [-deltaX[8], 0, deltaX[8], 0, 0, 0, 0, 1,
                        constraint.elements[0].endPoint.point.x + deltaX[2] - constraint.elements[0].beginPoint.point.x - deltaX[0]],  //dy4
                    [constraint.elements[1].beginPoint.point.y + deltaX[5] - constraint.elements[1].endPoint.point.y - deltaX[7],
                        constraint.elements[1].endPoint.point.x + deltaX[6] - constraint.elements[1].beginPoint.point.x - deltaX[4],
                        constraint.elements[1].endPoint.point.y + deltaX[7] - constraint.elements[1].beginPoint.point.y - deltaX[5],
                        constraint.elements[1].beginPoint.point.x + deltaX[4] - constraint.elements[1].endPoint.point.x - deltaX[6],
                        constraint.elements[0].endPoint.point.y + deltaX[3] - constraint.elements[0].beginPoint.point.y - deltaX[1],
                        constraint.elements[0].beginPoint.point.x + deltaX[0] - constraint.elements[0].endPoint.point.x - deltaX[2],
                        constraint.elements[0].beginPoint.point.y + deltaX[1] - constraint.elements[0].endPoint.point.y - deltaX[3],
                        constraint.elements[0].endPoint.point.x + deltaX[2] - constraint.elements[0].beginPoint.point.x - deltaX[0], 0]   //lambda
                ];
                break;
            }
            case Constraint.constraintMap.perpendicularity: {
                /*  deltaX: [0] - dx1           constraint.elements:    [0] - line1 (x1, x2, y1, y2)
                            [1] - dy1                                   [1] - line2 (x3, x4, y3, y4) 
                            [2] - dx2
                            [3] - dy2
                            [4] - dx3
                            [5] - dy3
                            [6] - dx4
                            [7] - dy4
                            [8] - lambda 
                */
                j = [[1, 0, 0, 0, deltaX[8], 0, -deltaX[8], 0,
                        constraint.elements[1].beginPoint.point.x + deltaX[4] - constraint.elements[1].endPoint.point.x - deltaX[6]],  //dx1
                    [0, 1, 0, 0, 0, deltaX[8], 0, -deltaX[8],
                        constraint.elements[1].beginPoint.point.y + deltaX[5] - constraint.elements[1].endPoint.point.y - deltaX[7]],  //dy1
                    [0, 0, 1, 0, -deltaX[8], 0, deltaX[8], 0,
                        constraint.elements[1].endPoint.point.x + deltaX[6] - constraint.elements[1].beginPoint.point.x - deltaX[4]],  //dx2
                    [0, 0, 0, 1, 0, -deltaX[8], 0, deltaX[8],
                        constraint.elements[1].endPoint.point.y + deltaX[7] - constraint.elements[1].beginPoint.point.y - deltaX[5]],  //dy2
                    [deltaX[8], 0, -deltaX[8], 0, 1, 0, 0, 0,
                        constraint.elements[0].beginPoint.point.x + deltaX[0] - constraint.elements[0].endPoint.point.x - deltaX[2]],  //dx3
                    [0, deltaX[8], 0, -deltaX[8], 0, 1, 0, 0,
                        constraint.elements[0].beginPoint.point.y + deltaX[1] - constraint.elements[0].endPoint.point.y - deltaX[3]],  //dy3
                    [-deltaX[8], 0, deltaX[8], 0, 0, 0, 1, 0,
                        constraint.elements[0].endPoint.point.x + deltaX[2] - constraint.elements[0].beginPoint.point.x - deltaX[0]],  //dx4
                    [0, -deltaX[8], 0, deltaX[8], 0, 0, 0, 1,
                        constraint.elements[0].endPoint.point.y + deltaX[3] - constraint.elements[0].beginPoint.point.y - deltaX[1]],  //dy4
                    [constraint.elements[1].beginPoint.point.x + deltaX[4] - constraint.elements[1].endPoint.point.x - deltaX[6],
                        constraint.elements[1].beginPoint.point.y + deltaX[5] - constraint.elements[1].endPoint.point.y - deltaX[7],
                        constraint.elements[1].endPoint.point.x + deltaX[6] - constraint.elements[1].beginPoint.point.x - deltaX[4],
                        constraint.elements[1].endPoint.point.y + deltaX[7] - constraint.elements[1].beginPoint.point.y - deltaX[5],
                        constraint.elements[0].beginPoint.point.x + deltaX[0] - constraint.elements[0].endPoint.point.x - deltaX[2],
                        constraint.elements[0].beginPoint.point.y + deltaX[1] - constraint.elements[0].endPoint.point.y - deltaX[3],
                        constraint.elements[0].endPoint.point.x + deltaX[2] - constraint.elements[0].beginPoint.point.x - deltaX[0],
                        constraint.elements[0].endPoint.point.y + deltaX[3] - constraint.elements[0].beginPoint.point.y - deltaX[1], 0]   //lambda
                ];
                break;
            }
            case Constraint.constraintMap.verticality: {
                /*  deltaX: [0] - dx1           constraint.elements:    [0] - line1 (x1, x2, y1, y2)
                            [1] - dy1 
                            [2] - dx2 
                            [3] - dy2, 
                            [4] - lambda, 
                */
                j = [[1, 0, 0, 0, -1],   //dx1
                    [0, 1, 0, 0, 0],    //dy1
                    [0, 0, 1, 0, 1],    //dx2
                    [0, 0, 0, 1, 0],    //dy2
                    [-1, 0, 1, 0, 0]    //lambda
                ];
                break;
            }
            case Constraint.constraintMap.horizontality: {
                /*  deltaX: [0] - dx1           constraint.elements:    [0] - line1 (x1, x2, y1, y2)
                            [1] - dy1
                            [2] - dx2 
                            [3] - dy2, 
                            [4] - lambda, 
                */
                j = [[1, 0, 0, 0, 0],    //dx1
                    [0, 1, 0, 0, -1],    //dy1
                    [0, 0, 1, 0, 0],     //dx2
                    [0, 0, 0, 1, 1],     //dy2
                    [0, -1, 0, 1, 0]     //lambda
                ];
                break;
            }
            case Constraint.constraintMap.angle: {
                /*  deltaX: [0] - dx1,           constraint.elements:    [0] - line1 (x1, x2, y1, y2)       params.distance
                            [1] - dy1,                                   [1] - line2 (x3, x4, y3, y4)       params.angle
                            [2] - dx2,
                            [3] - dy2,
                            [4] - dx3,
                            [5] - dy3,
                            [6] - dx4,
                            [7] - dy4, 
                            [8] - lambda,
                */
                const a = constraint.elements[0].endPoint.point.x + deltaX[2] - constraint.elements[0].beginPoint.point.x - deltaX[0];
                const b = constraint.elements[1].endPoint.point.x + deltaX[6] - constraint.elements[1].beginPoint.point.x - deltaX[4];
                const c = constraint.elements[0].endPoint.point.y + deltaX[3] - constraint.elements[0].beginPoint.point.y - deltaX[1];
                const d = constraint.elements[1].endPoint.point.y + deltaX[7] - constraint.elements[1].beginPoint.point.y - deltaX[5];
                j = [[1 + 2 * deltaX[8] * (b - (b ** 2 + d ** 2) * (cos(params.angle) ** 2)),
                        2 * deltaX[8] * b * d,
                        2 * deltaX[8] * ((b ** 2 + d ** 2) * cos(params.angle) ** 2 - b),
                        -2 * deltaX[8] * b * d,
                        2 * deltaX[8] * (2 * a * b + c * d - 2 * a * b * cos(params.angle) ** 2),
                        2 * deltaX[8] * (b * c - 2 * a * d * cos(params.angle) ** 2),
                        2 * deltaX[8] * (2 * a * b * cos(params.angle) ** 2 - 2 * a * b - c * d),
                        2 * deltaX[8] * (2 * a * d * cos(params.angle) ** 2 - b * c),
                        2 * (a * (b ** 2 + d ** 2) * cos(params.angle) ** 2 - b * (a * b + c * d))],    //dx1
                    [2 * deltaX[8] * b * d,
                        2 * deltaX[8] * (d ** 2 - (b ** 2 + d ** 2) * cos(params.angle) ** 2),
                        -2 * deltaX[8] * b * d,
                        2 * deltaX[8] * ((b ** 2 + d ** 2) * cos(params.angle) ** 2 - d ** 2),
                        2 * deltaX[8] * (a * d - 2 * b * c * cos(params.angle) ** 2),
                        2 * deltaX[8] * (2 * c * d + a * b - 2 * c * d * cos(params.angle) ** 2),
                        2 * deltaX[8] * (2 * b * c * cos(params.angle) ** 2 - a * d),
                        2 * deltaX[8] * (2 * c * d * cos(params.angle) ** 2 - 2 * c * d - a * b),
                        2 * (c * (b ** 2 + d ** 2) * cos(params.angle) ** 2 - d * (a * b + c * d))],    //dy1
                    [2 * deltaX[8] * ((b ** 2 + d ** 2) * cos(params.angle) ** 2 - b ** 2),
                        -2 * deltaX[8] * b * d,
                        1 + 2 * deltaX[8] * (b ** 2 - (b ** 2 + d ** 2) * cos(params.angle) ** 2),
                        2 * deltaX[8] * b * d,
                        2 * deltaX[8] * (2 * a * b * cos(params.angle) ** 2 - 2 * a * b - c * d),
                        2 * deltaX[8] * (2 * a * d * cos(params.angle) ** 2 - b * c),
                        2 * deltaX[8] * (2 * a * b + c * d - 2 * a * b * cos(params.angle) ** 2),
                        2 * deltaX[8] * (b * c - 2 * a * d * cos(params.angle) ** 2),
                        2 * (b * (a * b + c * d) - a * (b ** 2 + d ** 2) * cos(params.angle) ** 2)],    //dx2
                    [-2 * deltaX[8] * b * d,
                        2 * deltaX[8] * ((b ** 2 + d ** 2) * cos(params.angle) ** 2 - d ** 2),
                        2 * deltaX[8] * b * d,
                        2 * deltaX[8] * (d ** 2 - (b ** 2 + d ** 2) * cos(params.angle) ** 2),
                        2 * deltaX[8] * (2 * c * b * cos(params.angle) ** 2 - a * d),
                        2 * deltaX[8] * (2 * c * d * cos(params.angle) ** 2 - a * b - 2 * c * d),
                        2 * deltaX[8] * (a * d - 2 * c * d * cos(params.angle) ** 2),
                        2 * deltaX[8] * (a * b + 2 * c * d - 2 * c * d * cos(params.angle) ** 2),
                        2 * (d * (a * b + c * d) - c * (b ** 2 + d ** 2) * cos(params.angle) ** 2)],    //dy2
                    [2 * deltaX[8] * (2 * a * b + c * d - 2 * a * b * cos(params.angle) ** 2),
                        2 * deltaX[8] * (a * d - 2 * b * c * cos(params.angle) ** 2),
                        2 * deltaX[8] * (2 * a * b * cos(params.angle) ** 2 - 2 * a * b - c * d),
                        2 * deltaX[8] * (2 * b * c * cos(params.angle) ** 2 - a * d),
                        1 + 2 * deltaX[8] * (a ** 2 - (a ** 2 + c ** 2) * cos(params.angle) ** 2),
                        2 * deltaX[8] * a * c,
                        2 * deltaX[8] * ((a ** 2 + c ** 2) * cos(params.angle) ** 2 - a ** 2),
                        -2 * deltaX[8] * a * c,
                        2 * (b * (a ** 2 + c ** 2) * cos(params.angle) ** 2 - a * (a * b + c * d))],   //dx3
                    [2 * deltaX[8] * (b * c - 2 * a * d * cos(params.angle) ** 2),
                        2 * deltaX[8] * (a * b + 2 * c * d - 2 * c * d * cos(params.angle) ** 2),
                        2 * deltaX[8] * (2 * a * d * cos(params.angle) ** 2 - b * c),
                        2 * deltaX[8] * (2 * c * d * cos(params.angle) ** 2 - a * b - 2 * c * d),
                        2 * deltaX[8] * a * c,
                        2 * deltaX[8] * (c ** 2 - (a ** 2 + c ** 2) * cos(params.angle) ** 2),
                        -2 * deltaX[8] * a * c,
                        2 * deltaX[8] * ((a ** 2 + c ** 2) * cos(params.angle) ** 2 - c ** 2),
                        2 * (d * (a ** 2 + c ** 2) * cos(params.angle) ** 2 - c * (a * b + c * d))],    //dy3
                    [2 * deltaX[8] * (2 * a * b * cos(params.angle) - 2 * a * b - c * d),
                        2 * deltaX[8] * (2 * b * c * cos(params.angle) ** 2 - a * d),
                        2 * deltaX[8] * (2 * a * b + c * d - 2 * a * b * cos(params.angle) ** 2),
                        2 * deltaX[8] * (a * d - 2 * b * c * cos(params.angle) ** 2),
                        2 * deltaX[8] * ((a ** 2 + c ** 2) * cos(params.angle) ** 2 - a ** 2),
                        -2 * deltaX[8] * a * c,
                        2 * deltaX[8] * (a ** 2 - (a ** 2 + c ** 2) * cos(params.angle) ** 2),
                        2 * deltaX[8] * a * c,
                        2 * (a * (a * b + c * d) - b * (a ** 2 + c ** 2) * cos(params.angle) ** 2)],    //dx4
                    [2 * deltaX[8] * (2 * a * d * cos(params.angle) ** 2 - c * b),
                        2 * deltaX[8] * (2 * c * d * cos(params.angle) ** 2 - 2 * c * d - a * b),
                        2 * deltaX[8] * (c * b - 2 * a * d * cos(params.angle) ** 2),
                        2 * deltaX[8] * (2 * c * d + a * b - 2 * c * d * cos(params.angle) ** 2),
                        -2 * deltaX[8] * a * c,
                        2 * deltaX[8] * ((a ** 2 + c ** 2) * cos(params.angle) ** 2 - c ** 2),
                        2 * deltaX[8] * a * c,
                        2 * deltaX[8] * (c ** 2 - (a ** 2 + c ** 2) * cos(params.angle) ** 2),
                        2 * (c * (a * b + c * d) - d * (a ** 2 + c ** 2) * cos(params.angle) ** 2)],    //dy4
                    [2 * deltaX[8] * (2 * a * (b ** 2 + d ** 2) * cos(params.angle) ** 2 - b),
                        2 * deltaX[8] * (2 * c * (b ** 2 + d ** 2) * cos(params.angle) ** 2 - d),
                        2 * deltaX[8] * (b - 2 * a * (b ** 2 + d ** 2) * cos(params.angle) ** 2),
                        2 * deltaX[8] * (d - 2 * c * (b ** 2 + d ** 2) * cos(params.angle) ** 2),
                        2 * deltaX[8] * (2 * b * (a ** 2 + c ** 2) * cos(params.angle) ** 2 - a),
                        2 * deltaX[8] * (2 * d * (a ** 2 + c ** 2) * cos(params.angle) ** 2 - c),
                        2 * deltaX[8] * (a - 2 * b * (a ** 2 + c ** 2) * cos(params.angle) ** 2),
                        2 * deltaX[8] * (c - 2 * d * (a ** 2 + c ** 2) * cos(params.angle) ** 2), 0]    //lambda
                ];
                break;
            }
            case Constraint.constraintMap.pointToLine: {
                /*  deltaX: [0] - dx2           constraint.elements:    [0] - point (x2, y2)
                            [1] - dy2                                   [1] - line (x1, y1, x3, y3)
                            [2] - dx1 
                            [3] - dy1, 
                            [4] - dx3,
                            [5] - dy3,
                            [6] - lambda 
                */
                j = [[1, 0, 0, deltaX[6], 0, -deltaX[6],
                    constraint.elements[0].point.y + deltaX[1] - constraint.elements[1].endPoint.point.y - deltaX[5]],      //dx1
                    [0, 1, deltaX[6], 0, -deltaX[6], 0,
                        constraint.elements[0].point.x + deltaX[0] - constraint.elements[1].endPoint.point.x - deltaX[4]],  //dy1
                    [0, deltaX[6], 1, -2*deltaX[6], 0, deltaX[6],
                        constraint.elements[1].endPoint.point.y + deltaX[5] + constraint.elements[1].beginPoint.point.y + deltaX[3] - 2*constraint.elements[0].point.y - 2*deltaX[1]],               //dx2
                    [deltaX[6], 0, -2*deltaX[6], 1, deltaX[6], 0,
                        constraint.elements[1].endPoint.point.x + deltaX[4] + constraint.elements[1].beginPoint.point.x + deltaX[2] - 2*constraint.elements[0].point.x - 2*deltaX[0]],      //dy2
                    [0, -deltaX[6], 0, deltaX[6], 1, 0,
                        constraint.elements[0].point.y + deltaX[1] - constraint.elements[1].beginPoint.point.y - deltaX[3]],    //dx3
                    [-deltaX[6], 0, deltaX[6], 0, 0, 1,
                        constraint.elements[0].point.x + deltaX[0] - constraint.elements[1].beginPoint.point.x - deltaX[2]],    //dy3
                    [constraint.elements[0].point.y + deltaX[1] - constraint.elements[1].endPoint.point.y - deltaX[5],
                        constraint.elements[0].point.x + deltaX[0] - constraint.elements[1].endPoint.point.x - deltaX[4],
                        constraint.elements[1].endPoint.point.y + deltaX[5] + constraint.elements[1].beginPoint.point.y + deltaX[3] - 2*constraint.elements[0].point.y - 2*deltaX[1],
                        constraint.elements[1].endPoint.point.x + deltaX[4] + constraint.elements[1].beginPoint.point.x + deltaX[2] - 2*constraint.elements[0].point.x - 2*deltaX[0],
                        constraint.elements[0].point.y + deltaX[1] - constraint.elements[1].beginPoint.point.y - deltaX[3],
                        constraint.elements[0].point.x + deltaX[0] - constraint.elements[1].beginPoint.point.x - deltaX[2], 0]    //lambda
                ];
                break;
            }
            case Constraint.constraintMap.fixation: {
                /*  deltaX: [0] - dx1,          constraint.elements:    [0] - point1
                            [1] - dy1, 
                            [2] - lambda1,
                            [3] - lambda2,
                */
                j = [[1, 0, 1, 0],    //dx1
                    [0, 1, 0, 1],    //dy1
                    [1, 0, 0, 0],    //lambda1
                    [0, 1, 0, 0],    //lambda2
                ];
                break;
            }
            default: {
                console.error("Unknown type of constraint: ", constraint.type);
                console.trace();
            }
        }
        return j;
    }

    getF(constraint, deltaX, params) {
        let f = [];

        switch (constraint.type) {
            case Constraint.constraintMap.joint: {
                /*  deltaX: [0] - dx1,          constraint.elements:    [0] - point1,
                            [1] - dy1,                                  [1] - point2
                            [2] - dx2, 
                            [3] - dy2, 
                            [4] - lambda1
                            [5] - lambda2
                */
                f = [deltaX[0] - deltaX[4],   //  dF/dx1
                    deltaX[1] - deltaX[5],  //  dF/dy1
                    deltaX[2] + deltaX[4],  //  dF/dx2
                    deltaX[3] + deltaX[5],  //  dF/dy2
                    constraint.elements[1].point.x + deltaX[2] - constraint.elements[0].point.x - deltaX[0],    //  dF/dlambda1
                    constraint.elements[1].point.y + deltaX[3] - constraint.elements[0].point.y - deltaX[1]];   //  dF/dlambda2
                break;
            }
            case Constraint.constraintMap.distance: {
                /*  deltaX: [0] - dx1,          constraint.elements:    [0] - point1,       params.distance
                            [1] - dy1,                                  [1] - point2        params.angle
                            [2] - dx2, 
                            [3] - dy2,
                            [4] - lambda1
                */
                f = [deltaX[0] + 2 * deltaX[4] * (constraint.elements[0].point.x + deltaX[0] - constraint.elements[1].point.x - deltaX[2]),   //  dF/dx1
                    deltaX[1] + 2 * deltaX[4] * (constraint.elements[0].point.y + deltaX[1] - constraint.elements[1].point.y - deltaX[3]),    //  dF/dy1
                    deltaX[2] + 2 * deltaX[4] * (constraint.elements[1].point.x + deltaX[2] - constraint.elements[0].point.x - deltaX[0]),    //  dF/dx2
                    deltaX[3] + 2 * deltaX[4] * (constraint.elements[1].point.y + deltaX[3] - constraint.elements[0].point.y - deltaX[1]),    //  dF/dy2
                    (constraint.elements[1].point.x + deltaX[2] - constraint.elements[0].point.x - deltaX[0]) ** 2 +
                    (constraint.elements[1].point.y + deltaX[3] - constraint.elements[0].point.y - deltaX[1]) ** 2 - params.distance**2 ];    //  dF/dlambda
                break;
            }
            case Constraint.constraintMap.parallelism: {
               /*  deltaX:  [0] - dx1           constraint.elements:    [0] - line1 (x1, x2, y1, y2)
                            [1] - dy1                                   [1] - line2 (x3, x4, y3, y4) 
                            [2] - dx2
                            [3] - dy2
                            [4] - dx3
                            [5] - dy3
                            [6] - dx4
                            [7] - dy4
                            [8] - lambda 
                */
                f = [deltaX[0] + deltaX[8] * (constraint.elements[1].beginPoint.point.y + deltaX[5] - constraint.elements[1].endPoint.point.y - deltaX[7]),  //  dF/dx1
                    deltaX[1] + deltaX[8] * (constraint.elements[1].endPoint.point.x + deltaX[6] - constraint.elements[1].beginPoint.point.x - deltaX[5]),  //  dF/dy1
                    deltaX[2] + deltaX[8] * (constraint.elements[1].endPoint.point.y + deltaX[7] - constraint.elements[1].beginPoint.point.y - deltaX[5]),  //  dF/dx2
                    deltaX[3] + deltaX[8] * (constraint.elements[1].beginPoint.point.x + deltaX[4] - constraint.elements[1].endPoint.point.x - deltaX[6]),  //  dF/dy2
                    deltaX[4] + deltaX[8] * (constraint.elements[0].endPoint.point.y + deltaX[3] - constraint.elements[0].beginPoint.point.y - deltaX[1]),  //  dF/dx3
                    deltaX[5] + deltaX[8] * (constraint.elements[0].beginPoint.point.x + deltaX[0] - constraint.elements[0].endPoint.point.x - deltaX[2]),  //  dF/dy3
                    deltaX[6] + deltaX[8] * (constraint.elements[0].beginPoint.point.y + deltaX[1] - constraint.elements[0].endPoint.point.y - deltaX[3]),  //  dF/dx4
                    deltaX[7] + deltaX[8] * (constraint.elements[0].endPoint.point.x + deltaX[2] - constraint.elements[0].beginPoint.point.x - deltaX[0]),  //  dF/dy4
                    (constraint.elements[0].endPoint.point.x + deltaX[2] - constraint.elements[0].beginPoint.point.x - deltaX[0]) *
                    (constraint.elements[1].endPoint.point.y + deltaX[7] - constraint.elements[1].beginPoint.point.y - deltaX[5]) -
                    (constraint.elements[1].endPoint.point.x + deltaX[6] - constraint.elements[1].beginPoint.point.x - deltaX[5]) *
                    (constraint.elements[0].endPoint.point.y + deltaX[3] - constraint.elements[0].beginPoint.point.y - deltaX[1])];        //  dF/dlambda
                break;
            }
            case Constraint.constraintMap.perpendicularity: {
                /*  deltaX: [0] - dx1           constraint.elements:    [0] - line1 (x1, x2, y1, y2)
                            [1] - dy1                                   [1] - line2 (x3, x4, y3, y4) 
                            [2] - dx2
                            [3] - dy2
                            [4] - dx3
                            [5] - dy3
                            [6] - dx4
                            [7] - dy4
                            [8] - lambda 
                */
                f = [deltaX[0] + deltaX[8] * (constraint.elements[1].beginPoint.point.x + deltaX[4] - constraint.elements[1].endPoint.point.x - deltaX[6]),  //  dF/dx1
                    deltaX[1] + deltaX[8] * (constraint.elements[1].beginPoint.point.y + deltaX[5] - constraint.elements[1].endPoint.point.y - deltaX[7]),  //  dF/dy1
                    deltaX[2] + deltaX[8] * (constraint.elements[1].endPoint.point.x + deltaX[6] - constraint.elements[1].beginPoint.point.x - deltaX[4]),  //  dF/dx2
                    deltaX[3] + deltaX[8] * (constraint.elements[1].endPoint.point.y + deltaX[7] - constraint.elements[1].beginPoint.point.y - deltaX[5]),  //  dF/dy2
                    deltaX[4] + deltaX[8] * (constraint.elements[0].beginPoint.point.x + deltaX[0] - constraint.elements[0].endPoint.point.x - deltaX[2]),  //  dF/dx3
                    deltaX[5] + deltaX[8] * (constraint.elements[0].beginPoint.point.y + deltaX[1] - constraint.elements[0].endPoint.point.y - deltaX[3]),  //  dF/dy3
                    deltaX[6] + deltaX[8] * (constraint.elements[0].endPoint.point.x + deltaX[2] - constraint.elements[0].beginPoint.point.x - deltaX[0]),  //  dF/dx4
                    deltaX[7] + deltaX[8] * (constraint.elements[0].endPoint.point.y + deltaX[3] - constraint.elements[0].beginPoint.point.y - deltaX[1]),  //  dF/dy4
                    (constraint.elements[0].endPoint.point.x + deltaX[2] - constraint.elements[0].beginPoint.point.x - deltaX[0]) *
                    (constraint.elements[1].endPoint.point.x + deltaX[6] - constraint.elements[1].beginPoint.point.x - deltaX[4]) +
                    (constraint.elements[0].endPoint.point.y + deltaX[3] - constraint.elements[0].beginPoint.point.y - deltaX[1]) *
                    (constraint.elements[1].endPoint.point.y + deltaX[7] - constraint.elements[1].beginPoint.point.y - deltaX[5]) ];        //  dF/dlambda
                break;
            }
            case Constraint.constraintMap.verticality: {
                /*  deltaX: [0] - dx1           constraint.elements:    [0] - line1 (x1, x2, y1, y2)
                            [1] - dy1 
                            [2] - dx2 
                            [3] - dy2, 
                            [4] - lambda, 
                */
                f = [deltaX[0] - deltaX[4], //  dF/dx1
                    deltaX[1],              //  dF/dy1
                    deltaX[2] + deltaX[4],              //  dF/dx2
                    deltaX[3],              //  dF/dy2
                    constraint.elements[0].endPoint.point.x + deltaX[2] - constraint.elements[0].beginPoint.point.x - deltaX[0]];  //  dF/dlambda
                break;
            }
            case Constraint.constraintMap.horizontality: {
                /*  deltaX: [0] - dx1           constraint.elements:    [0] - line1 (x1, x2, y1, y2)
                            [1] - dy1
                            [2] - dx2 
                            [3] - dy2, 
                            [4] - lambda, 
                */
                f = [deltaX[0],             //  dF/dx1
                    deltaX[1] - deltaX[4],  //  dF/dy1
                    deltaX[2],              //  dF/dx2
                    deltaX[3] + deltaX[4],  //  dF/dy2
                    constraint.elements[0].endPoint.point.y + deltaX[3] - constraint.elements[0].beginPoint.point.y - deltaX[1]];  //  dF/dlambda
                break;
            }
            case Constraint.constraintMap.angle: {
                /*  deltaX: [0] - dx1,           constraint.elements:    [0] - line1 (x1, x2, y1, y2)       params.distance
                            [1] - dy1,                                   [1] - line2 (x3, x4, y3, y4)       params.angle
                            [2] - dx2,
                            [3] - dy2,
                            [4] - dx3,
                            [5] - dy3,
                            [6] - dx4,
                            [7] - dy4, 
                            [8] - lambda,
                */
                const a = constraint.elements[0].endPoint.point.x + deltaX[2] - constraint.elements[0].beginPoint.point.x - deltaX[0];
                const b = constraint.elements[1].endPoint.point.x + deltaX[6] - constraint.elements[1].beginPoint.point.x - deltaX[4];
                const c = constraint.elements[0].endPoint.point.y + deltaX[3] - constraint.elements[0].beginPoint.point.y - deltaX[1];
                const d = constraint.elements[1].endPoint.point.y + deltaX[7] - constraint.elements[1].beginPoint.point.y - deltaX[5];
                f = [deltaX[0] + 2*deltaX[8] * (a * (b**2 + d**2) * cos(params.angle)**2 - b * (a*b + c*d)),    //  dF/dx1
                    deltaX[1] + 2*deltaX[8] * (c * (b**2 + d**2) * cos(params.angle)**2 - d * (a*b + c*d)),     //  dF/dy1
                    deltaX[2] + 2*deltaX[8] * (b * (a*b + c*d) - a * (b**2 + d**2) * cos(params.angle)**2),     //  dF/dx2
                    deltaX[3] + 2*deltaX[8] * (d * (a*b + c*d) - c * (b**2 + d**2) * cos(params.angle)**2),     //  dF/dy2
                    deltaX[4] + 2*deltaX[8] * (b * (a**2 + c**2) * cos(params.angle)**2 - a * (a*b + c*d)),     //  dF/dx3
                    deltaX[5] + 2*deltaX[8] * (d * (a**2 + c**2) * cos(params.angle)**2 - c * (a*b + c*d)),     //  dF/dy3
                    deltaX[6] + 2*deltaX[8] * (a * (a*b + c*d) - b * (a**2 + c**2) * cos(params.angle)**2),     //  dF/dx4
                    deltaX[7] + 2*deltaX[8] * (c * (a*b + c*d) - d * (a**2 + c**2) * cos(params.angle)**2),     //  dF/dy4
                    ((a*b + c*d) - (a**2 + c**2) * (b**2 + d**2) * cos(params.angle)**2) ];   //  dF/dlambda
                break;
            }
            case Constraint.constraintMap.pointToLine: {
                /*  deltaX: [0] - dx2           constraint.elements:    [0] - point (x2, y2)
                            [1] - dy2                                   [1] - line (x1, y1, x3, y3)
                            [2] - dx1 
                            [3] - dy1, 
                            [4] - dx3,
                            [5] - dy3,
                            [6] - lambda 
                */
                f = [deltaX[2] + deltaX[6] * (constraint.elements[0].point.y + deltaX[1] - constraint.elements[1].endPoint.point.y - deltaX[5]),            //  dF/dx1
                    deltaX[3] + deltaX[6] * (constraint.elements[0].point.x + deltaX[0] - constraint.elements[1].endPoint.point.x - deltaX[4]),             //  dF/dy1
                    deltaX[0] + deltaX[6] * (constraint.elements[1].endPoint.point.y + deltaX[5] +
                                            constraint.elements[1].beginPoint.point.y + deltaX[3] -
                                            2*constraint.elements[0].point.y - 2*deltaX[1]),  //  dF/dx2
                    deltaX[1] + deltaX[6] * (constraint.elements[1].endPoint.point.x + deltaX[4] +
                                            constraint.elements[1].beginPoint.point.x + deltaX[2] -
                                            2*constraint.elements[0].point.x - 2*deltaX[0]),  //  dF/dy2
                    deltaX[4] + deltaX[6] * (constraint.elements[0].point.y + deltaX[1] - constraint.elements[1].beginPoint.point.y - deltaX[3]),           //  dF/dx3
                    deltaX[5] + deltaX[6] * (constraint.elements[0].point.x + deltaX[0] - constraint.elements[1].beginPoint.point.x - deltaX[2]),           //  dF/dy3
                    (constraint.elements[0].point.x + deltaX[0] - constraint.elements[1].beginPoint.point.x - deltaX[2]) *
                    (constraint.elements[1].endPoint.point.y + deltaX[5] - constraint.elements[0].point.y - deltaX[1]) +
                    (constraint.elements[0].point.x + deltaX[0] - constraint.elements[1].endPoint.point.x - deltaX[4]) *
                    (constraint.elements[1].beginPoint.point.y + deltaX[3] - constraint.elements[0].point.y - deltaX[1]) ];                                  //  dF/dlambda
                break;
            }
            case Constraint.constraintMap.fixation: {
                /*  deltaX: [0] - dx1,          constraint.elements:    [0] - point1
                            [1] - dy1, 
                            [2] - lambda1,
                            [3] - lambda2,
                */
                f = [deltaX[0] + deltaX[2],                      //  dF/dx1
                    deltaX[1] + deltaX[3],                       //  dF/dy1
                    deltaX[0],  //  dF/dlambda1
                    deltaX[1]]; //  dF/dlambda2
                break;
            }
            default: {
                console.error("Unknown type of constraint: ", constraint.type);
                console.trace();
            }
        }
        return f;
    }
}

const jacobiansMap = new JacobiansMap();

export default jacobiansMap;