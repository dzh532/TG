const fs = require('fs');
const readline = require('readline');


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
            // const edgeExists = this.adjacencyList[edgeFrom].some(vertex => vertex === edgeTo);
            if (!edgeExists)
            {
                if (this.weighted)
                {
                        this.adjacencyList[edgeFrom].push({ node: edgeTo, weight });
                    
                        if (!this.directed)
                            this.adjacencyList[edgeTo].push({ node: edgeFrom, weight });

                        console.log(`Ребро от ${edgeFrom} до ${edgeTo} с весом ${weight} добавлено.`);
                }
                else
                {
                    this.adjacencyList[edgeFrom].push({ node: edgeTo});
                
                    if (!this.directed)
                        this.adjacencyList[edgeTo].push({ node: edgeFrom});

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
            if (this.adjacencyList[edgeFrom])
                this.adjacencyList[edgeFrom] = this.adjacencyList[edgeFrom].filter(edge => edge.node !== edgeTo);
            
            if (!this.directed && this.adjacencyList[edgeTo])
                this.adjacencyList[edgeTo] = this.adjacencyList[edgeTo].filter(edge => edge.node !== edgeFrom);

            console.log(`Ребро от ${edgeFrom} до ${edgeTo} удалено.`);
        }
    }

    // Вывод списка смежности
    toString() 
    {
        let result = '';
        if (this.weighted)
        {
            for (const vertex in this.adjacencyList)
                result += `${vertex} -> ${this.adjacencyList[vertex].map(edge => `${edge.node} (w: ${edge.weight})`).join(', ')}\n`;
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

    findIsolatedVertices()
    {
        const isolatedVertices = [];
        
        for (const vertex in this.adjacencyList)
            if (this.adjacencyList[vertex].length === 0)
                isolatedVertices.push(vertex);

        return isolatedVertices;
    }

    outDegree(vertex) 
    {
        if (!this.adjacencyList[vertex])
            return 0;
        return this.adjacencyList[vertex].length;
    }

    openFileFromFile()
    {
        openFileAndLoadGraph();
    }

    closeInput() 
    {
        rl.close();
    }

    getComplement() {
        const complementGraph = new Graph();
        const vertices = Object.keys(this.adjacencyList);

        for (const vertex of vertices) {
            complementGraph.adjacencyList[vertex] = [];
        }

        for (let i = 0; i < vertices.length; i++) {
            for (let j = 0; j < vertices.length; j++) {
                const vertex1 = vertices[i];
                const vertex2 = vertices[j];

                if (vertex1 !== vertex2 && !this.adjacencyList[vertex1].includes(vertex2)) {
                    complementGraph.addEdge(vertex1, vertex2);
                }
            }
        }

        return complementGraph;
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
                const completeGraph = graph.createCompleteGraph(7, false, true);
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
                graph.closeInput();
                break;

            default:
                console.log('Неверный выбор. Попробуйте снова.');
                handleUserInput();
                break;
        }
    });
}

// Функция для отображения меню
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
    console.log('13. Выйти');
    console.log('==============================\n');
}


    if (require.main === module)
    {
        graph = new Graph(this.directed);
        handleUserInput();
    }

    module.exports = Graph;