const svg = document.getElementById('canvas');
const svgNS = svg.namespaceURI;
var form =  document.getElementById("DL");

const nodes = [];
var initialNodesCount = Number(form.elements.initialNodesCountValue.value);
var attractionForce = Number(form.elements.attractionForceValue.value); 
var repulsionForce = Number(form.elements.repulsionForceValue.value);
var attractionCoef = Number(form.elements.attractionCoefValue.value);
var repulsionCoef = Number(form.elements.repulsionCoefValue.value);
var stop = false;
var scaleFromNow = false;
var adjustNodesInterval = null;
var addNodeInterval = null;

function Node(x, y) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
}

function addNodeBetween(node1, node2) {
    const midX = (node1.x + node2.x) / 2;
    const midY = (node1.y + node2.y) / 2;
    const newNode = new Node(midX, midY);
    const index1 = nodes.indexOf(node1);
    const index2 = nodes.indexOf(node2);

    if (Math.abs(index1 - index2) > 1) {
        nodes.push(newNode);
    } else {
        nodes.splice(Math.max(index1, index2), 0, newNode);
    }
}

function initializeNodes() {
    for(let i = 0; i < initialNodesCount; i++) {
        const angle = (Math.PI * 2) / initialNodesCount * i;
        nodes.push(new Node(136 + 25 * Math.cos(angle), 136 + 25 * Math.sin(angle)));
    }
}

function adjustNodes() {
    if(stop) return;
    const forces = [];
    nodes.forEach((node, index) => {
        const prevNode = nodes[index === 0 ? nodes.length - 1 : index - 1];
        const nextNode = nodes[index === nodes.length - 1 ? 0 : index + 1];
        const dx1 = node.x - prevNode.x;
        const dy1 = node.y - prevNode.y;
        const dx2 = node.x - nextNode.x;
        const dy2 = node.y - nextNode.y;
        const forceX = -(dx1 + dx2);
        const forceY = -(dy1 + dy2);

        let repulsionX = 0;
        let repulsionY = 0;
        nodes.forEach((otherNode, otherIndex) => {
            if (otherIndex !== index && otherIndex !== index - 1 && otherIndex !== (index + 1) % nodes.length) {
                const dx = node.x - otherNode.x;
                const dy = node.y - otherNode.y;
                const distanceSquared = dx * dx + dy * dy;
                const force = repulsionForce / distanceSquared;
                repulsionX += force * dx;
                repulsionY += force * dy;
            }
        });

        forces.push({x: forceX * attractionCoef + repulsionX * repulsionCoef, y: forceY * attractionCoef + repulsionY * repulsionCoef});
    });

    forces.forEach((force, index) => {
        nodes[index].vx += force.x * attractionForce;
        nodes[index].vy += force.y * attractionForce;
    });

    nodes.forEach(node => {
        node.x += node.vx;
        node.y += node.vy;
        node.vx *= 0.5;
        node.vy *= 0.5;
    });

    if  (scaleFromNow == false){
      for (let node of nodes) {
          if (node.x <= 0.05*svg.width.baseVal.value || node.y <= 0.05*svg.height.baseVal.value || node.x >= 0.95*svg.width.baseVal.value || node.y >= 0.95*svg.height.baseVal.value) {
              scaleFromNow = true;
              break;
          }
      }
    }
  
    if (scaleFromNow) {
        const bounds = getBounds(nodes);
        const scaleX = svg.width.baseVal.value / (bounds.maxX - bounds.minX);
        const scaleY = svg.height.baseVal.value / (bounds.maxY - bounds.minY);
        const scale = Math.min(scaleX, scaleY) * 0.9;
        const centerX = (bounds.minX + bounds.maxX) / 2;
        const centerY = (bounds.minY + bounds.maxY) / 2;
        nodes.forEach(node => {
            node.x = svg.width.baseVal.value / 2 + (node.x - centerX) * scale;
            node.y = svg.height.baseVal.value / 2 + (node.y - centerY) * scale;
            node.vx *= scale;
            node.vy *= scale;
        });
    }
}

function getBounds(nodes) {
    let minX = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;
    nodes.forEach(node => {
        minX = Math.min(minX, node.x);
        maxX = Math.max(maxX, node.x);
        minY = Math.min(minY, node.y);
        maxY = Math.max(maxY, node.y);
    });
    return {minX, maxX, minY, maxY};
}

function draw() {
    while (svg.lastChild) {
        svg.removeChild(svg.lastChild);
    }

    const poly = document.createElementNS(svgNS, 'polygon');
    poly.setAttribute('points', nodes.map(node => `${node.x},${node.y}`).join(' '));
    poly.setAttribute('fill', 'none');
    poly.setAttribute('stroke', 'white');
    svg.appendChild(poly);
}

function stopNodes() {
    stop = true;
    if (adjustNodesInterval) {
        clearInterval(adjustNodesInterval);
        adjustNodesInterval = null;
    }
    if (addNodeInterval) {
        clearInterval(addNodeInterval);
        addNodeInterval = null;
    }
}

function continueNodes() {
    if (stop && !adjustNodesInterval && !addNodeInterval) {
        stop = false;
        adjustNodesInterval = setInterval(() => {
            adjustNodes();
            draw();
        }, 100);
        addNodeInterval = setInterval(() => {
            const randomIndex = Math.floor(Math.random() * nodes.length);
            addNodeBetween(nodes[randomIndex], nodes[(randomIndex + 1) % nodes.length]);
        }, 100);
    }
}

function startNodes() {
    stop = false;
    initializeNodes();
    adjustNodesInterval = setInterval(() => {
        adjustNodes();
        draw();
    }, 100);
    addNodeInterval = setInterval(() => {
        const randomIndex = Math.floor(Math.random() * nodes.length);
        addNodeBetween(nodes[randomIndex], nodes[(randomIndex + 1) % nodes.length]);
    }, 100);
}

function refreshNodes() {    
    stopNodes();
    scaleFromNow = false;
    while (svg.lastChild) {
        svg.removeChild(svg.lastChild);
    }
  
    nodes.length = 0;  
    initialNodesCount = Number(form.elements.initialNodesCountValue.value);
    attractionForce = Number(form.elements.attractionForceValue.value); 
    repulsionForce = Number(form.elements.repulsionForceValue.value);
    attractionCoef = Number(form.elements.attractionCoefValue.value);
    repulsionCoef = Number(form.elements.repulsionCoefValue.value);
    
    startNodes();
}

startNodes();

document.getElementById('stopButton').addEventListener('click', stopNodes);
document.getElementById('refreshButton').addEventListener('click', refreshNodes);
document.getElementById('continueButton').addEventListener('click', continueNodes);

document.getElementById('saveButton').addEventListener('click', () => {
    var dataURI =  'data:image/svg+xml,' + encodeURIComponent(svg.outerHTML.trim());
    window.parent.postMessage('app.open("' + dataURI + '", null, false)', '*');
});