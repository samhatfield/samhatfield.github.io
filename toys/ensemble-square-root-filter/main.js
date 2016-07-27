// Create two.js element
var el = document.getElementById("main"),
    two = new Two({
        fullscreen: true
    }).appendTo(el);

two.renderer.domElement.style.backgroundColor = 'rgb(29,29,29)';

// Global parameters
var dt = 0.01;
var nEns = 10;

// Truth state vector
var truth_i = [-20, 1, 50],
    truth_f;

// Ensemble
var ensemble_i = [];
for (i = 0; i < nEns; i++) {
    ensemble_i.push([-10, 5*Math.random()-2.5, 33]);
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

    if (frameCount % 100 == 0) {
        ensemble_f = update(ensemble_f, truth_f);
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
    line.linewidth = 16;
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
    line.linewidth = 8;
    line.cap = 'round';
    line.stroke = 'rgba(255,255,255,0.5)';
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
    var rho = 1.10;
    var sigma = 0.50;
    var ensMean = math.mean(ensemble, 0);
    var obs = truth[1] + sigma * (Math.random()-1)

    var X_f = [];
    for (i = 0; i < nEns; i++) {
        X_f.push(math.multiply(rho, math.subtract(ensemble[i], ensMean)));
    }
    X_f = math.matrix(math.transpose(X_f));

    var P_f_H_T = math.squeeze(math.multiply(X_f, math.transpose(X_f.subset(math.index(1, _.range(nEns))))));
    var HP_f_H_T = P_f_H_T.subset(math.index(1));
    var gain = math.divide(P_f_H_T, HP_f_H_T + sigma);
    ensMean = math.add(ensMean, math.multiply(gain, obs - ensMean[1]));
    alpha = 1/(1+math.sqrt(sigma/(HP_f_H_T+sigma)));

    var analysis = [];
    for (i = 0; i < nEns; i++) {
        var diff = math.multiply(alpha*X_f.subset(math.index(1, i)), gain);
        analysis.push(math.add(ensMean, math.subtract(math.squeeze(X_f.subset(math.index([0,1,2], i))), diff))._data);
    }

    return analysis;
}
