import jacobiansMap from "./JacobiansMap";
import GaussSolver from "./GaussSolver";
import { create, all } from 'mathjs'
import Constraint from "./Constraint";

// import GaussianElimination from 'na-gaussian-elimination';
// import BigNumber from "bignumber.js";

const math = create(all)

export default class Solver {
    constructor() {
        this.EPS = 1e-6;
        this.MAX_ITERATIONS_NUM = 1e2;
        this.INITIAL_VALUE = 1e-6;
        this.gaussSolver = new GaussSolver();

        this.gaussianElimination = new GaussianElimination();
    }

    solve(constraints) {
        // Создать глобальный вектор неизвестных 
        // Сначала лямбды, затем изменения координат, и так для каждого ограничения: [dx_i, dy_i, lambda_i]
        let { globalDeltaX, globalPointsList } = this._parseConstraints(constraints);

        // Основной цикл
        let currentIterNum = 0;
        let curX = [...globalDeltaX];
        while (!math.smaller(math.abs(globalDeltaX), this.EPS).reduce(
            (res, current) => {
                return !!(res && current);
            })
                && currentIterNum < this.MAX_ITERATIONS_NUM) {

            // Ансамблирование по сопрягающимся точкам
            let { globalJacobian, globalF } = this._ensemble(constraints, curX, globalPointsList);

            globalDeltaX = this.gaussSolver.solve(globalJacobian, globalF.map(element => -element));
            // globalDeltaX = this._solveWithGauss(globalJacobian, globalF.map((element) => -element));

            // Осуществляем шаг: X^r+1 = X^r + deltaX
            curX = math.add(curX, globalDeltaX);

            currentIterNum++;
        }

        // Обновляем значения координат
        globalPointsList.forEach(point => {
           point.x += curX[point.globalId];
           point.y += curX[point.globalId + point.localOffset];
        });
    }

    _parseConstraints(constraints) {
        let globalDeltaX = [];
        let globalPointsList = [];

        // Преобразовать список ограничений в список параметров, которые требуется отыскать
        constraints.forEach(constraint => {
            // Определяем локальное смещение, которое позволит отыскать координаты для данной точки
            // это смещение должно быть равно числу точек для данного ограничения
            let pointsNum = 0;
            constraint.elements.forEach(primitive => {
                pointsNum += primitive.getPoints().length;
            });

            // Для каждого объекта, на который накладывается текущее ограничение
            constraint.elements.forEach(primitive => {
                // Для всех точек объекта
                primitive.getPoints().forEach(point => {
                    // Ищем индекс точки в глобальном списке всех уникальных точек эскиза
                    let idx = globalPointsList.indexOf(point);

                    if (idx !== -1) {
                        // Нашли индекс, присваиваем его точке
                        point.globalId = idx;
                    } else {
                        // Не нашли индекс, добавляем уникальную точку в общий список, обновляя индекс точки (ниже)
                        globalPointsList.push(point);

                        // Также ниже добавляем новую точку в глобальный список неизвестных
                        // По сути сохраняем как бы индекс координаты dx, потом через смещение сможем получить dy
                        // Все потому, что вектор неизвестных выглядит примерно так: [dx1, dx2, dy1, dy2, lambda]
                        // dx
                        globalDeltaX.push(this.INITIAL_VALUE)
                        point.globalId = globalDeltaX.length - 1;

                        // Здесь можем просто положить для dy; хотя по сути в векторе неизвестных это будет не dy,
                        // в конце концов получим нужное количество неизвестных
                        // dy
                        globalDeltaX.push(this.INITIAL_VALUE)
                    }

                    // Записываем локальное смещение для получения второй координаты
                    point.localOffset = pointsNum;
                });
            });

            // Для каждой лямбды текущего ограничения добавляем ее в глобальный вектор неизвестных
            for (let i = 0; i < this._mapLambdasSize(constraint.type); i++) {
                globalDeltaX.push(this.INITIAL_VALUE);
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
            let pointOuterLength = 0;
            constraint.elements.forEach(primitiveOuter => {
                primitiveOuter.getPoints().forEach(pointOuter => {
                    if (pointOuterLength === 0) {
                        pointOuterLength = pointOuter.localOffset;
                    }

                    // Вектор глобальных индексов для всех deltap_i
                    idxArray.push(pointOuter.globalId);

                    // И для каждого столбца
                    constraint.elements.forEach(primitive => {
                        primitive.getPoints().forEach(point => {
                            // Записываем индекс для deltax_i

                            // [dx][dx]
                            globalJacobian[pointOuter.globalId][point.globalId] += localJacobian[localRow][localCol];

                            // [dy][dx]
                            globalJacobian[pointOuter.globalId + pointOuter.localOffset][point.globalId] +=
                                localJacobian[localRow + point.localOffset][localCol];

                            // [dx][dy]
                            globalJacobian[pointOuter.globalId][point.globalId + point.localOffset] +=
                                localJacobian[localRow][localCol + point.localOffset];

                            // [dy][dy]
                            globalJacobian[pointOuter.globalId + pointOuter.localOffset][point.globalId + point.localOffset] +=
                                localJacobian[localRow + point.localOffset][localCol + point.localOffset];

                            localCol++;
                        });
                    });

                    // dx
                    globalF[pointOuter.globalId] += localF[localRow];

                    // dy
                    globalF[pointOuter.globalId + pointOuter.localOffset] += localF[localRow + pointOuter.localOffset];
                    localRow++;
                });
                localCol = 0;
            });

            // Получили вектор индексов: [deltax_i, deltay_i]
            let initialLength = idxArray.length;
            for (let i = 0; i < initialLength; i++) {
                idxArray.push(idxArray[i] + pointOuterLength);
            }

            // Точки всегда идут парами, поэтому первый индекс для лямбды просто в два раза больше, чем число точек
            localRow *= 2;

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

    // _solveWithGauss(globalJacobian, globalF) {
    //     let A = globalJacobian.map(row => row.map(val => new BigNumber(val)));
    //     let b = globalF.map(val => new BigNumber(val));
    //
    //     return this.gaussianElimination.solve(A, b).solution.map(val => val.toNumber());
    // }

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
                console.error("Unknown type of constraint: ", constraint.type);
                console.trace();
            }
        }
        return 0;
    }

}
