import math from "mathjs";

export default class GaussSolver {
    constructor() {
    }

    fillArray(i, n, v) {
        let a = [];
        for (; i < n; i++) {
            a.push(v);
        }
        return a;
    }

    solve(A, b) {
        // Делаем расширенную матрицу с вектором правых частей
        for (let i = 0; i < A.length; i++) {
            A[i].push(b[i]);
        }
        let n = A.length;

        // Прямой ход с выбором главного элемента
        for (let i = 0; i < n; i++) {
            // Поиск максимума по столбцу
            let maxEl = math.abs(A[i][i]);
            let maxRow = i;
            for (let k = i + 1; k < n; k++) {
                if (math.abs(A[k][i]) > maxEl) {
                    maxEl = math.abs(A[k][i]);
                    maxRow = k;
                }
            }

            // Обмен строк
            for (let k = i; k < n + 1; k++) {
                let tmp = A[maxRow][k];
                A[maxRow][k] = A[i][k];
                A[i][k] = tmp;
            }

            // Обнуление ячеек под главным элементом
            for (let k = i + 1; k < n; k++) {
                let c = -A[k][i] / A[i][i];
                for (let j = i; j < n + 1; j++) {
                    if (i === j) {
                        A[k][j] = 0;
                    } else {
                        A[k][j] += c * A[i][j];
                    }
                }
            }
        }

        // Обратный ход
        let x = this.fillArray(0, n, 0);
        for (let i = n - 1; i > -1; i--) {
            x[i] = A[i][n] / A[i][i];
            for (let k = i - 1; k > -1; k--) {
                A[k][n] -= A[k][i] * x[i];
            }
        }

        return x;
    }
}
