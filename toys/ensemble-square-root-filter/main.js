// Create two.js element
var el = document.getElementById("main"),
    two = new Two({
        fullscreen: true
    });

two.appendTo(el);

// Global parameters
var dt = 0.01;
var nEns = 20;

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
});

two.play();

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

function step(prev) {
    x = prev[0];
    y = prev[1];
    z = prev[2];

    var x1 = dXdT(x, y);
    var y1 = dYdT(x, y, z);
    var z1 = dZdT(x, y, z);

    var x2 = dXdT(x+0.5*dt*x1, y+0.5*dt*y1);
    var y2 = dYdT(x+0.5*dt*x1, y+0.5*dt*y1, z+0.5*dt*z1);
    var z2 = dZdT(x+0.5*dt*x1, y+0.5*dt*y1, z+0.5*dt*z1);

    var x3 = dXdT(x+0.5*dt*x2, y+0.5*dt*y2);
    var y3 = dXdT(x+0.5*dt*x2, y+0.5*dt*y2, z+0.5*dt*z2);
    var z3 = dXdT(x+0.5*dt*x2, y+0.5*dt*y2, z+0.5*dt*z2);

    var x4 = dXdT(x+dt*x3, y+dt*y3);
    var y4 = dXdT(x+dt*x3, y+dt*y3, z+dt*z3);
    var z4 = dXdT(x+dt*x3, y+dt*y3, z+dt*z3);

    x += dt * (x1 + 2*x2 + 2*x3 + x4)/6.0;
    y += dt * (y1 + 2*y2 + 2*y3 + y4)/6.0;
    z += dt * (z1 + 2*z2 + 2*z3 + z4)/6.0;
    
    return [x, y, z];
}

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
