// Create two.js element
var el = document.getElementById("main"),
    two = new Two({
        fullscreen: true
    }).appendTo(el);

// Global parameters
var dt = 0.01;
var nEns = 10;

// Truth state vector
var truth_i = [1, 1, 1],
    truth_f;

// Ensemble
var ensemble_i = [];
for (i = 0; i < nEns; i++) {
    ensemble_i.push([50*Math.random(), 50*Math.random(), 50*Math.random()]);
}
ensemble_f = ensemble_i.slice();

// Main loop
two.bind("update", function(frameCount) {
    two.clear();

    // Step truth forward
    truth_f = step(truth_i); 

    // Step ensemble forward
    for (i = 0; i < nEns; i++) {
        ensemble_f[i] = step(ensemble_i[i]);
    }

    // Plot truth
    plotTruth(truth_i, truth_f);

    // Plot ensemble
    for (i = 0; i < nEns; i++) {
        plotMember(ensemble_i[i], ensemble_f[i]);
    }

    // Set old values equal to new values
    truth_i = truth_f;
    ensemble_i = ensemble_f.slice();
}).play();

function plotTruth(start, end) {
    start_px = mapToPx(start);
    end_px = mapToPx(end);
    var line = two.makeLine(
        start_px.x,
        start_px.y,
        end_px.x,
        end_px.y
    );
    line.linewidth = 10;
    line.cap = 'round';
    line.stroke = 'rgba(255,0,0,0.5)';
}

function plotMember(start, end) {
    start_px = mapToPx(start);
    end_px = mapToPx(end);
    var line = two.makeLine(
        start_px.x,
        start_px.y,
        end_px.x,
        end_px.y
    );
    line.linewidth = 4;
    line.cap = 'round';
    line.stroke = 'rgba(0,0,0,0.5)';
}

function mapToPx(state) {
    var scale = 10;
    return {
        x: scale * state[0] + 400,
        y: scale * state[2] - 30
    };
}

// Runge-Kutta integration
function step(prev) {
    var k1 = ode(prev);
    var k2 = ode(math.add(prev, math.multiply(0.5*dt,k1)));
    var k3 = ode(math.add(prev, math.multiply(0.5*dt,k2)));
    var k4 = ode(math.add(prev, math.multiply(dt,k3)));

    var sum = math.add(k1, math.multiply(2,k2));
    sum = math.add(sum, math.multiply(2,k3));
    sum = math.add(sum, k4);
    return math.add(prev, math.multiply(dt/6.0,sum));
}

function ode(state) {
    var x = state[0];
    var y = state[1];
    var z = state[2];

    return [dXdT(x, y), dYdT(x, y, z), dZdT(x, y, z)];
}

// Lorenz '63 equations
function dXdT(x, y) {
    var sigma = 10.0;
    return sigma * (y - x);
}

function dYdT(x, y, z) {
    var rho = 28;
    return x * (rho - z) - y;
}

function dZdT(x, y, z) {
    var beta = 8/3;
    return x * y - beta * z;
}

// Ensemble square-root filter
function update(ensemble, truth) {
    var rho = 1.02;
    var sigma = 0.1;
    var ensMean = math.mean(ensemble, 0);

    var X_f = [];
    for (i = 0; i < nEns; i++) {
        X_f.push(rho * (ensemble[i] - ensMean));
    }
    X_f = math.matrix(X_f);

    var P_f_H_T = math.multiply(X_f, X_f.subset(math.index(_.range(nEns), 1)));
    var HP_f_H_T = P_f_H_T.subset(math.index(1));
    var gain = P_f_H_T / (HP_f_H_T + sigma);
    ensMean = math.add(ensMean, math.multiply(gain, math.subtract(obs, ensMean.subset(math.index(1)))));
    alpha = 1/(1+math.sqrt(sigma/(HP_f_H_T+sigma)));
}
