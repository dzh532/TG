const Graph = require('./graph1');

let myGraph = new Graph(true);

console.log('Создали первоначальный граф: ');
myGraph.addVertex('A');
myGraph.addVertex('B');
myGraph.addVertex('C');
myGraph.addEdge('A', 'B');
myGraph.addEdge('A', 'C');
myGraph.addEdge('B', 'C');

console.log(myGraph.toString());

const complementDirectedGraph = myGraph.getComplement();
console.log("\nДополнение орграфа:");
console.log(complementDirectedGraph.toString());

myGraph.closeInput();
