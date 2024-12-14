class Loop {
    constructor() {
        var loop = this;

        // should be priv
        this.state = 0;
        this.frameid = null;
        this.paused = true;
        this.hidden = false;
        this.framerequested = false;

        // latch
        this.onUpdate = () => {};

        // settings
        this.doframeskip = false; // no frameskip WILL be slower, it is what it is
        this.dosmoothnesshack = false; // Smoothness hack: causes the occaisional hiccup but fixes common persistent choppy fps for some users.
        this.msPerFrame = 1000/60;

        // internal stuff
        this.prevtimeelapsed = 0;
        this.timeelapsed = 0;
        this.excesstimespent = 0;
        this.firstframe = false;

        var frameintervalms = this.msPerFrame;
        var requestAnimFrame = window.requestAnimationFrame
            ? window.requestAnimationFrame
            : func => window.setTimeout(func, 1000/60);

        var cancelAnimFrame = window.cancelAnimationFrame
            ? window.cancelAnimationFrame
            : window.clearTimeout;

        var anonGameLoop = () => loop.gameLoop();

        // looping
        this.gameLoop = function() {
            if (this.paused)
                return;

            var time0 = performance.now();

            if (this.doframeskip) {
                if (this.firstframe) {
                    this.prevtimeelapsed = performance.now();
                    this.firstframe = false;
                }
                else {
                    this.prevtimeelapsed = this.timeelapsed;
                }

                this.timeelapsed = performance.now();
                this.excesstimespent += this.timeelapsed - this.prevtimeelapsed;

                while (this.excesstimespent >= 0) {
                    this.excesstimespent -= frameintervalms;

                    if (this.dosmoothnesshack && this.excesstimespent < -10) { // -15? -10? -7.5? the higher, the less frequent
                        console.log('smoothing loop ...');
                        this.excesstimespent -= 1;
                        //this.excesstimespent -= (this.dosmoothnesshack && this.excesstimespent < -7.5); // -= 1
                    }

                    this.onUpdate();
                }
            }
            else {
                this.firstframe = true;
                this.onUpdate();
            }

            this.frameid = requestAnimFrame(anonGameLoop);
            //this.frameid = window.setTimeout(anonGameLoop, 1000/60 - (performance.now() - time0));
        };

        this.start = function() {
            if (!this.paused)
                return;
            this.paused = false;
            this.firstframe = true;
            this.prevtimeelapsed = 0;
            this.timeelapsed = 0;
            this.excesstimespent = 0;

            //this.interval = setInterval(() => loop.gameLoop(), frameintervalms);
            this.gameLoop();
        };
        this.stop = function() {
            if (this.paused)
                return;
            this.paused = true;
            this.firstframe = false;

            cancelAnimFrame(this.frameid);
            //clearTimeout(this.frameid);
            this.frameid = null;
        };

        this.getFPS = function() {
            return 1000 / (this.timeelapsed - this.prevtimeelapsed);
        };

        // dont run when out of browser or unfocused
        var browservisibilitypaused = true;
        document.addEventListener('visibilitychange', e => {
            if (document.visibilityState === 'visible') {
                this.hidden = false;

                if (!browservisibilitypaused) {
                    loop.start();
                }
                //console.log('unhidden tab', browservisibilitypaused, this.paused); // THIS IS SO ANNOYING WHY DID I KEEP THIS SO LONG
            }
            else {
                if (this.hidden)
                    return;
                this.hidden = true;

                browservisibilitypaused = this.paused;
                loop.stop();
                //console.log('hidden tab', browservisibilitypaused, this.paused);
            }
        });
        
        // window.addEventListener('focus', e => {
        //     this.hidden = false;

        //     if (!browservisibilitypaused) {
        //         loop.start();
        //     }
        //     console.log('focused window, started'/*, browservisibilitypaused, this.paused*/);
        // });
        // window.addEventListener('blur', e => {
        //     if (this.hidden)
        //         return;
        //     this.hidden = true;

        //     browservisibilitypaused = this.paused;
        //     loop.stop();
        //     console.log('unfocused window, stopped'/*, browservisibilitypaused, this.paused*/);
        // });

    }
}