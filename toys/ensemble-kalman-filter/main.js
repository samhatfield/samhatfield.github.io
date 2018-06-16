(function(doc,win) {
    // Create two.js element
    var el = document.getElementById("main"),
        two = new Two({
            fullscreen: true
        }).appendTo(el);

    two.renderer.domElement.style.backgroundColor = 'rgb(29,29,29)';

    // var svgObject = document.getElementsByTagName('object')[0];
    // console.log(svgObject);
    // svgObject.onload = function(){
    //       var mySvg = svgObject.contentDocument.getElementsByTagName('svg')[0];
    //       var two = new Two();
    //       var shape = two.interpret(mySvg);
    //       console.log(shape);
    // };

    // Global parameters
    var Δt = 0.01,
        nEns = 80,
        assim_freq = 55,
        originalObsErr = obsErr = 5;

    // Truth state vector
    var truth = [-20, 1, 50];

    // Ensemble
    var ensemble = [];
    for (i = 0; i < nEns; i++) {
        ensemble.push([-10, 5*Math.random()-2.5, 33]);
    }

    // Initialise SVG objects
    var truthHandle = two.makeCircle(0.0,0.0,10.0);
    truthHandle.linewidth = 0;
    truthHandle.fill = 'rgba(255,0,0,0.5)';
    var obsErrHandle = two.makeCircle(0.0,0.0,originalObsErr);
    obsErrHandle.linewidth = 0;
    obsErrHandle.fill = 'rgba(255,0,0,0.1)';
    var ensembleHandle = [];
    for (i = 0; i < nEns; i++) {
        ensembleHandle.push(two.makeCircle(0.0,0.0,8.0));
        ensembleHandle[i].fill = 'rgba(255,255,255,0.5)';
        ensembleHandle[i].linewidth = 0;
    }

    // Main loop
    two.bind("update", function(frameCount) {
        // Get state from UI
        updateFromUI();

        // Step truth forward
        truth = step(truth);

        // Step ensemble forward
        for (i = 0; i < nEns; i++) {
            ensemble[i] = step(ensemble[i]);
        }

        // Assimilate observations into ensemble
        if (frameCount % assim_freq === 0) {
            ensemble = update(ensemble, truth, obsErr);
        }

        // Plot observation error cloud
        // updateObsErr(obsErrHandle, truth, obsErr/originalObsErr);

        // Update truth
        updateTruth(truthHandle, truth);

        // Update ensemble
        updateEnsemble(ensembleHandle, ensemble);
    });

    // Run main loop
    setInterval(function() {
        two.update();
    }, 24);

    function updateFromUI() {
        obsErr = 0.1*doc.getElementById('obsErr').value;
        assim_freq = 5 + parseInt(doc.getElementById('assim_freq').value);
    }

    // function updateObsErr(handle, loc, scale) {
    //     loc_px = mapToPx(loc);
    //     handle.translation.set(loc_px.x, loc_px.y);
    //     handle.scale = scale;
    // }

    function updateTruth(handle, loc) {
        loc_px = mapToPx(loc);
        handle.translation.set(loc_px.x, loc_px.y);
        handle.scale = (24.0+loc[1])/25.0;
    }

    function updateEnsemble(handles, locs) {
        for (i = 0; i < nEns; i++) {
            loc_px = mapToPx(locs[i])
            handles[i].translation.set(loc_px.x, loc_px.y);
            handles[i].scale = (24.0+locs[i][1])/30.0;
        }
    }

    function mapToPx(state) {
        var scale = 10;
        return {
            x: scale * state[0] + two.width/2,
            y: scale * state[2] + two.height/4
        };
    }

    // Runge-Kutta integration
    function step(prev) {
        var k1 = ode(prev);
        var k2 = ode(math.add(prev, math.multiply(0.5*Δt,k1)));

        return math.add(prev, math.multiply(dt,k2));
    }

    function ode(state) {
        var x = state[0],
            y = state[1],
            z = state[2];

        return [dXdT(x, y), dYdT(x, y, z), dZdT(x, y, z)];
    }

    // Lorenz '63 equations
    function dXdT(x, y) {
        var σ = 10.0;
        return σ * (y - x);
    }

    function dYdT(x, y, z) {
        var ρ = 28.0;
        return x * (ρ - z) - y;
    }

    function dZdT(x, y, z) {
        var β = 8.0/3.0;
        return x * y - β * z;
    }

    // Ensemble square-root filter
    function update(ensemble, truth, obsErr) {
        var rho = 1.10;
        var ensMean = math.mean(ensemble, 0);
        var obsVar = obsErr*obsErr;
        var obs = truth[1] + obsErr * (Math.random()-1)

        var X_f = [];
        for (i = 0; i < nEns; i++) {
            X_f.push(math.multiply(rho, math.subtract(ensemble[i], ensMean)));
        }
        X_f = math.matrix(math.transpose(X_f));

        var P_f_H_T = math.squeeze(math.multiply(X_f, math.transpose(X_f.subset(math.index(1, _.range(nEns))))));
        var HP_f_H_T = P_f_H_T.subset(math.index(1));
        var gain = math.divide(P_f_H_T, HP_f_H_T + obsVar);
        ensMean = math.add(ensMean, math.multiply(gain, obs - ensMean[1]));
        alpha = 1/(1+math.sqrt(obsVar/(HP_f_H_T+obsVar)));

        var analysis = [];
        for (i = 0; i < nEns; i++) {
            var diff = math.multiply(alpha*X_f.subset(math.index(1, i)), gain);
            analysis.push(math.add(ensMean, math.subtract(math.squeeze(X_f.subset(math.index([0,1,2], i))), diff))._data);
        }

        return analysis;
    }
}(document, window));
