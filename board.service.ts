import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BoardService {

  constructor() { }
}

export class Board {
    width: number;
    theme: string;
    height: number;
    numNodes: number;
    extreme: boolean;
    initialSeed:number;
    seed: number;
    hotkeys: boolean;
    nodes: Array<MyNode>;
    numbers: boolean;
    grid: boolean;
    daily: boolean;
    gauntlet: number;
    dailyDiff: string;

    constructor(width: number, height: number, numNodes: number, extreme: boolean, seed: number, theme: string, hotkeys: boolean, numbers: boolean, grid: boolean, daily: boolean, gauntlet: number, dailyDiff: string) {
        this.width = width;
        this.height = height;
        this.numNodes = numNodes;
        this.extreme = extreme;
        this.initialSeed = seed;
        this.seed = seed;
        this.theme = theme;
        this.hotkeys = hotkeys;
        this.numbers = numbers;
        this.grid = grid;
        this.daily = daily;
        this.gauntlet = gauntlet;
        this.nodes = new Array<MyNode>();
        this.dailyDiff = dailyDiff;
    }

    public toString() {
      var m = [];
      for(let n of this.nodes) {
        let nodeModel = {
          x: n.x,
          y: n.y,
          val: n.val
        }

        var bridges = [];
        for(let b of n.bridges) {
          let bridgeModel = {
            n1x: b.n1.x,
            n2x: b.n2.x,
            n1y: b.n1.y,
            n2y: b.n2.y,
            num: b.num
          }
          bridges.push(bridgeModel);
        }

        nodeModel['bridges'] = bridges;

        m.push(nodeModel);
      }

      return JSON.stringify(m);
    }

    public generateBoard() {
        var chance = 8;
        var nodesToAdd = this.numNodes;
        var difficulty = '';
        var difficultyDistance;
        
        if(this.seed == 0) {
            this.seed = this.randomIntReal(0, 2000000000);
            this.initialSeed = this.seed;
        }

        var firstX = 1;
        var firstY = 1;

        if(!this.extreme) {
            firstX = this.randomInt(1, this.width);
            firstY = this.randomInt(1, this.height);
        }

        if(this.numNodes == Math.floor(Math.sqrt(this.width * this.height)) * 2) {
            difficulty = 'easy';
            difficultyDistance = 0;
        }

        var tempNodes = new Array<MyNode>();
        var occupiedSquares = new Array<MyNode>();

        let tempNode = new MyNode(firstX, firstY);
        tempNode.setVal(0);
        tempNodes.push(tempNode);

        var LagCount = 0;
        var toCountTo = 50000;
        nodesToAdd--;
        if(this.extreme) {
            toCountTo = 200000;
            nodesToAdd = 50000000;
        }
        while(nodesToAdd > 0) {
            LagCount++;
            if(LagCount > toCountTo) {
                nodesToAdd = 0;
            }

            var randomNode = tempNodes[this.randomInt(0, tempNodes.length - 1)];

            // Determine direction
            var diceRoll = this.randomInt(1, 4);

            //UP
            if(diceRoll === 1) {
                if(!randomNode.getUp()) {
                    if(randomNode.getY() - 1 > 2) {

                        var randomDistanceAway = 0;
                        if(this.extreme) {
                            if(randomNode.getY() - 1 > 3) {
                                randomDistanceAway = this.randomInt(2, 3)
                            } else {
                                randomDistanceAway = this.randomInt(2, randomNode.getY() - 1);
                            }
                        } else if(difficulty == 'easy') {
                            if(randomNode.getY() - 1 < difficultyDistance) {
                            } else {
                                randomDistanceAway = this.randomInt(difficultyDistance, randomNode.getY() - 1);
                            }
                        }
                        
                        else {
                            randomDistanceAway = this.randomInt(2, randomNode.getY() - 1);
                        }

                        var count;
                        var add = true;
                        for(count = randomNode.getY() - 1 ; count >= randomNode.getY() - randomDistanceAway ; count--) {
                            for(let n of tempNodes) {
                                if(n.getX() == randomNode.getX() && n.getY() == count) {
                                    if(count <= randomNode.getY() - 2 && add) {
                                        if(!n.getDown()) {
                                            var numBridges = 1;
                                            if(difficulty != 'easy') {
                                                if(this.randomInt(1,2) == 2) {numBridges = 2;}
                                            } else {
                                                if(this.randomInt(1,chance) == chance) {numBridges = 1;} else { numBridges = 2; }
                                            }
                                            randomNode.setVal(randomNode.getVal() + numBridges);
                                            n.setVal(n.getVal() + numBridges);
                                            randomNode.setUp(true);
                                            n.setDown(true);
                                            var tempCount;
                                            for(tempCount = randomNode.getY() ; tempCount >= n.getY() ; tempCount--) {
                                                occupiedSquares.push(new MyNode(randomNode.getX(), tempCount));
                                            }
                                            add = false;
                                        }
                                    }
                                    add = false;
                                }
                            }

                            for(let n of occupiedSquares) {
                                if(n.getX() == randomNode.getX() && n.getY() == count) {
                                    add = false;
                                }
                            }
                        }
                        if(add) {
                            var numBridges = 1;
                            if(difficulty != 'easy') {
                                if(this.randomInt(1,2) == 2) {numBridges = 2;}
                            } else {
                                if(this.randomInt(1,chance) == chance) {numBridges = 1;} else { numBridges = 2; }
                            }
                            let tempNode = new MyNode(randomNode.getX(), randomNode.getY() - randomDistanceAway);

                            for(let n of tempNodes) {
                                var neighbor1 = new MyNode(tempNode.getX(), tempNode.getY());
                                var neighbor2 = new MyNode(tempNode.getX(), tempNode.getY() + 1);
                                var neighbor3 = new MyNode(tempNode.getX(), tempNode.getY() - 1);
                                var neighbor4 = new MyNode(tempNode.getX() + 1, tempNode.getY());
                                var neighbor5 = new MyNode(tempNode.getX() - 1, tempNode.getY());
                                var neighbors = new Array<MyNode>();
                                neighbors.push(neighbor1);
                                neighbors.push(neighbor2);
                                neighbors.push(neighbor3);
                                neighbors.push(neighbor4);
                                neighbors.push(neighbor5);
                                for(let n2 of neighbors) {
                                    if(n.getX() == n2.getX() && n.getY() == n2.getY()) {
                                        add = false;
                                    }
                                }
                            }

                            if(add) {
                                randomNode.setVal(randomNode.getVal() + numBridges);
                                tempNode.setVal(numBridges);
                                randomNode.setUp(true);
                                tempNode.setDown(true);
                                tempNodes.push(tempNode);
                                for(count = randomNode.getY() ; count >= tempNode.getY() ; count--) {
                                    occupiedSquares.push(new MyNode(randomNode.getX(), count));
                                }
                                nodesToAdd--;
                            }
                        }
                    }
                }
            } 
            //DOWN 
            else if(diceRoll === 2) {
                if(!randomNode.getDown()) {
                    if(randomNode.getY() + 1 < this.height - 2) {

                        var randomDistanceAway = 0;
                        if(this.extreme) {
                            if(this.height - randomNode.getY() > 3) {
                                randomDistanceAway = this.randomInt(2, 3)
                            } else {
                                randomDistanceAway = this.randomInt(2, this.height - randomNode.getY());
                            }
                        } 
                        else if(difficulty == 'easy') {
                            if(this.height - randomNode.getY() < difficultyDistance) {
                            } else {
                                randomDistanceAway = this.randomInt(difficultyDistance, this.height - randomNode.getY());
                            }
                        }
                        else {
                            randomDistanceAway = this.randomInt(2, this.height - randomNode.getY());
                        }

                        var count;
                        var add = true;
                        for(count = randomNode.getY() + 1 ; count <= randomNode.getY() + randomDistanceAway ; count++) {
                            for(let n of tempNodes) {
                                if(n.getX() == randomNode.getX() && n.getY() == count) {
                                    if(count >= randomNode.getY() + 2 && add) {
                                        if(!n.getUp()) {
                                            var numBridges = 1;
                                            if(difficulty != 'easy') {
                                                if(this.randomInt(1,2) == 2) {numBridges = 2;}
                                            } else {
                                                if(this.randomInt(1,chance) == chance) {numBridges = 1;} else { numBridges = 2; }
                                            }
                                            randomNode.setVal(randomNode.getVal() + numBridges);
                                            n.setVal(n.getVal() + numBridges);
                                            randomNode.setDown(true);
                                            n.setUp(true);
                                            var tempCount;
                                            for(tempCount = randomNode.getY() ; tempCount <= n.getY() ; tempCount++) {
                                                occupiedSquares.push(new MyNode(randomNode.getX(), tempCount));
                                            }
                                            add = false;
                                        }
                                    }
                                    add = false;
                                }
                            }

                            for(let n of occupiedSquares) {
                                if(n.getX() == randomNode.getX() && n.getY() == count) {
                                    add = false;
                                }
                            }
                        }
                        if(add) {
                            var numBridges = 1;
                            if(difficulty != 'easy') {
                                if(this.randomInt(1,2) == 2) {numBridges = 2;}
                            } else {
                                if(this.randomInt(1,chance) == chance) {numBridges = 1;} else { numBridges = 2; }
                            }
                            let tempNode = new MyNode(randomNode.getX(), randomNode.getY() + randomDistanceAway);
                            for(let n of tempNodes) {
                                var neighbor1 = new MyNode(tempNode.getX(), tempNode.getY());
                                var neighbor2 = new MyNode(tempNode.getX(), tempNode.getY() + 1);
                                var neighbor3 = new MyNode(tempNode.getX(), tempNode.getY() - 1);
                                var neighbor4 = new MyNode(tempNode.getX() + 1, tempNode.getY());
                                var neighbor5 = new MyNode(tempNode.getX() - 1, tempNode.getY());
                                var neighbors = new Array<MyNode>();
                                neighbors.push(neighbor1);
                                neighbors.push(neighbor2);
                                neighbors.push(neighbor3);
                                neighbors.push(neighbor4);
                                neighbors.push(neighbor5);
                                for(let n2 of neighbors) {
                                    if(n.getX() == n2.getX() && n.getY() == n2.getY()) {
                                        add = false;
                                    }
                                }
                            }
                            if(add) {
                                randomNode.setVal(randomNode.getVal() + numBridges);
                                tempNode.setVal(numBridges);
                                randomNode.setDown(true);
                                tempNode.setUp(true);
                                tempNodes.push(tempNode);
                                for(count = randomNode.getY() ; count <= tempNode.getY() ; count++) {
                                    occupiedSquares.push(new MyNode(randomNode.getX(), count));
                                }
                                nodesToAdd--;
                            }
                        }
                    }
                }
            } 
            //LEFT
            else if(diceRoll === 3) {
                if(!randomNode.getLeft()) {
                    if(randomNode.getX() - 1 > 2) {

                        var randomDistanceAway = 0;
                        if(this.extreme) {
                            if(randomNode.getX() - 1 > 3) {
                                randomDistanceAway = this.randomInt(2, 3)
                            } else {
                                randomDistanceAway = this.randomInt(2, randomNode.getX() - 1);
                            }
                        } else if(difficulty == 'easy') {
                            if(randomNode.getX() - 1 < difficultyDistance) {
                            } else {
                                randomDistanceAway = this.randomInt(difficultyDistance, randomNode.getX() - 1);
                            }
                        }
                        
                        else {
                            randomDistanceAway = this.randomInt(2, randomNode.getX() - 1);
                        }

                        var count;
                        var add = true;
                        for(count = randomNode.getX() - 1 ; count >= randomNode.getX() - randomDistanceAway ; count--) {
                            for(let n of tempNodes) {
                                if(n.getX() == count && n.getY() == randomNode.getY()) {
                                    if(count <= randomNode.getX() - 2 && add) {
                                        if(!n.getRight()) {
                                            var numBridges = 1;
                                            if(difficulty != 'easy') {
                                                if(this.randomInt(1,2) == 2) {numBridges = 2;}
                                            } else {
                                                if(this.randomInt(1,chance) == chance) {numBridges = 1;} else { numBridges = 2; }
                                            }
                                            randomNode.setVal(randomNode.getVal() + numBridges);
                                            n.setVal(n.getVal() + numBridges);
                                            randomNode.setLeft(true);
                                            n.setRight(true);
                                            var tempCount;
                                            for(tempCount = randomNode.getX() ; tempCount >= n.getX() ; tempCount--) {
                                                occupiedSquares.push(new MyNode(tempCount, randomNode.getY()));
                                            }
                                            add = false;
                                        }
                                    }
                                    add = false;
                                }
                            }

                            for(let n of occupiedSquares) {
                                if(n.getX() == count && n.getY() == randomNode.getY()) {
                                    add = false;
                                }
                            }
                        }
                        if(add) {
                            var numBridges = 1;
                            if(difficulty != 'easy') {
                                if(this.randomInt(1,2) == 2) {numBridges = 2;}
                            } else {
                                if(this.randomInt(1,chance) == chance) {numBridges = 1;} else { numBridges = 2; }
                            }
                            let tempNode = new MyNode(randomNode.getX() - randomDistanceAway, randomNode.getY());
                            for(let n of tempNodes) {
                                var neighbor1 = new MyNode(tempNode.getX(), tempNode.getY());
                                var neighbor2 = new MyNode(tempNode.getX(), tempNode.getY() + 1);
                                var neighbor3 = new MyNode(tempNode.getX(), tempNode.getY() - 1);
                                var neighbor4 = new MyNode(tempNode.getX() + 1, tempNode.getY());
                                var neighbor5 = new MyNode(tempNode.getX() - 1, tempNode.getY());
                                var neighbors = new Array<MyNode>();
                                neighbors.push(neighbor1);
                                neighbors.push(neighbor2);
                                neighbors.push(neighbor3);
                                neighbors.push(neighbor4);
                                neighbors.push(neighbor5);
                                for(let n2 of neighbors) {
                                    if(n.getX() == n2.getX() && n.getY() == n2.getY()) {
                                        add = false;
                                    }
                                }
                            }
                            if(add) {
                                randomNode.setVal(randomNode.getVal() + numBridges);
                                tempNode.setVal(numBridges);
                                randomNode.setLeft(true);
                                tempNode.setRight(true);
                                tempNodes.push(tempNode);
                                for(count = randomNode.getX() ; count >= tempNode.getX() ; count--) {
                                    occupiedSquares.push(new MyNode(count, randomNode.getY()));
                                }
                                nodesToAdd--;
                            }
                        }
                    }
                }
            } 
            //RIGHT 
            else if(diceRoll === 4) {
                if(!randomNode.getRight()) {
                    if(randomNode.getX() + 1 < this.width - 2) {
                        var randomDistanceAway = 0;
                        if(this.extreme) {
                            if(this.width - randomNode.getX() > 3) {
                                randomDistanceAway = this.randomInt(2, 3)
                            } else {
                                randomDistanceAway = this.randomInt(2, this.width - randomNode.getX());
                            }
                        } 
                        else if(difficulty == 'easy') {
                            if(this.width - randomNode.getX() < difficultyDistance) {
                            } else {
                                randomDistanceAway = this.randomInt(difficultyDistance, this.width - randomNode.getX());
                            }
                        }
                        else {
                            randomDistanceAway = this.randomInt(2, this.width - randomNode.getX());
                        }

                        var count;
                        var add = true;
                        for(count = randomNode.getX() + 1 ; count <= randomNode.getX() + randomDistanceAway ; count++) {
                            for(let n of tempNodes) {
                                if(n.getX() == count && n.getY() == randomNode.getY()) {
                                    if(count >= randomNode.getX() + 2 && add) {
                                        if(!n.getLeft()) {
                                            var numBridges = 1;
                                            if(difficulty != 'easy') {
                                                if(this.randomInt(1,2) == 2) {numBridges = 2;}
                                            } else {
                                                if(this.randomInt(1,chance) == chance) {numBridges = 1;} else { numBridges = 2; }
                                            }
                                            randomNode.setVal(randomNode.getVal() + numBridges);
                                            n.setVal(n.getVal() + numBridges);
                                            randomNode.setRight(true);
                                            n.setLeft(true);
                                            var tempCount;
                                            for(tempCount = randomNode.getX() ; tempCount <= n.getX() ; tempCount++) {
                                                occupiedSquares.push(new MyNode(tempCount, randomNode.getY()));
                                            }
                                            add = false;
                                        }
                                    }
                                    add = false;
                                }
                            }

                            for(let n of occupiedSquares) {
                                if(n.getX() == count && n.getY() == randomNode.getY()) {
                                    add = false;
                                }
                            }
                        }
                        if(add) {
                            var numBridges = 1;
                            if(difficulty != 'easy') {
                                if(this.randomInt(1,2) == 2) {numBridges = 2;}
                            } else {
                                if(this.randomInt(1,chance) == chance) {numBridges = 1;} else { numBridges = 2; }
                            }
                            let tempNode = new MyNode(randomNode.getX() + randomDistanceAway, randomNode.getY());
                            for(let n of tempNodes) {
                                var neighbor1 = new MyNode(tempNode.getX(), tempNode.getY());
                                var neighbor2 = new MyNode(tempNode.getX(), tempNode.getY() + 1);
                                var neighbor3 = new MyNode(tempNode.getX(), tempNode.getY() - 1);
                                var neighbor4 = new MyNode(tempNode.getX() + 1, tempNode.getY());
                                var neighbor5 = new MyNode(tempNode.getX() - 1, tempNode.getY());
                                var neighbors = new Array<MyNode>();
                                neighbors.push(neighbor1);
                                neighbors.push(neighbor2);
                                neighbors.push(neighbor3);
                                neighbors.push(neighbor4);
                                neighbors.push(neighbor5);
                                for(let n2 of neighbors) {
                                    if(n.getX() == n2.getX() && n.getY() == n2.getY()) {
                                        add = false;
                                    }
                                }
                            }
                            if(add) {
                                randomNode.setVal(randomNode.getVal() + numBridges);
                                tempNode.setVal(numBridges);
                                randomNode.setRight(true);
                                tempNode.setLeft(true);
                                tempNodes.push(tempNode);
                                for(count = randomNode.getX() ; count <= tempNode.getX() ; count++) {
                                    occupiedSquares.push(new MyNode(count, randomNode.getY()));
                                }
                                nodesToAdd--;
                            }
                        }
                    }
                }
            }
        }
        for(let n of tempNodes) {
            this.addNode(n);
        }
    }

    private randomIntReal(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    private randomInt(min, max) {
        return Math.floor(this.random() * (max - min + 1) + min);
    }

    random() {
        var x = Math.sin(++this.seed) * 10000;
        return x - Math.floor(x);
    }

    private testAddingNodes() {
        let node1 = new MyNode(this.width, this.height);
        node1.setVal(5);

        let node2 = new MyNode(this.width, 1);
        node2.setVal(4);

        let node3 = new MyNode(1, this.height);
        node3.setVal(2);

        let node4 = new MyNode(1, 1);
        node4.setVal(1);

        this.addNode(node1);
        this.addNode(node2);
        this.addNode(node3);
        this.addNode(node4);
    }

    addNode(node: MyNode) {
        this.nodes.push(node);
    }

    getWidth() { return this.width; }
    getHeight() { return this.height; }
    getNodes() { return this.nodes; }
}

export class Bridge {
    n1: MyNode;
    n2: MyNode;
    num: number;
    width1: number;
    width2: number;

    constructor(n1: MyNode, n2: MyNode, num: number) {
        this.n1 = n1;
        this.n2 = n2;
        this.num = num;
        this.width1 = 0;
        this.width2 = 0;
    }

    setNum(num: number) {
        this.num = num;
    }

    getN1() { return this.n1; }
    getN2() { return this.n2; }
    getNum() { return this.num; }
}

export class MyNode {
    x: number;
    y: number;
    val: number;
    bridges: Array<Bridge>;
    up: boolean;
    right: boolean;
    left: boolean;
    down: boolean;

    constructor(x: number, y:number) {
        this.x = x;
        this.y = y;
        this.bridges = new Array<Bridge>();
        this.up = false;
        this.right = false;
        this.left = false;
        this.down = false;
    }

    setVal(val: number) {
        this.val = val;
    }

    setUp(b: boolean) {
        this.up = b;
    }

    setDown(b: boolean) {
        this.down = b;
    }

    setRight(b: boolean) {
        this.right = b;
    }

    setLeft(b: boolean) {
        this.left = b;
    }

    addBridge(bridge: Bridge) {
        this.bridges.push(bridge);
    }

    getX() { return this.x; }
    getY() { return this.y; }
    getVal() { return this.val; }
    getBridges() { return this.bridges; }
    getUp() { return this.up; }
    getDown() { return this.down; }
    getLeft() { return this.left; }
    getRight() { return this.right; }
}
