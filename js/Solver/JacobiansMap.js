import Constraint from "./Constraint";
import matrices, { cos } from "mathjs";

class JacobiansMap {
    constructor() {
    }

    getJacobian(constraint, params) {
        switch(constraint.type) {
            case Constraint.constraintMap.joint: {
                const j = math.matrix([ [1, 0, 0, 0, -1, 0],    //dx1
                                        [0, 1, 0, 0, 1, 0],     //dx2
                                        [0, 0, 1, 0, 0, -1],    //dy1
                                        [0, 0, 0, 1, 0, 1],     //dy2
                                        [-1, 1, 0, 0, 0, 0],    //lambda1
                                        [0, 0, -1, 1, 0, 0]     //lambda2
                                    ]);
                break;
            }
            case Constraint.constraintMap.distance: {
                /*  params: [0] - lambda,       constraint.elements:    [0] - point1,
                            [1] - dx1,                                  [1] - point2
                            [2] - dx2, 
                            [3] -dy1, 
                            [4] - dy2
                */
                const j = math.matrix([ [1 + 2 * params[0], -2 * params[0], 0, 0, 
                                            2 * (constraint.elements[0].x + params[1] - constraint.elements[1].x + params[2])],    //dx1
                                        [-2 * params[0], 1 + 2 * params[0], 0, 0, 
                                            2 * (constraint.elements[1].x + params[2] - constraint.elements[0].x + params[1])],    //dx2
                                        [0, 0, 1 + 2 * params[0], -2 * params[0],
                                            2 * (constraint.elements[0].y + params[3] - constraint.elements[1].y + params[4])],    //dy1
                                        [0, 0, -2 * params[0], 1 + 2 * params[0],
                                             2 * (constraint.elements[1].y + params[4] - constraint.elements[0].y + params[3])],    //dy2
                                        [2 * (constraint.elements[0].x + params[1] - constraint.elements[1].x + params[2]), 
                                            2 * (constraint.elements[1].x + params[2] - constraint.elements[0].x + params[1]),
                                            2 * (constraint.elements[0].y + params[3] - constraint.elements[1].y + params[4]), 
                                            2 * (constraint.elements[1].y + params[4] - constraint.elements[0].y + params[3]), 0]  //lambda
                                    ]);
                break;
            }
            case Constraint.constraintMap.parallelism: {
                /*  params: [0] - lambda,       constraint.elements:    [0] - line1 (x1, x2, y1, y2)
                            [1] - dx1,                                  [1] - line2 (x3, x4, y3, y4)
                            [2] - dx2, 
                            [3] - dx3, 
                            [4] - dx4, 
                            [5] - dy1, 
                            [6] - dy2, 
                            [7] - dy3, 
                            [8] - dy4,
                */
                const j = math.matrix([ [1, 0, 0, 0, 0, 0, params[0], -params[0], 
                                            constraint.elements[1].beginPoint.y + params[7] - constraint.elements[1].endPoint.y - params[8]],  //dx1
                                        [0, 1, 0, 0, 0, 0, -params[0], params[0],
                                            constraint.elements[1].endPoint.y + params[8] - constraint.elements[1].beginPoint.y - params[7]],  //dx2
                                        [0, 0, 1, 0, -params[0], params[0], 0, 0,
                                            constraint.elements[0].endPoint.y + params[6] - constraint.elements[0].beginPoint.y - params[5]],  //dx3
                                        [0, 0, 0, 1, params[0], -params[0], 0, 0,
                                            constraint.elements[0].beginPoint.y + params[5] - constraint.elements[0].endPoint.y - params[6]],  //dx4
                                        [0, 0, -params[0], params[0], 1, 0, 0, 0,
                                            constraint.elements[1].endPoint.x + params[4] - constraint.elements[1].beginPoint.x - params[3]],  //dy1
                                        [0, 0, params[0], -params[0], 0, 1, 0, 0,
                                            constraint.elements[1].beginPoint.x + params[3] - constraint.elements[1].endPoint.x - params[4]],  //dy2
                                        [params[0], -params[0], 0, 0, 0, 0, 1, 0,
                                            constraint.elements[0].beginPoint.x + params[1] - constraint.elements[0].endPoint.x - params[2]],  //dy3
                                        [-params[0], params[0], 0, 0, 0, 0, 0, 1,
                                            constraint.elements[0].endPoint.x + params[2] - constraint.elements[0].beginPoint.x - params[1]],  //dy4
                                        [constraint.elements[1].beginPoint.y + params[7] - constraint.elements[1].endPoint.y - params[8],
                                            constraint.elements[1].endPoint.y + params[8] - constraint.elements[1].beginPoint.y - params[7],
                                            constraint.elements[0].endPoint.y + params[6] - constraint.elements[0].beginPoint.y - params[5],
                                            constraint.elements[0].beginPoint.y + params[5] - constraint.elements[0].endPoint.y - params[6],
                                            constraint.elements[1].endPoint.x + params[4] - constraint.elements[1].beginPoint.x - params[3],
                                            constraint.elements[1].beginPoint.x + params[3] - constraint.elements[1].endPoint.x - params[4],
                                            constraint.elements[0].beginPoint.x + params[1] - constraint.elements[0].endPoint.x - params[2],
                                            constraint.elements[0].endPoint.x + params[2] - constraint.elements[0].beginPoint.x - params[1], 0]   //lambda
                                    ]);
                break;
            }
            case Constraint.constraintMap.perpendicularity: {
                /*  params: [0] - lambda,       constraint.elements:    [0] - line1 (x1, x2, y1, y2)
                            [1] - dx1,                                  [1] - line2 (x3, x4, y3, y4)
                            [2] - dx2, 
                            [3] - dx3, 
                            [4] - dx4, 
                            [5] - dy1, 
                            [6] - dy2, 
                            [7] - dy3, 
                            [8] - dy4,
                */
                const j = math.matrix([ [1, 0, params[0], -params[0], 0, 0, 0, 0, 
                                            constraint.elements[1].beginPoint.x + params[3] - constraint.elements[1].endPoint.x - params[4]],  //dx1
                                        [0, 1, -params[0], params[0], 0, 0, 0, 0,
                                            constraint.elements[1].endPoint.x + params[4] - constraint.elements[1].beginPoint.x - params[3]],  //dx2
                                        [params[0], -params[0], 1, 0, 0, 0, 0, 0,
                                            constraint.elements[0].beginPoint.x + params[1] - constraint.elements[0].endPoint.x - params[2]],  //dx3
                                        [-params[0], params[0], 0, 1, 0, 0, 0, 0,
                                            constraint.elements[0].endPoint.x + params[2] - constraint.elements[0].beginPoint.x - params[1]],  //dx4
                                        [0, 0, 0, 0, 1, 0, params[0], -params[0],
                                            constraint.elements[1].beginPoint.y + params[7] - constraint.elements[1].endPoint.y - params[8]],  //dy1
                                        [0, 0, 0, 0, 0, 1, -params[0], params[0],
                                            constraint.elements[1].endPoint.y + params[8] - constraint.elements[1].beginPoint.y - params[7]],  //dy2
                                        [0, 0, 0, 0, params[0], -params[0], 1, 0,
                                            constraint.elements[0].beginPoint.y + params[5] - constraint.elements[0].endPoint.y - params[6]],  //dy3
                                        [0, 0, 0, 0, -params[0], params[0], 0, 1,
                                            constraint.elements[0].endPoint.y + params[6] - constraint.elements[0].beginPoint.y - params[5]],  //dy4
                                        [constraint.elements[1].beginPoint.x + params[3] - constraint.elements[1].endPoint.x - params[4],
                                            constraint.elements[1].endPoint.x + params[4] - constraint.elements[1].beginPoint.x - params[3],
                                            constraint.elements[0].beginPoint.x + params[1] - constraint.elements[0].endPoint.x - params[2],
                                            constraint.elements[0].endPoint.x + params[2] - constraint.elements[0].beginPoint.x - params[1],
                                            constraint.elements[1].beginPoint.y + params[7] - constraint.elements[1].endPoint.y - params[8],
                                            constraint.elements[1].endPoint.y + params[8] - constraint.elements[1].beginPoint.y - params[7],
                                            constraint.elements[0].beginPoint.y + params[5] - constraint.elements[0].endPoint.y - params[6],
                                            constraint.elements[0].endPoint.y + params[6] - constraint.elements[0].beginPoint.y - params[5], 0]   //lambda
                                    ]);
                break;
            }
            case Constraint.constraintMap.verticality: {
                const j = math.matrix([ [1, 0, 0, 0, -1],   //dx1
                                        [0, 1, 0, 0, 1],    //dx2
                                        [0, 0, 1, 0, 0],    //dy1
                                        [0, 0, 0, 1, 0],    //dy2
                                        [-1, 1, 0, 0, 0]    //lambda
                                    ]);
                break;
            }
            case Constraint.constraintMap.horizontality: {
                const j = math.matrix([ [1, 0, 0, 0, 0],    //dx1
                                        [0, 1, 0, 0, 0],    //dx2
                                        [0, 0, 1, 0, -1],   //dy1
                                        [0, 0, 0, 1, 1],    //dy2
                                        [0, 0, -1, 1, 0]    //lambda
                                    ]);
                break;
            }
            case Constraint.constraintMap.angle: {
                /*  params: [0] - lambda,       constraint.elements:    [0] - line1 (x1, x2, y1, y2)
                            [1] - dx1,                                  [1] - line2 (x3, x4, y3, y4)
                            [2] - dx2, 
                            [3] - dx3, 
                            [4] - dx4, 
                            [5] - dy1, 
                            [6] - dy2, 
                            [7] - dy3, 
                            [8] - dy4,
                            [9] - alpha,
                */
                const a = constraint.elements[0].endPoint.x + params[2] - constraint.elements[0].beginPoint.x - params[1];
                const b = constraint.elements[1].endPoint.x + params[4] - constraint.elements[1].beginPoint.x - params[3];
                const c = constraint.elements[0].endPoint.y + params[6] - constraint.elements[0].beginPoint.y - params[5];
                const d = constraint.elements[1].endPoint.y + params[8] - constraint.elements[1].beginPoint.y - params[7];
                const j = math.matrix([ [1 + 2*params[0] * (b - (b**2 + d**2) * (cos(params[9])**2)), 
                                            2*params[0] * ((b**2 + d**2) * cos(params[9])**2 - b),
                                            2*params[0] * (2*a*b + c*d - 2*a*b * cos(params[9])**2),
                                            2*params[0] * (2*a*b * cos(params[9])**2 - 2*a*b - c*d),
                                            2*params[0] * b*d,
                                            -2*params[0] * b*d,
                                            2*params[0] * (b*c - 2*a*d * cos(params[9])**2),
                                            2*params[0] * (2*a*d * cos(params[9])**2 - b*c),
                                            2 * (a * (b**2 + d**2) * cos(params[9])**2 - b * (a*b + c*d))], //dx1
                                        [2*params[0] * ((b**2 + d**2) * cos(params[9])**2 - b**2),
                                            1 + 2*params[0] * (b**2 - (b**2 + d**2) * cos(params[9])**2),
                                            2*params[0] * (2*a*b * cos(params[9])**2 - 2*a*b - c*d),
                                            2*params[0] * (2*a*b + c*d - 2*a*b * cos(params[9])**2),
                                            -2*params[0] * b*d,
                                            2*params[0] * b*d,
                                            2*params[0] * (2*a*d * cos(params[9])**2 - b*c),
                                            2*params[0] * (b*c - 2*a*d * cos(params[9])**2),
                                            2 * (b * (a*b + c*d) - a * (b**2 + d**2) * cos(params[9])**2)],    //dx2
                                        [2*params[0] * (2*a*b + c*d - 2*a*b * cos(params[9])**2),
                                            2*params[0] * (2*a*b * cos(params[9])**2 - 2*a*b - c*d), 
                                            1 + 2*params[0] * (a**2 - (a**2 + c**2) * cos(params[9])**2), 
                                            2*params[0] * ((a**2 + c**2) * cos(params[9])**2 - a**2), 
                                            2*params[0] * (a*d - 2*b*c * cos(params[9])**2),
                                            2*params[0] * (2*b*c * cos(params[9])**2 - a*d),
                                            2*params[0] * a*c,
                                            -2*params[0] * a*c,
                                            2 * (b * (a**2 + c**2) * cos(params[9])**2 - a * (a*b + c*d))],   //dx3
                                        [2*params[0] * (2*a*b * cos(params[9]) - 2*a*b -c*d),
                                            2*params[0] * (2*a*b + c*d - 2*a*b * cos(params[9])**2), 
                                            2*params[0] * ((a**2 + c**2) * cos(params[9])**2 - a**2), 
                                            2*params[0] * (a**2 - (a**2 + c**2) * cos(params[9])**2), 
                                            2*params[0] * (2*b*c * cos(params[9])**2 - a*d),
                                            2*params[0] * (a*d - 2*b*c * cos(params[9])**2),
                                            -2*params[0] * a*c,
                                            2*params[0] * a*c,
                                            2 * (a * (a*b + c*d) - b * (a**2 + c**2) * cos(params[9])**2)],    //dx4
                                        [2*params[0] * b*d, 
                                            -2*params[0] * b*d, 
                                            2*params[0] * (a*d - 2*b*c * cos(params[9])**2), 
                                            2*params[0] * (2*b*c * cos(params[9])**2 - a*d),
                                            2*params[0] * (d**2 - (b**2 + d**2) * cos(params[9])**2),
                                            2*params[0] * ((b**2 + d**2) * cos(params[9])**2 - d**2),
                                            2*params[0] * (2*c*d + a*b - 2*c*d * cos(params[9])**2),
                                            2*params[0] * (2*c*d * cos(params[9])**2 - 2*c*d - a*b), 
                                            2 * (c * (b**2 + d**2) * cos(params[9])**2 - d * (a*b + c*d))],    //dy1
                                        [-2*params[0] * b*d, 
                                            2*params[0] * b*d, 
                                            2*params[0] * (2*c*b * cos(params[9])**2 - a*d), 
                                            2*params[0] * (a*d - 2*c*d * cos(params[9])**2),
                                            2*params[0] * ((b**2 + d**2) * cos(params[9])**2 - d**2),
                                            2*params[0] * (d**2 - (b**2 + d**2) * cos(param[9])**2),
                                            2*params[0] * (2*c*d * cos(params[9])**2 - a*b - 2*c*d),
                                            2*params[0] * (a*b + 2*c*d - 2*c*d * cos(params[9])**2), 
                                            2 * (d * (a*b + c*d) - c * (b**2 + d**2) * cos(params[9])**2)],    //dy2
                                        [2*params[0] * (b*c - 2*a*d * cos(params[9])**2), 
                                            2*params[0] * (2*a*d * cos(params[9])**2 - b*c), 
                                            2*params[0] * a*c, 
                                            -2*params[0] * a*c,
                                            2*params[0] * (a*b + 2*c*d - 2*c*d * cos(params[9])**2),
                                            2*params[0] * (2*c*d * cos(params[9])**2 - a*b -2*c*d),
                                            2*params[0] * (c**2 - (a**2 + c**2) * cos(params[9])**2),
                                            2*params[0] * ((a**2 + c**2) * cos(params[9])**2 - c**2), 
                                            2 * (d * (a**2 + c**2) * cos(params[9])**2 - c * (a*b + c*d))],    //dy3
                                        [2*params[0] * (2*a*d * cos(params[9])**2 - c*b), 
                                            2*params[0] * (c*b - 2*a*d * cos(params[9])**2), 
                                            -2*params[0] * a*c, 
                                            2*params[0] * a*c,
                                            2*params[0] * (2*c*d * cos(params[9])**2 - 2*c*d - a*b),
                                            2*params[0] * (2*c*d + a*b - 2*c*d * cos(params[9])**2),
                                            2*params[0] * ((a**2 + c**2) * cos(params[9])**2 - c**2),
                                            2*params[0] * (c**2 - (a**2 + c**2) * cos(params[9])**2), 
                                            2 * (c * (a*b + c*d) - d * (a**2 + c**2) * cos(params[9])**2)],    //dy4
                                        [2*params[0] * (2*a * (b**2 + d**2) * cos(params[9])**2 - b), 
                                            2*params[0] * (b - 2*a * (b**2 + d**2) * cos(params[9])**2), 
                                            2*params[0] * (2*b * (a**2 + c**2) * cos(params[9])**2 - a), 
                                            2*params[0] * (a - 2*b * (a**2 + c**2) * cos(params[9])**2),
                                            2*params[0] * (2*c * (b**2 + d**2) * cos(params[9])**2 - d), ,
                                            2*params[0] * (d - 2*c * (b**2 + d**2) * cos(params[9])**2),
                                            2*params[0] * (2*d * (a**2 + c**2) * cos(params[9])**2 - c), ,
                                            2*params[0] * (c - 2*d * (a**2 + c**2) * cos(params[9])**2), 
                                            0]    //lambda
                                    ]);
                break;
            }
            case Constraint.constraintMap.pointToLine: {
                /*  params: [0] - lambda,       constraint.elements:    [0] - point (x2, y2)
                            [1] - dx1,                                  [1] - line (x1, x3, y1, y3)
                            [2] - dx2, 
                            [3] - dx3,  
                            [4] - dy1, 
                            [5] - dy2, 
                            [6] - dy3, 
                */
                const j = math.matrix([ [1, 0, 0, 0, params[0], -params[0], 
                                            constraint.elements[0].y + params[5] - constraint.elements[1].endPoint.y - params[6]],      //dx1
                                        [0, 1, 0, -params[0], 0, params[0],
                                            (constraint.elements[1].endPoint.y + params[6] - constraint.elements[0].y - params[5]) +
                                            (constraint.elements[0].y + params[5] - constraint.elements[1].beginPoint.y - params[4])],  //dx2
                                        [0, 0, 1, params[0], -params[0], 0,
                                            constraint.elements[1].y + params[4] - constraint.elements[0].y - params[5]],               //dx3
                                        [0, -params[0], params[0], 1, 0, 0,
                                            constraint.elements[1].endPoint.x + params[3] - constraint.elements[0].x - params[2]],      //dy1
                                        [params[0], 0, -params[0], 0, 1, 0,
                                            (constraint.elements[1].beginPoint.x + params[1] - constraint.elements[0].x - params[2]) +
                                            (constraint.elements[0].x + params[2] - constraint.elements[1].endPoint.x - params[3])],    //dy2
                                        [-params[0], params[0], 0, 0, 0, 1,
                                            constraint.elements[0].x + params[2] - constraint.elements[1].beginPoint.x - params[1]],    //dy3
                                        [constraint.elements[0].y + params[5] - constraint.elements[1].endPoint.y - params[6], 
                                            (constraint.elements[1].endPoint.y + params[6] - constraint.elements[0].y - params[5]) +
                                            (constraint.elements[0].y + params[5] - constraint.elements[1].beginPoint.y - params[4]), 
                                            constraint.elements[1].y + params[4] - constraint.elements[0].y - params[5],
                                            constraint.elements[1].endPoint.x + params[3] - constraint.elements[0].x - params[2],
                                            (constraint.elements[1].beginPoint.x + params[1] - constraint.elements[0].x - params[2]) +
                                            (constraint.elements[0].x + params[2] - constraint.elements[1].endPoint.x - params[3]),
                                            constraint.elements[0].x + params[2] - constraint.elements[1].beginPoint.x - params[1], 0]    //lambda
                                    ]);
                break;
            }
            case Constraint.constraintMap.fixation: {
                const j = math.matrix([ [1, 0, 1, 0],    //dx1
                                        [0, 1, 0, 1],    //dy1
                                        [1, 0, 0, 0],   //lambda1
                                        [0, 1, 0, 0],    //lambda2
                                    ]);
                break;
            }
            default: {
                console.error("Unknown type of constraint: ", constraint.type);
                console.trace();
            }
        }
    }
}

const jacobiansMap = new JacobiansMap();

export default jacobiansMap;