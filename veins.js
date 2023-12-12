var form =  document.getElementById("Veins");
var timeoutId;

const CANVAS_SIZE = 272;
const CANVAS_RADIUS = CANVAS_SIZE / 2;

var TRIANGLE_SIDE_LENGTH = Number(form.elements.sizeValue.value);
var SHIFT = TRIANGLE_SIDE_LENGTH * 0.33;
var VEIN_NODE_COUNT = Number(form.elements.veinsValue.value);
var CAPILLARY_NODE_COUNT = Number(form.elements.capillariesValue.value);
var NEIGHBOR_DISTANCE_THRESHOLD = TRIANGLE_SIDE_LENGTH*2;

var nodes = [];
var veins = [];
var capillaries = [];
var paths = [];

// 1. Создаем четкую регулярную сетку
function createGrid() {
    for (let y = 0; y < CANVAS_SIZE; y += TRIANGLE_SIDE_LENGTH * Math.sqrt(3)) {
        for (let x = 0; x < CANVAS_SIZE; x += TRIANGLE_SIDE_LENGTH * 1.5) {
            nodes.push({ x, y });
            if (y + TRIANGLE_SIDE_LENGTH * Math.sqrt(3) / 2 < CANVAS_SIZE) {
                nodes.push({ x: x + TRIANGLE_SIDE_LENGTH * 0.75, y: y + TRIANGLE_SIDE_LENGTH * Math.sqrt(3) / 2 });
            }
        }
    }
}

// 2. Создаем пути между всеми узлами
function createPaths() {
    for (let i = 0; i < nodes.length - 1; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            let nodeA = nodes[i];
            let nodeB = nodes[j];
            const distance = Math.sqrt((nodeA.x - nodeB.x) ** 2 + (nodeA.y - nodeB.y) ** 2);
            if (Math.abs(distance - TRIANGLE_SIDE_LENGTH) < 2*SHIFT) {
                paths.push({ start: nodeA, end: nodeB });
            }  
        }
    }
}

// 3. Применяем SHIFT
function applyShift() {
    nodes.forEach(node => {
        node.x += (Math.random() - 0.5) * 2 * SHIFT;
        node.y += (Math.random() - 0.5) * 2 * SHIFT;
    });
}

// 4. Удаляем все точки и пути за пределами радиуса CANVAS_RADIUS
function filterNodesAndPaths() {
    const isInsideCircle = (point) => {
        return Math.sqrt((point.x - CANVAS_SIZE / 2) ** 2 + (point.y - CANVAS_SIZE / 2) ** 2) <= CANVAS_RADIUS;
    };

    nodes = nodes.filter(isInsideCircle);

    paths = paths.filter(path => {
        return isInsideCircle(path.start) && isInsideCircle(path.end);
    });
}

// Функция для перемешивания массива (алгоритм Фишера — Йетса)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Функция для выбора узлов вен и капилляров
function selectVeinsAndCapillaries() {
    let tempNodes = nodes.slice(); // Создаем копию массива nodes
    shuffleArray(tempNodes); // Перемешиваем массив

    veins = tempNodes.slice(0, VEIN_NODE_COUNT); // Берем первые VEIN_NODE_COUNT элементов как узлы вен
    capillaries = tempNodes.slice(VEIN_NODE_COUNT, VEIN_NODE_COUNT + CAPILLARY_NODE_COUNT); // Берем следующие CAPILLARY_NODE_COUNT элементов как узлы капилляров
}

const svg = document.getElementById('canvas');

var indi = document.createElementNS('http://www.w3.org/2000/svg',"text");
indi.setAttributeNS(null,"x", 200); // координаты угла
indi.setAttributeNS(null,"y", 10); 
indi.setAttributeNS(null,"font-size","11");
indi.setAttributeNS(null,"fill","white");
indi.setAttributeNS(null,"id", "indi"); // установить id
indi.textContent = "Start" // indi
svg.appendChild(indi); // добавить текст в SVG

createGrid();
indi.textContent = "Create grids" // indi
createPaths();
indi.textContent = "Create paths" // indi
applyShift();
indi.textContent = "Apply shift" // indi
filterNodesAndPaths();
indi.textContent = "Nodes:" + nodes.length;
selectVeinsAndCapillaries();

var veinsGroups = [];
for (let i = 0; i < veins.length; i++){
  veinsGroups.push(document.createElementNS('http://www.w3.org/2000/svg', 'g'));
  svg.appendChild(veinsGroups[i]);
}
`
paths.forEach(path => {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute('x1', path.start.x);
    line.setAttribute('y1', path.start.y);
    line.setAttribute('x2', path.end.x);
    line.setAttribute('y2', path.end.y);
    line.setAttribute('stroke', 'gray');
    line.setAttribute('stroke-width', '0.5');
    svg.appendChild(line);
});

nodes.forEach(node => {
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute('cx', node.x);
    circle.setAttribute('cy', node.y);
    circle.setAttribute('r', '1');
    circle.setAttribute('fill', 'gray');
    svg.appendChild(circle);
});

capillaries.forEach(capillarie => {
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute('cx', capillarie.x);
    circle.setAttribute('cy', capillarie.y);
    circle.setAttribute('r', '2');
    circle.setAttribute('fill', 'blue');
    svg.appendChild(circle);
});
`
////////////////
function findClosestNode(fromNode, possibleNodes) {
    let closestNode = null;
    let closestDistance = Infinity;

    possibleNodes.forEach(node => {
        const distance = Math.sqrt((fromNode.x - node.x) ** 2 + (fromNode.y - node.y) ** 2);
        if (distance < closestDistance) {
            closestNode = node;
            closestDistance = distance;
        }
    });

    return closestNode;
}

function findClosestVein(fromNode) {
    return findClosestNode(fromNode, veins);
}

refreshButton.addEventListener('click', function() {
  clearTimeout(timeoutId);
  svg.innerHTML = ''; // Очистка SVG

  TRIANGLE_SIDE_LENGTH = Number(form.elements.sizeValue.value);
  SHIFT = TRIANGLE_SIDE_LENGTH * 0.33;
  VEIN_NODE_COUNT = Number(form.elements.veinsValue.value);
  CAPILLARY_NODE_COUNT = Number(form.elements.capillariesValue.value);
  NEIGHBOR_DISTANCE_THRESHOLD = TRIANGLE_SIDE_LENGTH*2;

  nodes = [];
  veins = [];
  capillaries = [];
  paths = [];

  indi.setAttributeNS(null,"x", 200); // координаты угла
  indi.setAttributeNS(null,"y", 10); 
  indi.setAttributeNS(null,"font-size","11");
  indi.setAttributeNS(null,"fill","white");
  indi.setAttributeNS(null,"id", "indi"); // установить id
  indi.textContent = "Start..." // indi
  svg.appendChild(indi); // добавить текст в SVG

  createGrid();
  indi.textContent = "Create grids" // indi
  createPaths();
  indi.textContent = "Create paths" // indi
  applyShift();
  indi.textContent = "Apply shift" // indi
  filterNodesAndPaths();
  indi.textContent = "Nodes:" + nodes.length;
  selectVeinsAndCapillaries();

  veinsGroups = [];
  for (let i = 0; i < veins.length; i++){
    veinsGroups.push(document.createElementNS('http://www.w3.org/2000/svg', 'g'));
    svg.appendChild(veinsGroups[i]);
  }

  timeoutId = setTimeout(animateCapillaryMovement, 100);
});

function saverSVG() {
  svg.removeChild(indi);
  var dataURI =  'data:image/svg+xml,' + encodeURIComponent(svg.outerHTML.trim());
  window.parent.postMessage('app.open("' + dataURI + '", null, false)', '*');
  svg.appendChild(indi);
}
  
saveButton.addEventListener('click', saverSVG);

function animateCapillaryMovement() {
    // Обновляем позицию каждого капилляра
    capillaries = capillaries.map(capillary => {
        const connectedNodes = paths
            .filter(path => path.start === capillary || path.end === capillary)
            .map(path => path.start === capillary ? path.end : path.start)
            .filter(node => node !== capillary); // Убедимся, что капилляр не возвращается в предыдущую точку

        const targetVein = findClosestVein(capillary);
        let veinID = null;
        for (let i = 0; i < veins.length; i++){
          if (veins[i] == targetVein) {
            veinID = i;
            break;
          }
        }
        
        const nextNode = findClosestNode(targetVein, connectedNodes);

        // Визуализируем движение капилляра
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute('x1', capillary.x);
        line.setAttribute('y1', capillary.y);
        line.setAttribute('x2', nextNode.x);
        line.setAttribute('y2', nextNode.y);
        line.setAttribute('stroke', 'white');
        line.setAttribute('stroke-width', '0.2');
        veinsGroups[veinID].appendChild(line);

        return nextNode;
    });

    // Удаляем капилляры, которые достигли вен
    const targetVeins = capillaries.map(findClosestVein);
    capillaries = capillaries.filter((capillary, index) => {
        const distanceToVein = Math.sqrt((capillary.x - targetVeins[index].x) ** 2 + (capillary.y - targetVeins[index].y) ** 2);
        return distanceToVein > SHIFT;
    });

    indi.textContent = capillaries.length + "/" + CAPILLARY_NODE_COUNT;
  
    if (capillaries.length > 0) {        
        timeoutId = setTimeout(animateCapillaryMovement, 100); // задержка в 100 мс, можете изменить по желанию
    } else {
      indi.textContent = "Export..." // indi
      let dots = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      svg.appendChild(dots); 
      
      veins.forEach(vein => {        
          const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
          circle.setAttribute('cx', vein.x);
          circle.setAttribute('cy', vein.y);
          circle.setAttribute('r', '1');
          circle.setAttribute('fill', 'white');
          dots.appendChild(circle);        
      });
      
      saverSVG();
    }
}

// Запустить анимацию
timeoutId = setTimeout(animateCapillaryMovement, 100);
