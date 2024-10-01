const Graph = require('./graph1');

let myGraph = new Graph(true, false);

console.log('Создали тестовый граф: ');
myGraph = myGraph.createCompleteGraph(3);
console.log(myGraph.toString());

console.log('Добвили вершину Е ');
myGraph.addVertex('E');
console.log(myGraph.toString());

const isolatedVertices = myGraph.findIsolatedVertices();

if (isolatedVertices.length > 0) 
    console.log('Изолированные вершины:', isolatedVertices);
else
    console.log('Изолированных вершин нет');

myGraph.closeInput();

