(function(doc) {
    // Create two.js element
    var el = doc.getElementById("main"),
        two = new Two({
            fullscreen: true
        }).appendTo(el);
    
    two.renderer.domElement.style.backgroundColor = '#002b36';
    
    // Store initial screen dimensions
    var w = two.width,
        h = two.height;
    
    // Global parameters
    var dt = 0.01;
    var nEns = 10;
    var frames = 200;
    var rho = 2.5;
    var assim_freq = 2;
    var obsErr = 0.005;
    
    // Truth state vector
    var truth = [0, 0];
    
    var k = 0;
    
    var state = [0, 0];
    var stateVar = [0.1, 0];
    
    // Main loop
    two.bind("update", function(frameCount) {
        // Get state of UI
        updateFromUI();
    
        // Reset screen
        if (k == frames) {
            two.clear();
            k = 0;
        }
    
        // Step truth forward
        truth[1] = stepTruth(truth[0]);
    
        // Step ensemble forward
        state[1] = stepModel(state[0]);
        stateVar[1] = stateVar[0]*GPrime(stateVar[0])*GPrime(stateVar[0]);
    
        // Assimilate observation
        if (frameCount % assim_freq === 0) {
            var analysis = ekf(state[1], stateVar[1], truth[1]);
            state[1] = analysis.mean;
            stateVar[1] = analysis.var;
        }
    
        // Plot model state
        plotModel(state, stateVar, k);
        
        // Plot truth
        plotTruth(truth, k);
    
        k++;
    
        state[0] = state[1];
        stateVar[0] = stateVar[1];
        truth[0] = truth[1];
    });
    
    // Run main loop
    setInterval(function() {
        two.update();
    }, 30);
    
    function updateFromUI() {
        obsErr = 0.005 +
     doc.getElementById('inflation').value/10;
        assim_freq = 1 + parseInt(doc.getElementById('assim_freq').value/2);
    }
    
    function plotTruth(truth, k) {
        var line = two.makeLine(
                k*two.width/frames,
                mapToPx(truth[0]),
                (k+1)*two.width/frames,
                mapToPx(truth[1])
        );
        line.linewidth = 3;
        line.cap = 'round';
        line.stroke = '#dc322f';
    }
    
    function plotModel(state, stateVar, k) {
        var line = two.makeLine(
                k*two.width/frames,
                mapToPx(state[0]),
                (k+1)*two.width/frames,
                mapToPx(state[1])
        );
        var spread = two.makeLine(
                (k+1)*two.width/frames,
                mapToPx(state[1]+math.sqrt(stateVar[1])),
                (k+1)*two.width/frames,
                mapToPx(state[1]-math.sqrt(stateVar[1]))
        );
        line.linewidth = 2;
        line.cap = 'round';
        line.stroke = 'rgba(133,153,0,1)';
        spread.linewidth = 1;
        spread.cap = 'round';
        spread.stroke = 'rgba(133,153,0,0.7)';
    
    }
    
    function mapToPx(state) {
        return state * two.height/5 + two.height/2;
    }
    
    function stepTruth(x) {
        var sigma = 0.3;
        var db = Math.random()-0.5;
        return x + f(x)*dt + sigma*db;
    }
    
    function stepModel(x) {
        return x + f(x)*dt;
    }
    
    function f(x) {
        return -4 * x * (x*x - 1);
    }
    
    function GPrime(x) {
        return 1 - (12*x*x - 4)*dt;
    }
    
    function ekf(state, stateVar, truth) {
        var obs = truth + obsErr * (Math.random()-0.5);
    
        var K = stateVar / (stateVar + obsErr);
        var analysisMean = state + K * (obs - state);
        var analysisVar = (1 - K) * stateVar;
    
        return {'mean': analysisMean, 'var': analysisVar};
    }
}(document));
