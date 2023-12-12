var form =  document.getElementById("Hyphae");


// Установка параметров
const NMAX = 2 * 1e7; // максимальное количество узлов
const SIZE = 272;
const ONE = 1. / SIZE;

var RAD = Number(form.elements.branchValue.value) * ONE; //////////////////////////////////////
var ZONEWIDTH = 2. * (RAD / ONE);
var SOURCE_NUM = Number(form.elements.sourcesValue.value);//////////////////////////////////////////////
var SCALE = Number(form.elements.scaleValue.value);////////////////////////////////////////////////
var ANGLE_SCALE = Number(form.elements.angleScaleValue.value);//////////////////////////////////////////
var ANGLE_VARIATIONS = 2 * Math.PI * ANGLE_SCALE;
var MAX_ATTEMPTS = Number(form.elements.maxAttemptsValue.value);/////////////////////////////////////
var CIRCLE_START_RAD = Number(form.elements.startRadiusValue.value);/////////////////////////////////////////

const CIRCLE_RADIUS = 0.98;

const X_MIN = 0. + 10. * ONE; // границы
const Y_MIN = 0. + 10. * ONE;
const X_MAX = 1. - 10. * ONE;
const Y_MAX = 1. - 10. * ONE;

// Инициализация массивов для хранения информации об узлах
let nodesX = []; // массив для хранения X-координат узлов
let nodesY = []; // массив для хранения Y-координат узлов
let nodesR = []; // массив для хранения радиусов узлов
let nodesThe = []; // массив для хранения углов узлов
let nodesGe = []; // массив для хранения поколений узлов

// Получаем наш SVG элемент, чтобы мы могли добавить в него узлы
const svgElement = document.getElementById('canvas');
var svgNS = "http://www.w3.org/2000/svg";   // Определение пространства имен SVG

var indi = document.createElementNS(svgNS,"text");
indi.setAttributeNS(null,"x", 210); // координаты угла
indi.setAttributeNS(null,"y", 10); 
indi.setAttributeNS(null,"font-size","11");
indi.setAttributeNS(null,"fill","black");
indi.setAttributeNS(null,"id", "indi"); // установить id
indi.textContent = SOURCE_NUM + "/" + SOURCE_NUM // indi
svgElement.appendChild(indi); // добавить текст в SVG

// Создаем группы 
var branchGroups  = [];
for(let i = 0; i < SOURCE_NUM; i++) {
   branchGroups.push(document.createElementNS('http://www.w3.org/2000/svg', 'g'));
   svgElement.appendChild(branchGroups[i]);
}

// Класс Vector для представления двухмерных векторов
class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    // Функция для умножения вектора на скаляр
    multiply(scalar) {
        return new Vector(this.x * scalar, this.y * scalar);
    }

    // Функция для сложения двух векторов
    add(vector) {
        return new Vector(this.x + vector.x, this.y + vector.y);
    }
}

// Объект Node
function Node(position, direction, generation, group, status) {
    this.position = position;    // position is a Vector
    this.direction = direction;  // direction is a constant
    this.generation = generation;
    this.group = group;
    this.attempts = 0;
    this.status = status;        // status is a boolean
}

// Создание источниковых узлов
let sourceNodes = [];
let evolutionNodes = [];
for(let i = 0; i < SOURCE_NUM; i++) {
    //let angle = Math.random() * 2 * Math.PI;  // случайный угол
    let angle = i * 2 * Math.PI / SOURCE_NUM;
    let radius = 0.5 * CIRCLE_RADIUS * Math.sqrt(Math.random()); // 
    
    // координаты узла
    let x = radius * Math.cos(angle);
    let y = radius * Math.sin(angle);
    
    let position = new Vector(x, y); // создание вектора позиции
    let child =  new Node(position, angle, 0, i, true)
    sourceNodes.push(child); // в список
    evolutionNodes.push(child); // в список
}

// Функция визуализации узла
function visualizeNode(node) {
    
    let circle = document.createElementNS(svgNS, 'circle');  // Создание элемента SVG "circle"

    // Преобразование координат узла к масштабу визуализации
    let scaledX = (node.position.x + 1) * SIZE * 0.5;
    let scaledY = (node.position.y + 1) * SIZE * 0.5;

    // Установка атрибутов SVG элемента
    circle.setAttributeNS(null, 'cx', scaledX);
    circle.setAttributeNS(null, 'cy', scaledY);
    circle.setAttributeNS(null, 'r', CIRCLE_START_RAD * Math.pow(SCALE, node.generation) ); // Размер узла
    var gray = node.generation;   // Зеленый компонент (от 0 до 255)
    if (gray > 255) {
      gray = 255;
    }
    circle.setAttributeNS(null, 'fill', 'rgb(' + gray + ',' + gray + ',' + gray + ')'); // Цвет узла

    branchGroups[node.group].appendChild(circle); // Добавление элемента SVG в SVG-группу для окружностей
}

// Проверка наличия данных об узлах
//console.log(`Source nodes data: ${JSON.stringify(sourceNodes)}`); // Лог данных об узлах

// Визуализация узлов
sourceNodes.forEach(node => {
    visualizeNode(node);
});

// Функция для рисования линии между двумя узлами
function drawLine(node1, node2) {
    
    let line = document.createElementNS(svgNS, 'line'); // Создание элемента SVG "line"

    // Преобразование координат узла к масштабу визуализации
    let scaledX1 = (node1.position.x + 1) * SIZE * 0.5;
    let scaledY1 = (node1.position.y + 1) * SIZE * 0.5;
    let scaledX2 = (node2.position.x + 1) * SIZE * 0.5;
    let scaledY2 = (node2.position.y + 1) * SIZE * 0.5;

    // Установка атрибутов SVG элемента
    line.setAttributeNS(null, 'x1', scaledX1);
    line.setAttributeNS(null, 'y1', scaledY1);
    line.setAttributeNS(null, 'x2', scaledX2);
    line.setAttributeNS(null, 'y2', scaledY2);
    
    line.setAttributeNS(null, 'stroke-width', 2 * CIRCLE_START_RAD * Math.pow(SCALE, node2.generation)); 
    var gray = node1.generation;   // Зеленый компонент (от 0 до 255)
    if (gray > 255) {
      gray = 255;
    }
    line.setAttributeNS(null, 'stroke', 'rgb(' + gray + ',' + gray + ',' + gray + ')'); // Цвет линии

    branchGroups[node1.group].appendChild(line); // Добавление элемента SVG в SVG-группу для линий
}

// Проверка, является ли новый узел допустимым
function isValidNode(newNode) {
    // Если узел выходит за границы заданного круга, он считается недопустимым
    if (newNode.position.x * newNode.position.x + newNode.position.y * newNode.position.y >= CIRCLE_RADIUS * CIRCLE_RADIUS) {
        return false;
    }
    
    // Проверка пересечения с существующими узлами
    for (let node of sourceNodes) {
        let dx = node.position.x - newNode.position.x;
        let dy = node.position.y - newNode.position.y;

        if (dx * dx + dy * dy < RAD * RAD) {
            return false;
        }
    }

    return true;
}

let timeoutId = null; // Идентификатор для управления таймером
let currentIndex = 0; // Текущий индекс для управления итерацией
const stopButton = document.getElementById('stopButton');
const continueButton = document.getElementById('continueButton');
const refreshButton = document.getElementById('refreshButton');
const saveButton = document.getElementById('saveButton');

// Функция для остановки выполнения
stopButton.addEventListener('click', function() {
  clearTimeout(timeoutId);
});

// Функция для продолжения выполнения
continueButton.addEventListener('click', function() {
  mainLoop(currentIndex);
});

refreshButton.addEventListener('click', function() {
  clearTimeout(timeoutId);
  svgElement.innerHTML = ''; // Очистка SVG
  
  sourceNodes = []; // Очистка узлов
  evolutionNodes = []; // Очистка узлов
  currentIndex = 0; // Сброс текущего индекса

  RAD = Number(form.elements.branchValue.value) * ONE; //////////////////////////////////////
  ZONEWIDTH = 2. * (RAD / ONE);
  SOURCE_NUM = Number(form.elements.sourcesValue.value);//////////////////////////////////////////////
  SCALE = Number(form.elements.scaleValue.value);////////////////////////////////////////////////
  ANGLE_SCALE = Number(form.elements.angleScaleValue.value);//////////////////////////////////////////
  ANGLE_VARIATIONS = 2 * Math.PI * ANGLE_SCALE;
  MAX_ATTEMPTS = Number(form.elements.maxAttemptsValue.value);/////////////////////////////////////
  CIRCLE_START_RAD = Number(form.elements.startRadiusValue.value);/////////////////////////////////////////

  indi.textContent = SOURCE_NUM + "/" + SOURCE_NUM // indi
  svgElement.appendChild(indi); // добавить текст в SVG

  // Создаем группы 
  branchGroups  = [];
  for(let i = 0; i < SOURCE_NUM; i++) {
     branchGroups.push(document.createElementNS('http://www.w3.org/2000/svg', 'g'));
     svgElement.appendChild(branchGroups[i]);
  }

  // Создание источниковых узлов
  for(let i = 0; i < SOURCE_NUM; i++) {
      //let angle = Math.random() * 2 * Math.PI;  // случайный угол
      let angle = i * 2 * Math.PI / SOURCE_NUM;
      let radius = 0.5 * CIRCLE_RADIUS * Math.sqrt(Math.random()); // радиус внутри круга
      
      // координаты узла
      let x = radius * Math.cos(angle);
      let y = radius * Math.sin(angle);
      
      let position = new Vector(x, y); // создание вектора позиции
      let child =  new Node(position, angle, 0, i, true)
      sourceNodes.push(child); // в список
      evolutionNodes.push(child); // в список
  }

  // Визуализация источниковых узлов
  sourceNodes.forEach(node => {
      visualizeNode(node);
  });

  mainLoop(currentIndex); // Перезапуск
});

 function saverSVG() {
  svgElement.removeChild(indi);
  var dataURI =  'data:image/svg+xml,' + encodeURIComponent(svgElement.outerHTML.trim());
  window.parent.postMessage('app.open("' + dataURI + '", null, false)', '*');
  svgElement.appendChild(indi);
}
// Функция для сохранения SVG в файл
saveButton.addEventListener('click', saverSVG);


// Основной цикл алгоритма
function mainLoop(i) {
    if (i >= NMAX) return;
    currentIndex = i; // Обновление текущего индекса
  
    // Выбор случайного узла
    let randomNodeIndex = Math.floor(Math.random() * evolutionNodes.length);
    let randomNode = evolutionNodes[randomNodeIndex];

    // Создание нового узла путем проецирования из текущего узла
    let angle = randomNode.direction + ANGLE_VARIATIONS * 0.5 - Math.random() * ANGLE_VARIATIONS;
    let newX = randomNode.position.x + RAD * Math.cos(angle);
    let newY = randomNode.position.y + RAD * Math.sin(angle);
    let newNode = new Node(new Vector(newX, newY), angle, randomNode.generation + 1, randomNode.group, true);

    // Проверка и добавление нового узла
    if (isValidNode(newNode)) {
        sourceNodes.push(newNode);
        evolutionNodes.push(newNode);
        visualizeNode(newNode);

        // Визуализация линии между узлами
        drawLine(randomNode, newNode);
    } else {
        randomNode.attempts += 1;
        if (randomNode.attempts == MAX_ATTEMPTS){
          evolutionNodes.splice(randomNodeIndex, 1);
          //console.log(evolutionNodes.length, sourceNodes.length);
        }
    indi.textContent = evolutionNodes.length + "/" + sourceNodes.length; // indi
    
    }

    // Планируем следующую итерацию через 1 мс
    if (evolutionNodes.length != 0) {
      timeoutId = setTimeout(mainLoop, 0, i + 1);
    } else {
      indi.textContent = "Nodes:" + sourceNodes.length;
      saverSVG();
    }
}

// Начало основного цикла
mainLoop(currentIndex);
