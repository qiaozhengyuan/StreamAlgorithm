/*
Zy
*/

const stream = 1; //1:uniform;11:non-random uniform;2:exponential;3:real world

/*
const A = 10; // Number of hash functions
const B = 400; // Available hashed values. Must be even for algorithm 2
*/

/*
const A = 10; // Number of hash functions
const B = 400; // Available hashed values. Must be even for algorithm 2
*/

let A = 1; // Number of hash functions
let B = 100; // Available hashed values. Must be even for algorithm 2

let ExpectedError = 10000000;

const MAX_INT = 9007199254740991;
const N = 1000000000;
const M = 10000;

let h = [];

const readline = require('readline');
const fs = require('fs');

function multiRun() {
    let i = 5;
    while (i-- > 0) {
        main();
        A += 2;
        h = [];
    }
    resultFileHandle.close();
}

function main() {
    let start = new Date().getTime();
    console.log("stream is " + stream);
    console.log("N is " + N + " M is " + M + " A is " + A + " B is " + B + " Expected error is " + ExpectedError);
    generateHashFunctions();
    let algo = new Algo();
    switch (stream) {
        case 1: algo.readUniformStream(); break;
        case 11: algo.readSolidUniformStream(); break;
        case 2: algo.readExponentialStream(); break;
    }
    let algo1Correct = 0;
    let algo2Correct = 0;
    for (let i = 0; i < M; i++) {
        let algo1Result = algo.algo1Query(i);
        let algo2Result = algo.algo2Query(i);
        let truth = algo.truth["" + i];
        if (Math.abs(algo1Result - truth) < ExpectedError) {
            algo1Correct++;
        }
        if (Math.abs(algo2Result - truth) < ExpectedError) {
            algo2Correct++;
        }
        //console.log("1:" + algo1Result + " 2:" + algo2Result + " T:" + truth);
    }

    let algo1Accuracy = (algo1Correct / M * 100) + "%";
    let algo2Accuracy = (algo2Correct / M * 100) + "%";
    let result = N + "," + M + "," + A + "," + B + "," + ExpectedError + "," + algo1Accuracy + "," + algo2Accuracy;
    resultFileHandle.write(result + "\n");
    console.log("Algorithm 1 accuracy is " + algo1Accuracy + " Algorithm 2 accuracy is " + algo2Accuracy);
    let end = new Date().getTime();
    console.log("Took " + ((end - start) / 1000) + "seconds");
}

function promt(algo) {
    let running = true;
    let rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: 'Query a number> '
    });
    rl.prompt();
    rl.on('line', (num) => {
        let n = Number(num);
        if (isNaN(n)) {
            running = false;
        } else {
            console.log("Queried number is " + n + " Truth is " + algo.truth[num] + " Algo 1 output [" + algo.algo1Query(n) + "] Algo 2 output {" + algo.algo2Query(n) + "}");
        }
        if (running) {
            rl.prompt();
        } else {
            rl.close();
        }
    }).on('close', () => {
        console.log('Have a great day!');
        process.exit(0);
    });
}

class Algo {
    constructor() {
        this.counter = [];
        for (let i = 0; i < A; i++) {
            this.counter.push(new Array(B).fill(0));
        }
        this.truth = {};
    }

    readSolidUniformStream() {
        let t = N / M;
        let i = 0;
        while (i++ < M) {
            for (let j = 0; j < t; j++) {
                this.read(i);
            }
        }
        console.log("stream read is done.");
    }

    readUniformStream() {
        let i = 0;
        while (i++ < N) {
            this.read(Math.floor(Math.random() * M));
        }
        console.log("stream read is done.");
    }

    readExponentialStream() {
        let i = 0;
        while (i++ < N) {
            let chosen = 0;
            let hit = false;
            while (!hit) {
                if (Math.random() < 0.5) {
                    hit = true;
                } else {
                    chosen++;
                }
            }
            this.read(chosen);
        }
        console.log("stream read is done.");
    }

    read(incoming) {
        if (this.truth["" + incoming]) {
            this.truth["" + incoming]++;
        } else {
            this.truth["" + incoming] = 1;
        }
        for (let i = 0; i < A; i++) {
            let hashedVal = h[i].hash(incoming);
            this.counter[i][hashedVal]++;
        }
    }

    algo1Query(x) {
        let result;
        let counts = this.counter.map((hx, index) => {
            let hashedVal = h[index].hash(x);
            return hx[hashedVal];
        }).sort((a, b) => a - b);
        //console.log(counts);
        let mid = Math.floor(A / 2);
        if (A % 2 === 0) {
            result = (counts[mid] + counts[mid - 1]) / 2;
        } else {
            result = counts[mid];
        }
        return result;
    }

    algo2Query(x) {
        let result;
        let counts = this.counter.map((hx, index) => {
            let hashedVal = h[index].hash(x);
            let neighbour;
            if (hashedVal % 2 === 0) {
                neighbour = hashedVal + 1;
            } else {
                neighbour = hashedVal - 1;
            }
            return hx[hashedVal] - hx[neighbour];
        }).sort((a, b) => a - b);
        let mid = Math.floor(A / 2);
        if (A % 2 === 0) {
            result = (counts[mid] + counts[mid - 1]) / 2;
        } else {
            result = counts[mid];
        }
        return result;
    }
}

function generateHashFunctions() {
    let chosenPrime = 0;
    let i = 2 * B + 1;
    while (!chosenPrime) {
        if (isPrime(i)) {
            chosenPrime = i;
        } else {
            i++;
        }
    }
    console.log("Prime number chosen is " + chosenPrime);
    let j = 0;
    while (j++ < A) {
        h.push(new Hash(chosenPrime));
    }
    console.log("N hash = " + h.length);
}

class Hash {
    constructor(prime) {
        this.a = Math.floor(Math.random() * (prime - 1)) + 1;
        this.b = Math.floor(Math.random() * prime);
        this.p = prime;
        this.M = B;
        console.log(this.a + " " + this.b + " " + this.p + " " + this.M);
    }

    hash(x) {
        return (((this.a * x + this.b) % this.p) % this.M);
    }
}

const isPrime = num => {
    for (let i = 2, s = Math.sqrt(num); i <= s; i++) {
        if (num % i === 0) {
            return false;
        }
    }
    return num > 1;
};

var resultFileHandle = fs.createWriteStream("experiments.csv", { flags: 'a' });

resultFileHandle.on('open', function (fd) {
    //main();
    multiRun();
});