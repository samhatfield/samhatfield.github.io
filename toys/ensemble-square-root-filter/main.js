// Create two.js element
var el = document.getElementById("main"),
    two = new Two({
        fullscreen: true
    }).appendTo(el);

two.renderer.domElement.style.backgroundColor = 'rgb(29,29,29)';

// Global parameters
var dt = 0.01;
var nEns = 40;

// Truth state vector
var truth = [0];

var k = 0;

// Ensemble
var ensemble_i = [];
for (var i = 0; i < nEns; i++) {
    ensemble_i.push(2*Math.random()-1);
}
ensemble_f = ensemble_i.slice();

// Main loop
two.bind("update", function(frameCount) {
    two.clear();

    // Step truth forward
    if (k == 19) {
        truth = [truth[19]];
        k = 0;
    }
    truth.push(stepTruth(truth[k])); 
    k++;

    // Step ensemble forward
    for (i = 0; i < nEns; i++) {
        ensemble_f[i] = stepModel(ensemble_i[i]);
    }

    if (frameCount % 10 == 0) {
        ensemble_f = update(ensemble_f, truth[k]);
    }

    // Plot truth
    plotTruth(truth[k-1], truth[k]);

    // Plot ensemble
    for (i = 0; i < nEns; i++) {
        plotMember(ensemble_i[i], ensemble_f[i]);
    }

    // Set old values equal to new values
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
    var pad = 50;
    return {
        x: two.width/2,
        y: (state * (two.height/2 - pad)) + two.height/2
    };
}

function stepTruth(x) {
    var sigma = 0.5;
    var db = Math.random()-0.5;
    return x + f(x)*dt + sigma*db;
}

function stepModel(x) {
    return x + f(x)*dt
}

function f(x) {
    return -4 * x * (x*x - 1);
}

// Ensemble square-root filter
function update(ensemble, truth) {
    var rho = 2.5;
    var obsErr = 0.01;
    var obs = truth + obsErr * (Math.random()-0.5)

    var ensMean = math.mean(ensemble);
    var X_b = []
    for (var i = 0; i < nEns; i++) {
        X_b.push(rho * (ensemble[i] - ensMean));
    }
    var ensVar = math.sqrt(rho) * math.var(ensemble);

    var K = ensVar / (ensVar + obsErr)
    ensMean += K * (obs - ensMean);
    K /= (1 + math.sqrt(obsErr/(ensVar + obsErr)))

    for (var i = 0; i < nEns; i++) {
        ensemble[i] = ensMean + (1 - K) * X_b[i];
    }

    return ensemble;
}
