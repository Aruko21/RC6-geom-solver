import jacobiansMap from "./JacobiansMap";
import GaussSolver from "./GaussSolver";
import { create, all } from 'mathjs'

const math = create(all)

export default class Solver {
    constructor() {
        this.EPS = 1e-6;
        this.MAX_ITERATIONS_NUM = 1e3;
        this.gaussSolver = new GaussSolver();
    }

    solve(constraints) {
        // Создать глобальный вектор неизвестных 
        // Сначала лямбды, затем изменения координат, и так для каждого ограничения: [dx_i, dy_i, lambda_i]
        let { globalDeltaX, globalPointsList } = this._parseConstraints(constraints);
        
        // Ансамблирование по сопрягающимся точкам
        let { globalJacobian, globalF } = this._ensemble(constraints, globalDeltaX, globalPointsList);

        // Основной цикл
        let currentIterNum = 0;
        let curX = math.clone(globalDeltaX);
        while (!math.smaller(math.abs(globalDeltaX), this.EPS) && currentIterNum < this.MAX_ITERATIONS_NUM) {
            // Получаем смещение deltaX
            globalDeltaX = this._solveWithGauss(globalJacobian, globalF.map((element) => -element));

            // Осуществляем шаг: X^r+1 = X^r + deltaX
            curX = math.add(curX, globalDeltaX);
        }

        // Обновляем значения координат
        constraints.forEach(() => {
            globalPointsList.forEach(point => {
               point.x += curX[point.globalId];
               point.y += curX[point.globalId + point.localOffset];
            });
        })
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
                        globalDeltaX.push(0.001)
                        point.globalId = globalDeltaX.length - 1;

                        // Здесь можем просто положить для dy; хотя по сути в векторе неизвестных это будет не dy,
                        // в конце концов получим нужное количество неизвестных
                        // dy
                        globalDeltaX.push(0.001)
                    }

                    // Записываем локальное смещение для получения второй координаты
                    point.localOffset = pointsNum;
                });
            });

            // Для каждой лямбды текущего ограничения добавляем ее в глобальный вектор неизвестных
            for (let i = 0; i < constraint.lambdasIdx.length; i++) {
                globalDeltaX.push(0.001);
                constraint.lambdasIdx[i] = globalDeltaX.length - 1;
            }
        });

        return {
            globalDeltaX: globalDeltaX,
            globalPointsList: globalPointsList
        };
    }

    _ensemble(constraints, globalDeltaX) {
        let globalJacobian = math.zeros(globalDeltaX.length, globalDeltaX.length);
        let globalF = new Array(globalDeltaX.length);

        constraints.forEach(constraint => {
            let localJacobian = jacobiansMap.getJacobian(constraint, globalDeltaX, constraint.params);
            let localF = jacobiansMap.getF(constraint, globalDeltaX, constraint.params);

            // Обрабатываем часть, связанную с дельтами координат
            // По сути берем каждую строку с координатами
            let localRow = 0;
            let localCol = 0;
            constraint.elements.forEach(primitiveOuter => {
                primitiveOuter.getPoints().forEach(pointOuter => {
                    // И для каждого столбца
                    constraint.elements.forEach(primitive => {
                        primitive.getPoints().forEach(point => {
                            globalJacobian[pointOuter.globalId][point.globalId] += localJacobian[localRow][localCol];
                            globalJacobian[pointOuter.globalId][point.globalId + point.localOffset] += localJacobian[localRow][localCol + point.localOffset];
                            localCol++;
                        });
                    });

                    constraint.elements.forEach(primitive => {
                        primitive.getPoints().forEach(point => {
                            globalJacobian[pointOuter.globalId + point.localOffset][point.globalId] += localJacobian[localRow + point.localOffset][localCol];
                            globalJacobian[pointOuter.globalId + point.localOffset][point.globalId + point.localOffset] += localJacobian[localRow + point.localOffset][localCol + point.localOffset];
                            localCol++;
                        });
                    });

                    globalF[pointOuter.globalId ] += localF[localRow];
                    globalF[pointOuter.globalId + pointOuter.localOffset] += localF[localRow + pointOuter.localOffset];
                    localRow++;
                });
            });

            // Обрабатываем части, связанные с лямбдами
            localRow = 0;
            localCol = 0;
            constraint.lambdasIdx.forEach(lambdaIdxOuter => {
                constraint.lambdasIdx.forEach(lambdaIdx => {
                   globalJacobian[lambdaIdxOuter][lambdaIdx] += localJacobian[localRow][localCol];
                   localCol++;
                });

                globalF[lambdaIdxOuter] += localF[lambdaIdxOuter];
                localRow++;
            });
        });

        return {
            globalJacobian: globalJacobian,
            globalF: globalF,
        };
    }

    _solveWithGauss(globalJacobian, globalF) {
        let A = math.clone(globalJacobian);
        let b = math.clone(globalF);

        return this.gaussSolver.solve(A, b);
    }

}
