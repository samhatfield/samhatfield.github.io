// Create two.js element
var el = document.getElementById("main"),
    two = new Two({
        fullscreen: true
    }).appendTo(el);

two.renderer.domElement.style.backgroundColor = 'rgb(29,29,29)';

// Store initial screen dimensions
var w = two.width,
    h = two.height;

// Global parameters
var dt = 0.001;
var nEns = 20;
var frames = 40;

// Truth state vector
var truth = [0, 0];

var k = 0;

// Ensemble
var ensemble = [[]];
for (var i = 0; i < nEns; i++) {
    ensemble[0].push(2*Math.random()-1);
}
ensemble[1] = ensemble[0].slice()

// Main loop
two.bind("update", function(frameCount) {
    // Step truth forward
    if (k == frames) {
        two.clear();
        k = 0;
    }
    truth[1] = stepTruth(truth[0]);

    // Step ensemble forward
    thisEnsemble = []
    for (var i = 0; i < nEns; i++) {
        ensemble[1][i] = stepTruth(ensemble[0][i]);
    }

    if (frameCount % 10 == 0) {
        ensemble[1] = update(ensemble[1], truth[1]);
    }

    // Plot truth
    plotTruth(truth, k);

    // Plot ensemble
    plotEnsemble(ensemble, k);

    k++;

    ensemble[0] = ensemble[1].slice();
    truth[0] = truth[1];
});
setInterval(function() {
    two.update();
}, 50);

function plotTruth(truth, k) {
    var line = two.makeLine(
            k*two.width/frames,
            mapToPx(truth[0]),
            (k+1)*two.width/frames,
            mapToPx(truth[1])
    );
    line.linewidth = 10;
    line.cap = 'round';
    line.stroke = 'rgba(255,0,0,0.5)';
}

function plotEnsemble(ensemble, k) {
    for (var m = 0; m < nEns; m++) {
        var line = two.makeLine(
                k*two.width/frames,
                mapToPx(ensemble[0][m]),
                (k+1)*two.width/frames,
                mapToPx(ensemble[1][m])
        );
        line.linewidth = 10;
        line.cap = 'round';
        line.stroke = 'rgba(255,255,255,0.1)';
    }
}

function mapToPx(state) {
    var pad = 0;
    return state * (two.height/5 - pad) + two.height/2
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
    var rho = 1.1;
    var obsErr = 0.005;
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
