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
        if (this.directed)
        {
            if (this.weighted) return "ориентированный | взвешенный";
            else return "ориентированный | НЕвзвешенный";
        }
        else 
        {
            if (this.weighted) return "НЕориентированный | взвешенный";
            else return "НЕориентированный | НЕвзвешенный";
        }
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

        return mstEdges;
    }

    dijkstra(start) {
        const distances = {};
        const priorityQueue = new MinPriorityQueue();

        // Инициализация расстояний до всех вершин
        for (let vertex in this.adjacencyList) {
            distances[vertex] = Infinity; // Устанавливаем начальные расстояния как бесконечность
        }
        distances[start] = 0; // Расстояние до стартовой вершины равно 0

        priorityQueue.enqueue(start, 0); // Добавляем стартовую вершину в очередь с приоритетом 0

        while (!priorityQueue.isEmpty()) {
            const currentVertex = priorityQueue.dequeue().element;

            for (let neighbor of this.adjacencyList[currentVertex]) {
                const distance = distances[currentVertex] + neighbor.weight;

                // Если найдено более короткое расстояние до соседней вершины
                if (distance < distances[neighbor.node]) {
                    distances[neighbor.node] = distance; // Обновляем расстояние
                    priorityQueue.enqueue(neighbor.node, distance); // Добавляем в очередь с новым приоритетом
                }
            }
        }

        return distances;
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
                const mst = graph.findMinimumSpanningTree();
                console.log("Минимальное остовное дерево:", mst);

                handleUserInput();
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