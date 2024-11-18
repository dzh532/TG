const fs = require('fs');
const readline = require('readline');
// const { MinPriorityQueue } = require('vanilla-priority-queue');

const rl = readline.createInterface
({
    input: process.stdin,
    output: process.stdout
});


class Graph 
{
    constructor(directed = false, weighted = false) 
    {
        this.adjacencyList = {};
        this.transposedList = {};
        this.directed = directed;
        this.weighted = weighted;
    }

    isGraph() 
    {
        const direction = this.directed ? "ориентированный" : "НЕориентированный";
        const weight = this.weighted ? "взвешенный" : "НЕвзвешенный";
        return `${direction} | ${weight}`;
    }

//     // Добавление вершины
//     addVertex(vertex){...}

//     // Добавление ребра
//     addEdge(edgeFrom, edgeTo, weight = 1) {...}

    
//     // Удаление вершины
//     removeVertex(vertex){...}

//     // Удаление ребра
//     removeEdge(edgeFrom, edgeTo){...}

//     // Вывод списка смежности
//     toString(){...}
// }
    
    // Добавление вершины
    addVertex(vertex) 
    {
        if (!this.adjacencyList[vertex])
        {
            this.adjacencyList[vertex] = [];
            console.log(`Вершина ${vertex} добавлена.`);
            this.transposedList[vertex] = [];
        }
        else console.log(`Вершина "${vertex}" уже существует`);
    }

    // Добавление ребра
    addEdge(edgeFrom, edgeTo, weight = 1) 
    {
        let ok = true;
        if (!this.adjacencyList[edgeFrom])
        {
            console.log(`Вершины ${edgeFrom} не существует`);
            ok = false;
        }

        if (!this.adjacencyList[edgeTo])
        {
            console.log(`Вершины ${edgeTo} не существует`);
            ok = false;
        }
        if (ok)
        {
            const edgeExists = this.adjacencyList[edgeFrom].some(edge => edge.node === edgeTo);
            if (!edgeExists)
            {
                if (this.weighted)
                {
                        this.adjacencyList[edgeFrom].push({ node: edgeTo, weight });
                        this.transposedList[edgeTo].push({ node: edgeFrom }); // в инвертированный граф

                    
                        if (!this.directed)
                        {
                            this.adjacencyList[edgeTo].push({ node: edgeFrom, weight });
                            this.transposedList[edgeFrom].push({ node: edgeTo }); // в инвертированный граф

                        }
                        console.log(`Ребро от ${edgeFrom} до ${edgeTo} с весом ${weight} добавлено.`);
                }
                else
                {
                    this.adjacencyList[edgeFrom].push({ node: edgeTo});
                    this.transposedList[edgeTo].push({ node: edgeFrom }); // в инвертированный граф
                
                    if (!this.directed)
                    {
                        this.adjacencyList[edgeTo].push({ node: edgeFrom});
                        this.transposedList[edgeFrom].push({ node: edgeTo }); // в инвертированный граф
                    }

                    console.log(`Ребро от ${edgeFrom} до ${edgeTo} добавлено.`);
                }
            }
            else console.log(`Данное ребро уже существует`);
        }
    }

    // Удаление вершины
    removeVertex(vertex) 
    {
        if (!this.adjacencyList[vertex])
            console.log(`Вершины ${vertex} не существует.`);
        else
        {
            delete this.adjacencyList[vertex];
            
            for (const key in this.adjacencyList)
                this.adjacencyList[key] = this.adjacencyList[key].filter(edge => edge.node !== vertex);

            console.log(`Вершина ${vertex} удалена.`);
        }
    }

    // Удаление ребра
    removeEdge(edgeFrom, edgeTo) 
    {
        let ok = true;

        if (!this.adjacencyList[edgeFrom])
        {
            console.log(`Вершины ${edgeFrom} не существует.`);
            ok = false;
        }

        if (!this.adjacencyList[edgeTo])
        {
            console.log(`Вершины ${edgeTo} не существует.`);
            ok = false;
        }

        if (ok)
        {
            const edgeExists = this.adjacencyList[edgeFrom].some(edge => edge.node === edgeTo);
            if (edgeExists)
            {
                if (this.adjacencyList[edgeFrom])
                    this.adjacencyList[edgeFrom] = this.adjacencyList[edgeFrom].filter(edge => edge.node !== edgeTo);
                
                if (this.transposedList[edgeTo])
                    this.transposedList[edgeTo] = this.transposedList[edgeTo].filter(edge => edge.node !== edgeFrom);

                if (!this.directed && this.adjacencyList[edgeTo])
                    this.adjacencyList[edgeTo] = this.adjacencyList[edgeTo].filter(edge => edge.node !== edgeFrom);

                console.log(`Ребро от ${edgeFrom} до ${edgeTo} удалено.`);
            }
            else console.log(`Данного ребра не существует`);
        }
    }

    // Вывод списка смежности
    toString() 
    {
        let result = '';
        if (this.weighted)
        {
            for (const vertex in this.adjacencyList)
                result += `${vertex} -> ${this.adjacencyList[vertex].map(edge => `${edge.node} (${edge.weight})`).join(', ')}\n`;
        }
        else
        {
            for (const vertex in this.adjacencyList)
                result += `${vertex} -> ${this.adjacencyList[vertex].map(edge => `${edge.node}`).join(', ')}\n`;
        }
        return result;
    }

    static async fromFile(filePath) 
    {
        const graph = new Graph();

        const fileStream = fs.createReadStream(filePath);
        const rl = readline.createInterface
        ({
            input: fileStream,
            crlfDelay: Infinity
        });

        let isDirected = false;
        let isWeighted = false;

        for await (const line of rl) 
        {
            const trimmedLine = line.trim();

            if (trimmedLine.startsWith('#')) 
            {
                if (trimmedLine.includes('dir_w')) 
                {
                    isDirected = true; 
                    isWeighted = true;
                }
                else if (trimmedLine.includes('und_w')) 
                {
                    isDirected = false;
                    isWeighted = true;
                }
                else if (trimmedLine.includes('dir_unw')) 
                {
                    isDirected = true; 
                    isWeighted = false;
                }
                else if (trimmedLine.includes('und_unw')) 
                {
                    isDirected = false;
                    isWeighted = false;
                }

                continue;
            }

            graph.directed = isDirected;
            graph.weighted = isWeighted;

            if (trimmedLine === '' || trimmedLine.startsWith('#')) continue;
            
            const parts = trimmedLine.split(',');
            if (parts.length < 2) continue;

            const edgeFrom = parts[0].trim();
            const edgeTo = parts[1].trim();
            const weight = parts.length === 3 ? parseInt(parts[2].trim()) : 1;

            if (edgeTo.length > 0) graph.addEdge(edgeFrom, edgeTo, weight);
            else graph.addVertex(edgeFrom);
        }
        return graph;
    }

    exportToFile(filePath) 
    {
        let result = '';

        const vertices = Object.keys(this.adjacencyList);
        result += vertices.join(',\n') + ',\n';

        if (this.weighted)
            for (const vertex in this.adjacencyList) 
                for (const edge of this.adjacencyList[vertex]) 
                    result += `${vertex},${edge.node},${edge.weight}\n`;

        else
            for (const vertex in this.adjacencyList) 
                for (const edge of this.adjacencyList[vertex]) 
                    result += `${vertex},${edge.node}\n`;


        fs.writeFile(filePath, result, (err) => 
        {
            if (err) 
            {
                console.error('Ошибка при записи в файл:', err);
                handleUserInput();
            } 
            else 
            {
                console.log(`Список смежности успешно сохранен в файл: ${filePath}`);
                handleUserInput();
            }
        });
    }

    exportToFileForVisual(filePath) 
    {
        let result = '';

        if (this.weighted)
        {
            for (const vertex in this.adjacencyList) 
            {
                const edges = this.adjacencyList[vertex];

                const edgeList = edges.map(edge => this.weighted ? `${edge.node} (w: ${edge.weight})` : edge.node);

                result += `${vertex} -> ${edgeList.join(', ')}\n`;
            }
        }
        else
        {
            for (const vertex in this.adjacencyList) 
            {
                const edges = this.adjacencyList[vertex];

                const edgeList = edges.map(edge => this.weighted ? `${edge.node} (${edge.weight})` : edge.node);

                result += `${vertex} -> ${edgeList.join(', ')}\n`;
            }
        }

        fs.writeFile(filePath, result, (err) => 
        {
            if (err) 
            {
                console.error('Ошибка при записи в файл:', err);
                handleUserInput();
            } 
            else 
            {
                console.log(`Список смежности успешно сохранен в файл: ${filePath}`);
                handleUserInput();
            }
        });
    }

    copy() 
    {
        const newGraph = new Graph(this.directed, this.weighted);
        for (const vertex in this.adjacencyList) 
            newGraph.addVertex(vertex);

        for (const vertex in this.adjacencyList) 
            for (const edge of this.adjacencyList[vertex])
                newGraph.addEdge(vertex, edge.node);

        return newGraph;
    }

    createCompleteGraph(numVertices, directed = false, weighted = false) {
        const graph = new Graph(directed, weighted);

        for (let i = 0; i < numVertices; i++)
            graph.addVertex(`V${i + 1}`);

        for (let i = 0; i < numVertices; i++) 
            {
            for (let j = 0; j < numVertices; j++) 
            {
                if (i !== j) 
                {
                    const weight = weighted ? Math.floor(Math.random() * 10) + 1 : 1; // Случайный вес от 1 до 10
                    graph.addEdge(`V${i + 1}`, `V${j + 1}`, weight);
                }
            }
        }
        return graph;
    }

    hasVertices() 
    {
        for (const vertex in this.adjacencyList)
            return false;

        return true; // Если нет свойств, то граф пустой
    }

    // полустепень исхода
    outDegree(vertex) 
    {
        if (!this.adjacencyList[vertex])
        {
            console.log(`Вершины ${vertex} не существует.`);
            return -1;
        }
        return this.adjacencyList[vertex].length;
    }

    // полустепень захода
    inDegree(vertex) 
    {
        if (!this.adjacencyList[vertex]) 
        {
            console.log(`Вершины ${vertex} не существует.`);
            return -1;
        }
    
        let count = 0;
    
        for (let v in this.adjacencyList)
            if (this.adjacencyList[v].some(edge => edge.node === vertex))
                count++;
    
        return count;
    }

    // поиск исзолированных вершин
    findIsolatedVertices() 
    {
        const isolatedVertices = [];
    
        for (const vertex in this.adjacencyList) 
        {
            const degreeOut = this.outDegree(vertex);
            const degreeIn = this.inDegree(vertex);

            if (degreeOut === 0 && degreeIn === 0)
                isolatedVertices.push(vertex);
        }
    
        return isolatedVertices;
    }


    openFileFromFile()
    {
        openFileAndLoadGraph();
    }

    closeInput() 
    {
        rl.close();
    }

    addOrDelEdge(fromVertex, toVertex) 
    {
        if (this.adjacencyList[fromVertex] && this.adjacencyList[toVertex]) 
        {
            const edgeIndex = this.adjacencyList[fromVertex].findIndex(edge => edge.node === toVertex);
            if (edgeIndex === -1) this.adjacencyList[fromVertex].push({ node: toVertex });
            else this.adjacencyList[fromVertex].splice(edgeIndex, 1);
        }
    }

    // Дополнение орграфа
    getComplement() {
        const vertices = Object.keys(this.adjacencyList);

        for (let i = 0; i < vertices.length; i++) 
        {
            for (let j = 0; j < vertices.length; j++) 
            {
                if (i !== j) 
                {
                    const fromVertex = vertices[i];
                    const toVertex = vertices[j];
                    this.addOrDelEdge(fromVertex, toVertex); 
                }
            }
        }
    }

    // Найти путь, соединяющий вершины u1 и u2 и не проходящий через вершину v
    findPath(u1, u2, v) {
        const visited = new Set();
        const path = [];
    
        const dfs = (current) => 
        {
            if (current === u2) 
            {
                path.push(current);
                return true; // путь найден
            }
    
            visited.add(current);
            path.push(current);
    
            if (!this.adjacencyList[current]) 
            {
                console.log(`Вершина ${current} отсутствует в графе.`);
                return false;
            }
    
            for (const edge of this.adjacencyList[current]) 
            {
                const neighbor = edge.node;
    
                if (!visited.has(neighbor) && neighbor !== v) 
                    if (dfs(neighbor)) 
                        return true;
            }
    
            path.pop(); 
            return false;
        };
    
        dfs(u1);
        
        return path.length > 0 && path[path.length - 1] === u2 ? path : null;
    }

    // Найти сильно связные компоненты орграфа
    // Первый проход BFS для получения порядка выхода
    bfsFirstPass(vertex, visited, stack) 
    {
        const queue = [vertex];
        visited.add(vertex);

        while (queue.length > 0) 
        {
            const current = queue.shift();
            for (const edge of this.adjacencyList[current]) 
            {
                const neighbor = edge.node;
                if (!visited.has(neighbor)) 
                {
                    visited.add(neighbor);
                    queue.push(neighbor);
                }
            }
            stack.push(current);
        }
    }

    // Второй проход BFS для нахождения ССК
    bfsSecondPass(vertex, visited, component) 
    {
        const queue = [vertex];
        visited.add(vertex);
        component.push(vertex);

        while (queue.length > 0) 
        {
            const current = queue.shift();
            for (const edge of this.transposedList[current]) 
            {
                const neighbor = edge.node;
                if (!visited.has(neighbor)) 
                {
                    visited.add(neighbor);
                    queue.push(neighbor);
                    component.push(neighbor);
                }
            }
        }
    }

    findStronglyConnectedComponents() 
    {
        const visited = new Set();
        const stack = [];
    
        // Первый проход
        for (const vertex in this.adjacencyList) 
            if (!visited.has(vertex))
                this.bfsFirstPass(vertex, visited, stack);
    
        // Второй проход
        visited.clear();
        const stronglyConnectedComponents = [];
    
        while (stack.length > 0)
        {
            const vertex = stack.shift();
            if (!visited.has(vertex)) 
            {
                const component = [];
                this.bfsSecondPass(vertex, visited, component);
                stronglyConnectedComponents.push(component);
            }
        }
    
        // Добавляем отдельные компоненты для изолированных вершин
        for (const vertex in this.adjacencyList)
            if (!visited.has(vertex))
                stronglyConnectedComponents.push([vertex]);

        return stronglyConnectedComponents;
    }

    findMinimumSpanningTree()
    {
        const edges = [];
        
        for (let vertex in this.adjacencyList) 
            for (let edge of this.adjacencyList[vertex]) 
                if (vertex < edge.node)
                    edges.push({ weight: edge.weight, vertices: [vertex, edge.node] });

        edges.sort((a, b) => a.weight - b.weight);

        const parent = {};
        const rank = {};

        for (let vertex in this.adjacencyList) 
        {
            parent[vertex] = vertex;
            rank[vertex] = 0;
        }

        const find = (v) => 
        {
            if (parent[v] !== v) parent[v] = find(parent[v]);
            return parent[v];
        };

        const union = (v1, v2) => 
        {
            const root1 = find(v1);
            const root2 = find(v2);

            if (root1 !== root2)
            {
                if (rank[root1] > rank[root2]) parent[root2] = root1;
                else if (rank[root1] < rank[root2]) parent[root1] = root2;
                else
                {
                    parent[root2] = root1;
                    rank[root1]++;
                }
            }
        };

        const mstEdges = [];
        
        for (let edge of edges)
        {
            const { vertices: [v1, v2], weight } = edge;
            if (find(v1) !== find(v2)) 
            {
                union(v1, v2);
                mstEdges.push(edge);
            }
        }


        const mstGraph = new Graph(false, true);
        
        for (let edge of mstEdges) 
        {
            const [v1, v2] = edge.vertices;
            mstGraph.addVertex(v1);
            mstGraph.addVertex(v2);
            mstGraph.addEdge(v1, v2, edge.weight);
        }

        return mstGraph;
    }
    
    deikstra(start)
    {
        const distances = {};
        const priorityQueue = new MinPriorityQueue();

        for (let vertex in this.adjacencyList) distances[vertex] = Infinity;
        
        distances[start] = 0;

        priorityQueue.enqueue(start, 0);

        while (!priorityQueue.isEmpty()) 
        {
            const { element: currentVertex } = priorityQueue.dequeue();

            for (let neighbor of this.adjacencyList[currentVertex]) 
            {
                const { node: neighborVertex, weight } = neighbor;
                const newDistance = distances[currentVertex] + weight;

                // Если найдено более короткое расстояние до соседней вершины
                if (newDistance < distances[neighborVertex])
                {
                    distances[neighborVertex] = newDistance;
                    priorityQueue.enqueue(neighborVertex, newDistance);
                }
            }
        }

        return distances;
    }

    bellmanFord(start) 
    {
        const distances = {};
        const predecessors = {};
        const hasLoop = {};

        for (let vertex in this.adjacencyList) 
        {
            distances[vertex] = Infinity;
            predecessors[vertex] = null;
            hasLoop[vertex] = false;
        }
        
        distances[start] = 0;

        // Основной цикл алгоритма
        for (let i = 0; i < Object.keys(this.adjacencyList).length - 1; i++) 
        {
            for (let vertex in this.adjacencyList) 
            {
                for (let neighbor of this.adjacencyList[vertex]) 
                {
                    const { node: neighborVertex, weight } = neighbor;
                    if (distances[vertex] + weight < distances[neighborVertex]) 
                    {
                        distances[neighborVertex] = distances[vertex] + weight;
                        predecessors[neighborVertex] = vertex; // Запоминаем предшественника
                    }
                }
            }
        }

        // Проверка на наличие отрицательных циклов
        for (let vertex in this.adjacencyList) 
        {
            for (let neighbor of this.adjacencyList[vertex]) 
            {
                const { node: neighborVertex, weight } = neighbor;
                if (distances[vertex] + weight < distances[neighborVertex])
                    throw new Error("Граф содержит отрицательный цикл");
            
                if (vertex === neighborVertex)
                    hasLoop[vertex] = true;
            }
        }

        // Формируем пути из предшественников
        const paths = {};
        for (let vertex in distances) 
        {
            if (distances[vertex] < Infinity) 
            {
                const path = this.getPath(predecessors, vertex);
                if (hasLoop[vertex]) path.push(vertex);
                else paths[vertex] = path;

                if (path.length === 1 && path[0] === vertex) paths[vertex] = null;
                else paths[vertex] = path; 
            } 
            else paths[vertex] = null; 
        }

        return { distances, paths };
    }

    // Вспомогательная функция для формирования пути из предшественников
    getPath(predecessors, vertex) 
    {
        const path = [];
        while (vertex !== null) 
        {
            path.unshift(vertex); // Добавляем вершину в начало пути
            vertex = predecessors[vertex];
        }
        return path;
    }

    
    floid(N) 
    {
        const vertices = Object.keys(this.adjacencyList);
        const numVertices = vertices.length;

        // Матрица расстояний
        const distance = Array.from({ length: numVertices }, () => 
            Array(numVertices).fill(Infinity)
        );

        for (let i = 0; i < numVertices; i++) distance[i][i] = 0;

        for (let vertex in this.adjacencyList) 
        {
            const index = vertices.indexOf(vertex);
            for (let edge of this.adjacencyList[vertex])
            {
                const neighborIndex = vertices.indexOf(edge.node);
                distance[index][neighborIndex] = edge.weight; // Установка весов рёбер
            }
        }

        // Алгоритм Флойда
        for (let k = 0; k < numVertices; k++) 
        {
            for (let i = 0; i < numVertices; i++) 
            {
                for (let j = 0; j < numVertices; j++) 
                {
                    if (distance[i][j] > distance[i][k] + distance[k][j])
                        distance[i][j] = distance[i][k] + distance[k][j];
                }
            }
        }

        // Проверка на наличие подходящей вершины
        for (let i = 0; i < numVertices; i++) 
        {
            let allPathsValid = true;
            for (let j = 0; j < numVertices; j++) 
            {
                if (i !== j && distance[i][j] > N) 
                {
                    allPathsValid = false;
                    break;
                }
            }

            if (allPathsValid) return { vertex: vertices[i], distances: distance[i] };
        }

        return null; // Вершина не найдена
    }

    // Максимальный поток
    maxFlow(source, sink) 
    {
        const residualGraph = this.createResidualGraph();
        let maxFlow = 0;

        while (true)
        {
            const parent = this.bfs(residualGraph, source, sink);
            if (!parent) break; // Если нет увеличивающего пути, выходим из цикла

            // Находим минимальную пропускную способность по найденному пути
            let pathFlow = Infinity;
            for (let v = sink; v !== source; v = parent[v]) 
            {
                const u = parent[v];
                const edge = residualGraph[u].find(edge => edge.node === v);
                pathFlow = Math.min(pathFlow, edge.weight);
            }

            // Обновляем остаточный граф и общий поток
            for (let v = sink; v !== source; v = parent[v]) 
            {
                const u = parent[v];
                this.updateResidualGraph(residualGraph, u, v, pathFlow);
            }

            maxFlow += pathFlow;
        }

        return maxFlow;
    }

    createResidualGraph() 
    {
        const residualGraph = {};
        for (const u in this.adjacencyList) 
        {
            residualGraph[u] = [];
            for (const edge of this.adjacencyList[u]) 
            {
                residualGraph[u].push({ node: edge.node, weight: edge.weight });
            }
        }
        return residualGraph;
    }

    bfs(residualGraph, source, sink) 
    {
        const visited = {};
        const queue = [source];
        const parent = {};

        visited[source] = true;

        while (queue.length > 0) 
        {
            const u = queue.shift();

            for (const edge of residualGraph[u]) 
            {
                if (!visited[edge.node] && edge.weight > 0) // Остаточная пропускная способность положительна 
                { 
                    visited[edge.node] = true;
                    parent[edge.node] = u;

                    if (edge.node === sink) return parent; // Если достигли стока
                    queue.push(edge.node);
                }
            }
        }

        return null; // Если не нашли путь
    }

    updateResidualGraph(residualGraph, u, v, flow) 
    {
        // Уменьшаем остаточную пропускную способность
        const forwardEdge = residualGraph[u].find(edge => edge.node === v);
        forwardEdge.weight -= flow;

        // Добавляем обратное ребро
        let backwardEdge = residualGraph[v].find(edge => edge.node === u);
        if (backwardEdge) 
        {
            backwardEdge.weight += flow;
        } 
        else 
        {
            residualGraph[v].push({ node: u, weight: flow });
        }
    }
}

class MinPriorityQueue 
{
    constructor() 
    {
        this.elements = [];
    }

    enqueue(element, priority) 
    {
        this.elements.push({ element, priority });
        this.elements.sort((a, b) => a.priority - b.priority);
    }

    dequeue() 
    {
        return this.elements.shift();
    }

    isEmpty() 
    {
        return this.elements.length === 0;
    }
}

let graph;

// Открытие файла и загрузка графа
async function openFileAndLoadGraph() 
{
    rl.question('Введите путь к файлу графа: ', async (filePath) => 
    {
        try 
        {
            graph = await Graph.fromFile(filePath);
            console.log('Граф успешно загружен из файла:');
            console.log(graph.toString());
        } catch (error) {
            console.error('Ошибка при загрузке графа:', error.message);
        }

        handleUserInput();
    });
}

function isEmpty(vertex)
{
    const isEmp = vertex => vertex.trim() === '';
    return isEmp(vertex);
}

function isVertexInGraph(v)
{
    if (!graph.adjacencyList[v]) 
    {
        console.log(`Вершины ${v} не существует.`);
        handleUserInput();
        return false;
    }
    else return true;
}

function emptyElse()
{
    console.log(`Имя вершины не может быть пустое`);
    handleUserInput();
}

// Функция обработки пользовательского ввода
function handleUserInput() 
{
    showMenu();
    
    rl.question('---Введите номер действия: ', (choice) => 
    {
        switch (choice) 
        {
            case '0':
                graph.closeInput();
                break;

            case '1':
                rl.question('Введите имя вершины: ', (vertex) => 
                {
                    if (!isEmpty(vertex)) 
                    {
                        graph.addVertex(vertex);
                        handleUserInput();
                    }
                    else emptyElse();
                });
                break;

            case '2':
                rl.question('Введите исходную вершину: ', (edgeFrom) => 
                {
                    if (!isEmpty(edgeFrom))
                    { 
                        rl.question('Введите конечную вершину: ', (edgeTo) => 
                        {
                            if (!isEmpty(edgeTo))
                            {
                                if (graph.weighted)
                                {
                                    rl.question('Введите вес (по умолчанию 1): ', (weight) => 
                                    {
                                        if (!isEmpty(weight))
                                        {
                                            graph.addEdge(edgeFrom, edgeTo, weight ? parseInt(weight) : 1);
                                        }
                                        else console.log(`Имя вершины не может быть пустое`);
                                        handleUserInput();
                                    });
                                }
                                else
                                {
                                    graph.addEdge(edgeFrom, edgeTo);
                                    handleUserInput();
                                }
                            }
                            else emptyElse();
                        });
                    }
                    else emptyElse();
                });
                break;

            case '3':
                rl.question('Введите имя вершины для удаления: ', (vertex) => 
                {
                    if (!isEmpty(vertex))
                    {
                        graph.removeVertex(vertex);
                        handleUserInput();
                    }
                    else emptyElse();
                });
                break;

            case '4':
                rl.question('Введите исходную вершину: ', (edgeFrom) => 
                {
                    if (!isEmpty(edgeFrom))
                    {
                        rl.question('Введите конечную вершину: ', (edgeTo) => 
                        {
                            if (!isEmpty(edgeFrom))
                            {
                                graph.removeEdge(edgeFrom, edgeTo);
                                handleUserInput();
                            }
                            else emptyElse();
                        });
                    }
                    else emptyElse();
                });
                break;

            case '5':
                console.log(graph.toString());
                handleUserInput();
                break;

            case '6':
                const completeGraph = graph.createCompleteGraph(7, graph.directed, graph.weighted);
                graph = completeGraph;
                console.log('Тестовый граф успешно создан:');
                handleUserInput();
                break;

            case '7':
                openFileAndLoadGraph();
                break;

            case '8':
                graph.exportToFile('graph.txt');
                break;

            case '9':
                graph.exportToFileForVisual('graphVisual.txt');
                break;

            case '10':

                if (graph.hasVertices()) graph.directed = !graph.directed;
                else console.log('Невозмонжо выполнить! Граф не пустой');

                handleUserInput(); 
                break;

            case '11':                
                if (graph.hasVertices()) graph.weighted = !graph.weighted;
                else console.log('Невозмонжо выполнить! Граф не пустой');

                handleUserInput(); 
                break;

            case '12':
                graph.copy();
                console.log('Копия завершена.');
                handleUserInput(); 
                break;

            case '13':
                const isolatedVertices = graph.findIsolatedVertices();
                if (isolatedVertices.length > 0) 
                    console.log('Изолированные вершины:', isolatedVertices);
                else
                    console.log('Изолированных вершин нет');

                handleUserInput(); 
                break;
                
            case '14':
                rl.question('Введите имя вершины для поиска полустепени исхода: ', (vertex) => 
                {
                    if (!isEmpty(vertex))
                    {
                        const degree = graph.outDegree(vertex);
                        if (degree !== -1) 
                            console.log(`Полустепень исхода для вершины ${vertex}: ${degree}`);   
                        handleUserInput(); 

                    }
                    else emptyElse();
                });
                break;

            case '15':
                graph.getComplement();
                console.log("\nДополненный орграф:");
                console.log(graph.toString());
                handleUserInput(); 
                break;

            case '16':
                rl.question('Введите имя вершины ОТ которой нужно найти путь: ', (u1) => 
                {
                    if (!isEmpty(u1))
                    {
                        rl.question('Введите имя вершины ДО которой нужно найти путь: ', (u2) => 
                        {
                            if (!isEmpty(u2))
                            {
                                rl.question('Введите имя вершины через которую проходить нельзя: ', (v) => 
                                {
                                    if (!isEmpty(v))
                                    {
                                        const path = graph.findPath(u1, u2, v);
                                        if (path) console.log(`Путь от ${u1} до ${u2}, не проходя через ${v}: ${path.join(' -> ')}`);
                                        else console.log(`Нет пути от ${u1} до ${u2}, не проходя через ${v}.`);
                                        handleUserInput();
                                    }
                                    else emptyElse();
                                });
                            }
                            else emptyElse();
                        });
                    }
                    else emptyElse();
                });
                break;

            case '17':
                const scc = graph.findStronglyConnectedComponents();
                console.log("Сильно связные компоненты:", scc);
                handleUserInput();

                break;

            case '18':
                graph = graph.findMinimumSpanningTree();
                console.log("Минимальное остовное дерево: \n", graph.toString());

                handleUserInput();
                break;
        
            case '19':
                if (graph.hasVertices()) 
                {
                    console.log("Граф пустой!");
                    handleUserInput();
                }
                else
                {
                    rl.question('Введите имя вершины, с которой нужно начать: ', (v) => 
                    {
                        if (!isEmpty(v))
                        {
                            if (isVertexInGraph(v))
                            {
                                console.log(`Длины кратч. путей от ${v} до всех остальных вершин`);
                                const shortestPaths = graph.deikstra(v);
                                console.log(shortestPaths);
                                handleUserInput();
                            }
                        }
                        else emptyElse();
                    });
                }

                break;

            case '20':
                if (graph.hasVertices()) 
                {
                    console.log("Граф пустой!");
                    handleUserInput();
                }
                else
                {
                    rl.question('Введите имя вершины, с которой нужно начать: ', (v) => 
                    {
                        if (!isEmpty(v))
                        {
                            if (isVertexInGraph(v))
                            {
                                console.log(`Кратч. пути из вершины ${v} во все остальные вершины: `);
                                const result = graph.bellmanFord(v);
                                console.log(result.paths);

                                handleUserInput();
                            }
                        }
                        else emptyElse();
                    });
                }
                break;

            case '21':
                if (graph.hasVertices()) 
                {
                    console.log("Граф пустой!");
                    handleUserInput();
                }
                else
                {
                    rl.question('Введите число N: ', (N) => 
                    {
                        if (!isEmpty(N))
                        {
                            console.log(`Вершина, каждая из минимальных стоимостей пути от которой до остальных не превосходит ${N}: `);
                            const result = graph.floid(N);
                            if (result)
                            {
                                console.log(`Вершина: ${result.vertex}`);
                                console.log(`Расстояния от этой вершины:`, result.distances);
                            }
                            else console.log('Вершина не найдена');
                            handleUserInput();
                        }
                        else emptyElse();
                    });
                }
                break;
        
            case '22':
                rl.question('Введите исток: ', (v1) => 
                {
                    if (!isEmpty(v1))
                    {
                        rl.question('Введите сток: ', (v2) => 
                        {
                            if (!isEmpty(v2))
                            {
                                const maxFlowValue = graph.maxFlow(v1, v2);
                                console.log(`Максимальный поток в графе от ${v1} до ${v2}: ${maxFlowValue}`); // 10
                                handleUserInput();
                            }
                            else emptyElse();
                        });
                    }
                    else emptyElse();
                });
                break;
        
            default:
                console.log('Неверный выбор. Попробуйте снова.');
                handleUserInput();
                break;
        }
    });
}

function showMenu() 
{
    console.log('\n===================================');
    console.log(`Граф:  ${graph.isGraph()}`);
    console.log('===================================');
    console.log('Выберите действие:');
    console.log('1. Добавить вершину');
    console.log('2. Добавить ребро');
    console.log('3. Удалить вершину');
    console.log('4. Удалить ребро');
    console.log('5. Показать список смежности');
    console.log('6. Создать тестовый граф');
    console.log('7. Открыть файл и загрузить граф');
    console.log('8. Сохранить список смежности в файл');
    console.log('9. Сохранить список смежности в файл (визуал)');    
    console.log('10. Сменить ориентированность');
    console.log('11. Сменить взвешенность');
    console.log('12. Сделать копию');
    console.log('----- Задания -----');
    console.log('13. Изолированые вершины орграфа');
    console.log('14. Полустепень исхода орграфа');
    console.log('15. Орграф, являющийся дополнением');
    console.log('-------------------');
    console.log('16. Обход в глубину');
    console.log('17. Обход в ширину');
    console.log('-------------------');
    console.log('18. Минимальное остовное дерево (Краскал)');
    console.log('19. Длины кратч. путей от u до всех остальных вершин (Дейкстры)');
    console.log('20. Кратч. пути из вершины u во все остальные вершины (Беллмана-Форда)');
    console.log('21. Вершина, каждая из минимальных стоимостей пути от которой до остальных не превосходит N (Флойд)');
    console.log('22. Максимальный поток');
    console.log('-------------------');
    console.log('0. Выйти');
    console.log('==============================\n');
}


    if (require.main === module)
    {
        graph = new Graph(this.directed);
        handleUserInput();
    }

    module.exports = Graph;