export const strings = {
    en: {
      title: "Tetonor Solver",
      description: "",
      mainHeading: "Tetonor Solver",
      intro: "Enter your puzzle or check your solution below.",
      buttons: {
        solve: "Solve",
        partialSolve: "Partial solve",
        check: "✔ Check",
        undo: "Undo",
        clearAll: "Clear all"
      },
      notifications: { 
        noSolutionFound: "There is no solution for this puzzle.", 
        multipleSolutionsFound: (n) => `This puzzle has ${n} solutions. Showing one of them.`,
        noSolutionFoundOrWrongLine: "Either there is no solution for this puzzle, or some of the numbers in the line at the bottom are incorrect.",
        passedCheck: "All correct. That matches a solution.",
        failedCheck: "Some of that does not match any solution.",
        cannotGetGrid: "Fill the big numbers in the grid first.",
        cannotGetBottomLine: "Numbers in the bottom line must be in ascending order."
      },
    },
    es: {
      title: "Solucionador de Tetonor",
      description: "",
      mainHeading: "Solucionador de Tetonor",
      intro: "Introduce tu puzzle o comprueba la solución debajo.",
      buttons: {
        solve: "Resolver",
        partialSolve: "Resolución parcial",
        check: "✔ Comprobar",
        undo: "Deshacer",
        clearAll: "Borrar todo"
      },
      notifications: { 
        noSolutionFound: "Este Tetonor no tiene solución.", 
        multipleSolutionsFound: (n) => `Este acertijo tiene ${n} soluciones. Mostrando una de ellas.`,
        noSolutionFoundOrWrongLine: "O bien no hay solución, o algunos números de la tira inferior son incorrectos.",
        passedCheck: "Correcto. Coincide con una solución.",
        failedCheck: "Parte de los valores no coinciden con ninguna solución.",
        cannotGetGrid: "Rellena primero los números grandes de la cuadrícula.",
        cannotGetBottomLine: "Los números de la tira inferior deben estar en orden ascendente."
      },
    },
};

