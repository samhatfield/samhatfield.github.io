// Create two.js element
var el = document.getElementById("main"),
    two = new Two({
        fullscreen: true
    }).appendTo(el);

two.renderer.domElement.style.backgroundColor = 'rgb(29,29,29)';

// Global parameters
var dt = 0.001;
var nEns = 10;
var frames = 20;

// Truth state vector
var truth = [0];

var k = 0;

// Ensemble
var ensemble = [[]];
for (var i = 0; i < nEns; i++) {
    ensemble[0].push(2*Math.random()-1);
}

// Main loop
two.bind("update", function(frameCount) {
    two.clear();

    // Step truth forward
    if (k == frames) {
        truth = [truth[frames-1]];
        ensemble = [ensemble[frames-1]];
        k = 0;
    }
    truth.push(stepTruth(truth[k])); 

    // Step ensemble forward
    thisEnsemble = []
    for (var i = 0; i < nEns; i++) {
        thisEnsemble.push(stepTruth(ensemble[k][i]));
    }
    ensemble.push(thisEnsemble);
    k++;

    if (frameCount % 5 == 0) {
        ensemble[k] = update(ensemble[k], truth[k]);
    }

    // Plot truth
    plotTruth(truth, k);

    // Plot ensemble
    plotEnsemble(ensemble, k);
});
setInterval(function() {
    two.update();
}, 50);

function plotTruth(truth, k) {
    for (var j = 0; j < k; j++) {
        var line = two.makeLine(
                j*two.width/frames,
                mapToPx(truth[j]),
                (j+1)*two.width/frames,
                mapToPx(truth[j+1])
        );
        line.linewidth = 10;
        line.cap = 'round';
        line.stroke = 'rgba(255,0,0,0.5)';
    }
}

function plotEnsemble(ensemble, k) {
    for (var m = 0; m < nEns; m++) {
        for (var j = 0; j < k; j++) {
            var line = two.makeLine(
                    j*two.width/frames,
                    mapToPx(ensemble[j][m]),
                    (j+1)*two.width/frames,
                    mapToPx(ensemble[j+1][m])
            );
            line.linewidth = 10;
            line.cap = 'round';
            line.stroke = 'rgba(255,255,255,0.1)';
        }
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
