const Graph = require('./graph1');

let myGraph = new Graph(true);

console.log('Создали тестовый граф: ');
myGraph = myGraph.createCompleteGraph(3);
myGraph.addVertex('O');
myGraph.addEdge('V1', 'O');
console.log(myGraph.toString());

const vertex = 'V1';
const vertex2 = 'O';

const degree = myGraph.outDegree(vertex);
const degree2 = myGraph.outDegree(vertex2);

console.log(`Полустепень исхода для вершины ${vertex}: ${degree}`);
console.log(`Полустепень исхода для вершины ${vertex2}: ${degree2}`);

myGraph.closeInput();
