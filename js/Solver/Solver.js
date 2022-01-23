import jacobiansMap from "./JacobiansMap";
import GaussSolver from "./GaussSolver";
import { create, all } from 'mathjs'
import Constraint from "./Constraint";

import GaussianElimination from 'na-gaussian-elimination';
import BigNumber from "bignumber.js";

const math = create(all)

export default class Solver {
    constructor() {
        this.EPS = 1e-6;
        this.MAX_ITERATIONS_NUM = 1e2;
        this.INITIAL_VALUE = 1e-5;
        this.gaussSolver = new GaussSolver();

        GaussianElimination.defaultOptions.pivoting = 'partial';
        this.gaussianElimination = new GaussianElimination();
    }

    solve(constraints) {
        // Создать глобальный вектор неизвестных 
        // Сначала лямбды, затем изменения координат, и так для каждого ограничения: [dx_i, dy_i, lambda_i]
        let { globalDeltaX, globalPointsList } = this._parseConstraints(constraints);

        // Основной цикл
        let currentIterNum = 0;
        let curX = [...globalDeltaX];

        let curAim = 0;
        while (!math.smaller(math.abs(globalDeltaX), this.EPS).reduce(
            (res, current) => {
                return !!(res && current);
            })
                && currentIterNum < this.MAX_ITERATIONS_NUM) {

            // Ансамблирование по сопрягающимся точкам
            let { globalJacobian, globalF } = this._ensemble(constraints, curX, globalPointsList);

            // MAIN
            // globalDeltaX = this._solveWithGaussCustom(globalJacobian, globalF.map(element => -element));
            globalDeltaX = this._solveWithGauss(globalJacobian, globalF.map((element) => -element));

            // Осуществляем шаг: X^r+1 = X^r + deltaX
            curX = math.add(curX, globalDeltaX);

            // ALTERNATIVE
            // let r = math.matrix(curX);
            // let J = math.matrix(globalJacobian);
            // let f = math.matrix(globalF);
            //
            // let inversedJ = math.inv(J);
            // let accum = math.multiply(inversedJ, f);
            // curX = math.subtract(r, accum)._data;

            curAim = this._getAimFunction(curX, globalF, constraints);
            console.log("current aim function value: " + curAim);

            currentIterNum++;
        }

        // Обновляем значения координат
        globalPointsList.forEach(point => {
            point.moveDelta({
                x: curX[point.globalId],
                y: curX[point.globalId + 1]
            });
        });

        constraints.forEach(constraint => {
           constraint.lambdasIdx = [];
           constraint.elements.forEach(primitive => {
              primitive.getPoints().forEach(point => {
                  // Очищаем точки
                  point.globalId = null;
              });
           });
        });
    }

    _parseConstraints(constraints) {
        let globalDeltaX = [];
        let globalPointsList = [];

        // Преобразовать список ограничений в список параметров, которые требуется отыскать
        constraints.forEach(constraint => {
            // Для каждого объекта, на который накладывается текущее ограничение
            constraint.elements.forEach(primitive => {
                // Для всех точек объекта
                primitive.getPoints().forEach(point => {
                    // Ищем индекс точки в глобальном списке всех уникальных точек эскиза
                    let idx = globalPointsList.indexOf(point);

                    if (idx === -1) {
                        // Не нашли индекс, добавляем уникальную точку в общий список, обновляя индекс точки (ниже)
                        globalPointsList.push(point);

                        // Также ниже добавляем новую точку в глобальный список неизвестных
                        // По сути сохраняем как бы индекс координаты dx, потом через смещение сможем получить dy
                        // Все потому, что вектор неизвестных выглядит примерно так: [dx1, dy1, dx2, dy2, lambda]
                        // dx
                        globalDeltaX.push(math.random(this.INITIAL_VALUE));
                        point.globalId = globalDeltaX.length - 1;

                        // Здесь можем просто положить для dy; хотя по сути в векторе неизвестных это будет не dy,
                        // в конце концов получим нужное количество неизвестных
                        // dy
                        globalDeltaX.push(math.random(this.INITIAL_VALUE));
                    }
                });
            });

            // Для каждой лямбды текущего ограничения добавляем ее в глобальный вектор неизвестных
            for (let i = 0; i < this._mapLambdasSize(constraint.type); i++) {
                globalDeltaX.push(math.random(this.INITIAL_VALUE));
                constraint.lambdasIdx[i] = globalDeltaX.length - 1;
            }
        });

        return {
            globalDeltaX: globalDeltaX,
            globalPointsList: globalPointsList
        };
    }

    _ensemble(constraints, globalDeltaX) {
        let globalJacobian = new Array(globalDeltaX.length);
        for (let i = 0; i < globalDeltaX.length; i++) {
            globalJacobian[i] = new Array(globalDeltaX.length).fill(0.0);
        }

        let globalF = new Array(globalDeltaX.length).fill(0.0);

        constraints.forEach(constraint => {
            let localJacobian = jacobiansMap.getJacobian(constraint, globalDeltaX, constraint.params);
            let localF = jacobiansMap.getF(constraint, globalDeltaX, constraint.params);

            // Обрабатываем часть, связанную с дельтами координат
            // По сути берем каждую строку с координатами
            let localRow = 0;
            let localCol = 0;
            let idxArray = [];
            let pointsCount = 0;
            constraint.elements.forEach(primitiveOuter => {
                primitiveOuter.getPoints().forEach(pointOuter => {
                    pointsCount++;

                    // Вектор глобальных индексов для всех deltap_i
                    idxArray.push(pointOuter.globalId);
                    idxArray.push(pointOuter.globalId + 1);

                    constraint.elements.forEach(primitive => {
                        primitive.getPoints().forEach(point => {
                            // [dx][dx]
                            globalJacobian[pointOuter.globalId][point.globalId] += localJacobian[localRow][localCol];

                            // [dy][dx]
                            globalJacobian[pointOuter.globalId + 1][point.globalId] +=
                                localJacobian[localRow + 1][localCol];

                            // [dx][dy]
                            globalJacobian[pointOuter.globalId][point.globalId + 1] +=
                                localJacobian[localRow][localCol + 1];

                            // [dy][dy]
                            globalJacobian[pointOuter.globalId + 1][point.globalId + 1] +=
                                localJacobian[localRow + 1][localCol + 1];

                            localCol += 2;
                        });
                    });
                    localCol = 0;

                    // dx
                    globalF[pointOuter.globalId] += localF[localRow];

                    // dy
                    globalF[pointOuter.globalId + 1] += localF[localRow + 1];

                    localRow += 2;
                });
            });

            // Точки всегда идут парами, поэтому первый индекс для лямбды просто в два раза больше, чем число точек
            localRow = pointsCount * 2;

            // Обрабатываем части, связанные с лямбдами
            constraint.lambdasIdx.forEach(lambdaIdxOuter => {
                // Обрабатываем часть с deltap_i
                idxArray.forEach(idx => {
                   globalJacobian[lambdaIdxOuter][idx] += localJacobian[localRow][localCol];
                   globalJacobian[idx][lambdaIdxOuter] += localJacobian[localCol][localRow];
                   localCol++;
                });

                // Обрабатываем лямбды
                constraint.lambdasIdx.forEach(lambdaIdx => {
                   globalJacobian[lambdaIdxOuter][lambdaIdx] += localJacobian[localRow][localCol];
                   globalJacobian[lambdaIdx][lambdaIdxOuter] += localJacobian[localCol][localRow];
                   localCol++;
                });

                globalF[lambdaIdxOuter] += localF[localRow];
                localRow++;
                localCol = 0;
            });
        });

        return {
            globalJacobian: globalJacobian,
            globalF: globalF,
        };
    }

    _solveWithGauss(globalJacobian, globalF) {
        let A = globalJacobian.map(row => row.map(val => new BigNumber(val)));
        let b = globalF.map(val => new BigNumber(val));

        return this.gaussianElimination.solve(A, b).solution.map(val => val.toNumber());
    }

    _solveWithGaussCustom(globalJacobian, globalF) {
        let A = [...globalJacobian];
        let b = [...globalF];

        return this.gaussSolver.solve(A, b);
    }

    _mapLambdasSize(constraintType) {
        switch (constraintType) {
            case Constraint.constraintMap.joint: {
                return 2;
            }
            case Constraint.constraintMap.distance: {
                return 1;
            }
            case Constraint.constraintMap.parallelism: {
                return 1;
            }
            case Constraint.constraintMap.perpendicularity: {
                return 1;
            }
            case Constraint.constraintMap.verticality: {
                return 1;
            }
            case Constraint.constraintMap.horizontality: {
                return 1;
            }
            case Constraint.constraintMap.angle: {
                return 1;
            }
            case Constraint.constraintMap.pointToLine: {
                return 1;
            }
            case Constraint.constraintMap.fixation: {
                return 2;
            }
            default: {
                console.error("Unknown type of constraint: ", constraintType);
                console.trace();
            }
        }
        return 0;
    }

    _getAimFunction(curX, globalF, constraints) {
        let sum1 = 0;
        let sum2 = 0;
        constraints.forEach(constraint => {
            constraint.elements.forEach(primitive => {
                primitive.getPoints().forEach(point => {
                   sum1 += (curX[point.globalId] + curX[point.globalId + 1]) ** 2;
                });
            });

            constraint.lambdasIdx.forEach(idx => {
               sum2 += curX[idx] * globalF[idx];
            });
        });

        return 0.5 * sum1 + sum2;
    }

}
