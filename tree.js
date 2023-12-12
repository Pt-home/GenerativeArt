var form =  document.getElementById("Tree");

const NMAX = 2 * 1e7; 
const SIZE = 272;
const ONE = 1. / SIZE;

var RAD = Number(form.elements.branchValue.value) * ONE; //////////////////////////////////////
var ZONEWIDTH = 2. * (RAD / ONE);
var SCALE = Number(form.elements.scaleValue.value);////////////////////////////////////////////////
var ANGLE_SCALE = Number(form.elements.angleScaleValue.value);//////////////////////////////////////////
var ANGLE_VARIATIONS = 2 * Math.PI * ANGLE_SCALE;
var MAX_ATTEMPTS = Number(form.elements.maxAttemptsValue.value);/////////////////////////////////////
var CIRCLE_START_RAD = Number(form.elements.startRadiusValue.value);/////////////////////////////////////////  
var LINES = Number(form.elements.barkValue.value);

const CIRCLE_RADIUS = 0.95;

const LAYER_COUNT = 6;
const LAYER_HEIGHT = 1 / LAYER_COUNT;

const MIN_ANGLE = [
    -180 * (Math.PI / 180),
    -160 * (Math.PI / 180),
    -140 * (Math.PI / 180),
    -120 * (Math.PI / 180),
    -110 * (Math.PI / 180),
    -100 * (Math.PI / 180)
];

const MAX_ANGLE = [
    0 * (Math.PI / 180),
    -20 * (Math.PI / 180),
    -40 * (Math.PI / 180),
    -60 * (Math.PI / 180),
    -70 * (Math.PI / 180),
    -80 * (Math.PI / 180) 
];

const X_MIN = 0. + 10. * ONE; 
const Y_MIN = 0. + 10. * ONE;
const X_MAX = 1. - 10. * ONE;
const Y_MAX = 1. - 10. * ONE;

const svgElement = document.getElementById('canvas');
var branchesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
svgElement.appendChild(branchesGroup);
var indi = document.createElementNS('http://www.w3.org/2000/svg',"text");
indi.setAttributeNS(null,"x", 210); // координаты угла
indi.setAttributeNS(null,"y", 10); 
indi.setAttributeNS(null,"font-size","11");
indi.setAttributeNS(null,"fill","black");
indi.setAttributeNS(null,"id", "indi"); // установить id
indi.textContent = "1/1" // indi
svgElement.appendChild(indi); // добавить текст в SVG

class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    multiply(scalar) {
        return new Vector(this.x * scalar, this.y * scalar);
    }

    add(vector) {
        return new Vector(this.x + vector.x, this.y + vector.y);
    }

    subtract(vector) {
        return new Vector(this.x - vector.x, this.y - vector.y);
    }

    lengthSquared() {
        return this.x * this.x + this.y * this.y;
    }
}

function Node(position, direction, generation, status) {
    this.position = position;    
    this.direction = direction;  
    this.generation = generation;
    this.status = status;        
    this.attempts = 0;
}

let sourceNodes = [];
let evolutionNodes = [];

function initializeSourceNode() {
    sourceNodes = []; 
    evolutionNodes = []; 
    
    let position = new Vector(0, CIRCLE_RADIUS * 0.95); 
    let direction = -Math.PI / 2; // Направление вверх
    
    let root = new Node(position, direction, 0, true);
    
    sourceNodes.push(root); 
    evolutionNodes.push(root);
}

function resetSVGElements() {
    svgElement.innerHTML = '';
    branchesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    svgElement.appendChild(branchesGroup);
    indi.textContent = "1/1" // indi
    svgElement.appendChild(indi); // добавить текст в SVG
}

initializeSourceNode();

function drawLines(node1, node2) {
    let svgNS = "http://www.w3.org/2000/svg"; 

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

    let lineWidth = 2 * CIRCLE_START_RAD * Math.pow(SCALE, node2.generation); 
    let gray = node1.generation;
    var strokeColor = 'rgb(' + gray + ',' + gray + ',' + gray + ')'; 
  
    line.setAttributeNS(null, 'stroke-width', lineWidth * (1 + 1/(LINES+1))); 
    line.setAttributeNS(null, 'stroke-linecap', 'round'); 
    line.setAttributeNS(null, 'stroke', strokeColor); 
    
  
    branchesGroup.appendChild(line);   
    
    var strokeColor = 'rgb(' + (100+gray) + ',' + (100+gray) + ',' + (100+gray) + ')'; 

    let dx = scaledX2 - scaledX1;
    let dy = scaledY2 - scaledY1;
    let normalX = -dy; // нормаль к линии
    let normalY = dx;
    let halfLineWidth = lineWidth / 2;

    let lineOffset = lineWidth / (LINES - 1); 

    for(let i = 0; i < LINES; i++) {
        let line = document.createElementNS(svgNS, 'line'); 

        // параллельный перенос
        let offset = lineOffset * (i - (LINES - 1) / 2);
        let offsetX = normalX * offset / Math.sqrt(normalX * normalX + normalY * normalY);
        let offsetY = normalY * offset / Math.sqrt(normalX * normalX + normalY * normalY);

        // Рассчитываем корректировку для "выпуклого" эффекта
        let distanceFromCenter = Math.abs(i - (LINES - 1) / 2) * lineOffset;
        let extraOffset = Math.sqrt(halfLineWidth * halfLineWidth - distanceFromCenter * distanceFromCenter) ;

        line.setAttributeNS(null, 'x1', scaledX1 + offsetX - dx * extraOffset / Math.sqrt(dx * dx + dy * dy));
        line.setAttributeNS(null, 'y1', scaledY1 + offsetY - dy * extraOffset / Math.sqrt(dx * dx + dy * dy));
        line.setAttributeNS(null, 'x2', scaledX2 + offsetX + dx * extraOffset / Math.sqrt(dx * dx + dy * dy));
        line.setAttributeNS(null, 'y2', scaledY2 + offsetY + dy * extraOffset / Math.sqrt(dx * dx + dy * dy));

        // Вычисление длины линии
        let lineLength = Math.sqrt(dx * dx + dy * dy);
        
        // Настройка пунктирных отрезков
        let desiredDashesLength = lineLength * 0.5; // желаемая длина пунктиров
        let accumulatedDashesLength = 0;
        let dashArray = [];
        
        while (accumulatedDashesLength < desiredDashesLength) {
            let randomDash = Math.random() * lineLength * 0.1; // длина отрезка
            let randomGap = Math.random() * lineLength * 0.1; // длина промежутка
        
            if (accumulatedDashesLength + randomDash > desiredDashesLength) {
                randomDash = desiredDashesLength - accumulatedDashesLength;
            }
        
            dashArray.push(randomDash);
            dashArray.push(randomGap);
        
            accumulatedDashesLength += randomDash;
        }
        
        let dashArrayStr = dashArray.join(',');
        line.setAttributeNS(null, 'stroke-dasharray', dashArrayStr);
        line.setAttributeNS(null, 'stroke-width', lineWidth/(LINES+1)); 
        line.setAttributeNS(null, 'stroke', strokeColor); 
        //console.log(lineWidth, LINES+1, lineWidth/(LINES+1));
        branchesGroup.appendChild(line); 
    }
}

function isValidNode(newNode) {
    if (newNode.position.x * newNode.position.x + newNode.position.y * newNode.position.y >= CIRCLE_RADIUS * CIRCLE_RADIUS) {
        return false;
    }
    
    for (let node of sourceNodes) {
        let diff = node.position.subtract(newNode.position);
        if (diff.lengthSquared() < RAD * RAD) {
            return false;
        }
    }
    
    return true;
}

let timeoutId = null; 
let currentIndex = 0; 
const stopButton = document.getElementById('stopButton');
const continueButton = document.getElementById('continueButton');
const refreshButton = document.getElementById('refreshButton');
const saveButton = document.getElementById('saveButton');

stopButton.addEventListener('click', function() {
  clearTimeout(timeoutId);
});

continueButton.addEventListener('click', function() {
  mainLoop(currentIndex);
});

refreshButton.addEventListener('click', function() {
  clearTimeout(timeoutId);
  resetSVGElements(); 

  RAD = Number(form.elements.branchValue.value) * ONE; //////////////////////////////////////
  ZONEWIDTH = 2. * (RAD / ONE);
  SCALE = Number(form.elements.scaleValue.value);////////////////////////////////////////////////
  ANGLE_SCALE = Number(form.elements.angleScaleValue.value);//////////////////////////////////////////
  ANGLE_VARIATIONS = 2 * Math.PI * ANGLE_SCALE;
  MAX_ATTEMPTS = Number(form.elements.maxAttemptsValue.value);/////////////////////////////////////
  CIRCLE_START_RAD = Number(form.elements.startRadiusValue.value);/////////////////////////////////////////  
  LINES = Number(form.elements.barkValue.value); 
  
  initializeSourceNode(); 
  currentIndex = 0; 
  mainLoop(currentIndex); 
});

function saverSVG() {
  svgElement.removeChild(indi);
  var dataURI =  'data:image/svg+xml,' + encodeURIComponent(svgElement.outerHTML.trim());
  window.parent.postMessage('app.open("' + dataURI + '", null, false)', '*');
  svgElement.appendChild(indi);
}

// Функция для сохранения SVG в файл
saveButton.addEventListener('click', saverSVG);

function getLayer(y) {
    for (let i = 0; i < LAYER_COUNT; i++) {
        if (y <= LAYER_HEIGHT * (i + 1)) {
            return i;
        }
    }
    return LAYER_COUNT - 1; // на случай округления ошибок, возвращаем последнюю зону
}


function mainLoop(i) {
    if (i >= NMAX || evolutionNodes.length === 0) {
        if (evolutionNodes.length === 0) {
            console.log("Stop process! Nodes:", sourceNodes.length);
        }
        return;
    }
    currentIndex = i;

    let randomNodeIndex = Math.floor(Math.random() * evolutionNodes.length);
    let randomNode = evolutionNodes[randomNodeIndex];

    let angle = randomNode.direction + ANGLE_VARIATIONS * 0.5 - Math.random() * ANGLE_VARIATIONS;

    let layer = getLayer(randomNode.position.y);

    // Если угол выходит за пределы желаемого диапазона для этой зоны, переходим к следующей итерации
    if (angle < MIN_ANGLE[layer] || angle > MAX_ANGLE[layer]) {
        timeoutId = setTimeout(mainLoop, 0, i + 1);
        return;
    }

    let newX = randomNode.position.x + RAD *  Math.cos(angle);
    let newY = randomNode.position.y + RAD *  Math.sin(angle);

    let newNode = new Node(new Vector(newX, newY), angle, randomNode.generation + 1, randomNode.group, true);

    if (isValidNode(newNode)) {
        sourceNodes.push(newNode);
        evolutionNodes.push(newNode);
        drawLines(randomNode, newNode);
    } else {
        randomNode.attempts += 1;
        if (randomNode.attempts == MAX_ATTEMPTS){
            evolutionNodes.splice(randomNodeIndex, 1);
            console.log(evolutionNodes.length, sourceNodes.length);
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


mainLoop(0);