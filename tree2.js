var form =  document.getElementById("Tree2");

const canvas = document.getElementById("canvas");
const refreshButton = document.getElementById('refreshButton');
const saveButton = document.getElementById('saveButton');

const SIZE = 272;

// Настройки дерева
var settings = {
    root_r: Number(form.elements.startRadiusValue.value),
    stepsize: Number(form.elements.stepsValue.value),
    root_x: SIZE/2,
    root_y: SIZE * 0.98,
    root_a: -Math.PI / 2, // Угол вверх
    one: 0.5,
    branch_split_angle: Math.PI / 6,
    branch_diminish: Number(form.elements.diminishValue.value),
    branch_split_diminish: Number(form.elements.splitDiminishValue.value),
    branch_angle_max: Math.PI / 12,
    branch_angle_exp: Number(form.elements.angleExpValue.value),
    branch_prob_scale: Number(form.elements.probScaleValue.value)
};

class Branch {
    constructor(tree, x, y, r, a, g) {
        this.tree = tree;
        this.x1 = x;
        this.y1 = y;
        this.x2 = x;
        this.y2 = y;
        this.r = r;
        this.a = a;
        this.g = g;
    }

    step() {
        this.r -= this.tree.branch_diminish;
        const angle = (Math.random() - 0.5) * 2 * this.tree.branch_angle_max;
        const scale = this.tree.one + this.tree.root_r - this.r;
        const da = (1 + scale / this.tree.root_r) ** this.tree.branch_angle_exp;
        this.a += da * angle;

        this.x1 = this.x2;
        this.y1 = this.y2;
        this.x2 += Math.cos(this.a) * this.tree.stepsize;
        this.y2 += Math.sin(this.a) * this.tree.stepsize;

        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", this.x1);
        line.setAttribute("y1", this.y1);
        line.setAttribute("x2", this.x2);
        line.setAttribute("y2", this.y2);
        line.setAttribute("stroke", "black");
        line.setAttribute("stroke-width", this.r);
        canvas.appendChild(line);
    }

    shouldSplit() {
        const branchProb = (this.tree.root_r - this.r + this.tree.one) * this.tree.branch_prob_scale;
        return Math.random() < branchProb;
    }

    split() {
        const newR = this.tree.branch_split_diminish * this.r;
        const ra = ((Math.random() < 0.5 ? -1 : 1) * Math.random()) * this.tree.branch_split_angle;
        return new Branch(this.tree, this.x2, this.y2, newR, this.a + ra, this.g + 1);
    }
}

class Tree {
    constructor(settings) {
        Object.assign(this, settings);
        this.branches = [new Branch(this, this.root_x, this.root_y, this.root_r, this.root_a, 0)];
    }

    step() {
        for (let i = this.branches.length - 1; i >= 0; i--) {
            const branch = this.branches[i];
            branch.step();
            if (branch.r <= this.one) {
                this.branches.splice(i, 1);
                continue;
            }

            if (branch.shouldSplit()) {
                const newBranch = branch.split();
                this.branches.push(newBranch);
            }
        }
    }    
}

saveButton.addEventListener('click', function() {
    var dataURI =  'data:image/svg+xml,' + encodeURIComponent(canvas.outerHTML.trim());
    window.parent.postMessage('app.open("' + dataURI + '", null, false)', '*');
});

refreshButton.addEventListener('click', function() {
    // Очистка предыдущего дерева
    while (canvas.firstChild) {
        canvas.removeChild(canvas.firstChild);
    }

    var settings = {
    root_r: Number(form.elements.startRadiusValue.value),
    stepsize: Number(form.elements.stepsValue.value),
    root_x: SIZE/2,
    root_y: SIZE * 0.98,
    root_a: -Math.PI / 2, // Угол вверх
    one: 0.5,
    branch_split_angle: Math.PI / 6,
    branch_diminish: Number(form.elements.diminishValue.value),
    branch_split_diminish: Number(form.elements.splitDiminishValue.value),
    branch_angle_max: Math.PI / 12,
    branch_angle_exp: Number(form.elements.angleExpValue.value),
    branch_prob_scale: Number(form.elements.probScaleValue.value)
    };
  
    // Создание и отрисовка нового дерева
    const newTree = new Tree(settings);
    function drawNewTree() {
        newTree.step();
        if (newTree.branches.length > 0) {
            requestAnimationFrame(drawNewTree);
        } else {
            fitTreeToCanvas();
        }
    }
    drawNewTree();
});

function fitTreeToCanvas() {
    // Получить границы текущего содержимого SVG
    const bbox = canvas.getBBox();
    
    // Рассчитать новый масштаб и позиционирование
    const scale = Math.min(canvas.width.baseVal.value / bbox.width, canvas.height.baseVal.value / bbox.height);
    const xOffset = (canvas.width.baseVal.value - bbox.width * scale) / 2 - bbox.x * scale;
    const yOffset = (canvas.height.baseVal.value - bbox.height * scale) / 2 - bbox.y * scale;

    const treeGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    treeGroup.setAttribute("transform", `translate(${xOffset}, ${yOffset}) scale(${scale})`);
    
    // Переместить содержимое canvas в treeGroup
    while (canvas.firstChild) {
        treeGroup.appendChild(canvas.firstChild);
    }
    
    // Вставить treeGroup обратно в холст
    canvas.appendChild(treeGroup);
}

// Инициализация и отрисовка дерева
const tree = new Tree(settings);

function drawTree() {
    tree.step();
    if (tree.branches.length > 0) {
        requestAnimationFrame(drawTree);
    } else {
        fitTreeToCanvas();
    }
}

drawTree();

