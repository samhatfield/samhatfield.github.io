(function(doc,win) {
    // Create two.js element
    var el = document.getElementById("main"),
        two = new Two({
            fullscreen: true
        }).appendTo(el);

    two.renderer.domElement.style.backgroundColor = 'rgb(29,29,29)';

    // Global parameters
    var dt = 0.01,
        nEns = 1000;

    // Ensemble
    var ensemble_i = [];
    for (i = 0; i < nEns; i++) {
        ensemble_i.push([-10, 5*Math.random()-2.5, 33]);
    }
    var ensemble_f = ensemble_i.slice();

    // Initialise SVG objects
    var ensembleHandle = [];
    for (i = 0; i < nEns; i++) {
        ensembleHandle.push(two.makeEllipse(0.0,0.0,20.0, 3.0));
        ensembleHandle[i].fill = 'rgba(255,255,255,0.3)';
        ensembleHandle[i].linewidth = 0;
    }

    el.addEventListener('click', function(e) {
        var centre = mapToCoord([e.clientX, e.clientY]);
        console.log(centre);

        for (i = 0; i < nEns; i++) {
            var u = Math.random(), v = Math.random();
            var theta = 2*Math.PI*u;
            ensemble_i[i][0] = centre[0] + Math.sin(theta)*(2*v-1);
            ensemble_i[i][1] = centre[1] + Math.sin(theta)*Math.sin(Math.acos(2*v-1));
            ensemble_i[i][2] = centre[2] + Math.cos(theta);
        }
    }, false);

    // Main loop
    two.bind("update", function(frameCount) {
        // Step ensemble forward
        for (i = 0; i < nEns; i++) {
            ensemble_f[i] = step(ensemble_i[i]);
        }
 
        // Update ensemble
        updateEnsemble(ensembleHandle, ensemble_i, ensemble_f);

        ensemble_i = ensemble_f.slice()
    });

    // Run main loop
    setInterval(function() {
        two.update();
    }, 24);

    function updateEnsemble(handles, locs_i, locs_f) {
        for (i = 0; i < nEns; i++) {
            var loc_px = mapToPx(locs_f[i])
            handles[i].translation.set(loc_px.x, loc_px.y);
            handles[i].scale = (24.0+locs_f[i][1])/30.0;

            handles[i].rotation = getRotation(locs_i[i], locs_f[i]);
        }
    }

    function mapToPx(state) {
        var buffer = 250.0;
        var max = [19.57, 27.18, 47.84], min = [-17.46, -23.16, 0.96];
        return {
            x: buffer/2 + (two.width - buffer)*(state[0] - min[0])/(max[0] - min[0]),
            y: two.height - (two.height - buffer)*(state[2] - min[2])/(max[2] - min[2]) - buffer/2
        };
    }

    function mapToCoord(loc_px) {
        var buffer = 250.0;
        var max = [19.57, 27.18, 47.84], min = [-17.46, -23.16, 0.96];
        return [
            (max[0] - min[0])*(loc_px[0] - buffer/2)/(two.width - buffer) + min[0],
            0.0,
            (max[2] - min[2])*(two.height - loc_px[1] - buffer/2)/(two.height - buffer) + min[2],
        ];
    }

    function getRotation(locs_i, locs_f) {
        var diffX = locs_f[0] - locs_i[0];
        var diffY = locs_f[2] - locs_i[2];

        return -Math.atan(diffY/diffX);
    }

    // Runge-Kutta integration
    function step(prev) {
        var k1 = ode(prev);
        var k2 = ode(math.add(prev, math.multiply(0.5*dt,k1)));

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
        var sigma = 10.0;
        return sigma * (y - x);
    }

    function dYdT(x, y, z) {
        var rho = 28.0;
        return x * (rho - z) - y;
    }

    function dZdT(x, y, z) {
        var beta = 8.0/3.0;
        return x * y - beta * z;
    }
}(document, window));
