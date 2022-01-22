import jacobiansMap from './JacobiansMap';
import math from "mathjs";

export default class Solver {
    constructor() {
    }

    solve(constraints) {
        // Создать глобальный вектор неизвестных 
        // Сначала лямбды, затем изменения координат, и так для каждого ограничения: [lambda_i, dx_i, dy_i]
        let globalDeltaX = this._parseConstraints(constraints);
        
        // Ансамблирование по сопрягающимся точкам
        let {globalJacobian, globalF} = this._ensemble(constraints, globalDeltaX);

    }

    _parseConstraints(constraints) {
        let globalDeltaX = [];
        let globalPointsList = [];

        // Преобразовать список ограничений в список параметров, которые требуется отыскать
        constraints.forEach(constraint => {
            // Для каждой лямбды текущего ограничения сперва добавляем ее в глобальный вектор неизвестных
            constraint.lambdas.forEach(() => {
                globalDeltaX.push(0.001);
            });

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

                        // Записываем локальное смещение для получения второй координаты
                        point.localOffset = pointsNum;
                    } else {
                        // Не нашли индекс, добавляем уникальную точку в общий список, обновляя индекс точки (ниже)
                        globalPointsList.push(point);

                        // Также ниже добавляем новую точку в глобальный список неизвестных
                        // !Костыльно, да!
                        // По сути сохраняем как бы индекс координаты dx, потом через смещение сможем получить dy
                        // Все потому, что вектор неизвестных выглядит примерно так: [lambda, dx1, dx2, dy1, dy2]

                        // dx
                        globalDeltaX.push(0.001)
                        point.globalId = globalDeltaX.length - 1;

                        // Здесь можем просто положить для dy; хотя по сути в векторе неизвестных это будет не dy,
                        // в конце концов получим нужное количество неизвестных
                        // dy
                        globalDeltaX.push(0.001)
                    }
                });
            });
        });

        return globalDeltaX;
    }

    _ensemble(constraints, globalDeltaX) {
        let globalJacobian = math.zeros(globalDeltaX.length, globalDeltaX.length);
        let globalF = new Array(globalDeltaX.length);

        let curRow = 0;
        let curCol = 0;
        constraints.forEach(constraint => {
            let localJacobian = jacobiansMap.getJacobian(constraint, globalDeltaX);

            // Сначала обрабатываем части, связанные с лямбдами
            for (let i = 0; i < globalDeltaX.length; i++) {
                for (let j = 0; j < constraint.lambdas.length; j++) {
                    globalJacobian[curRow][curCol] += localJacobian[i][j];
                    curCol++;
                }
                curRow++;
            }

            // Теперь обрабатываем часть, связанную с дельтами координат
            for (let i = 0; i < globalDeltaX.length; i++) {
                // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                // !!! Работать сейчас не будет - додумать, как учесть еще правую часть !!!
                let localIdx = 0;
                constraint.elements.forEach(primitive => {
                    primitive.getPoints().forEach(point => {
                        globalJacobian[point.globalRowNum][point.globalId] += localJacobian[i][localIdx];
                        localIdx++;
                    });
                });
            }
        });

        return {
            globalJacobian: globalJacobian,
            globalF: globalF,
        };
    }
}
