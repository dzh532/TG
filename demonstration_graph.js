const Graph = require('./graph1');

let myGraph = new Graph();

console.log('Создали тестовый граф: ');
myGraph = Graph.createTestGraph();
console.log(myGraph.toString());

console.log('Добвили вершину Е ');
myGraph.addVertex('E');
console.log(myGraph.toString());

console.log('Добвили Ребро Е - А ');
myGraph.addEdge('E', 'A', 1);
console.log(myGraph.toString());

console.log('Удалили вершину D ');
myGraph.removeVertex('D');
console.log(myGraph.toString());

console.log('Удалили Ребро А - В ');
myGraph.removeEdge('A', 'B');
console.log(myGraph.toString());

myGraph.closeInput();

