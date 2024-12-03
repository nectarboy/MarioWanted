function generateLevel() {
    bros.length = 0;

    switch (level) {
        case 0: {
            const dist = 16;
            var candidates = [E_MARIO,E_LUIGI,E_WARIO,E_YOSHI];
            Helpers.scrambleArray(candidates);

            bros.push(new Bro(W/2 - dist, SH/2 - dist, 0, candidates[0], 0));
            bros.push(new Bro(W/2 + dist, SH/2 - dist, 0, candidates[1], 0));
            bros.push(new Bro(W/2 - dist, SH/2 + dist, 0, candidates[2], 0));
            bros.push(new Bro(W/2 + dist, SH/2 + dist, 0, candidates[3], 0));
            break;
        } 
        case 1: {
            generateLevel_grid(4,4);
            break;
        }
        case 2: {
            generateLevel_grid(8,6);
            break;
        }
        case 5: {
            const dist = 32;
            const speed = 1;
            const w = 8;
            const h = 6;

            for (var x = 0; x < w; x++) {
                for (var y = 0; y < h; y++) {
                    var bro = new Bro(W/2 + dist * (x - w/2 + 0.5), SH/2 + dist * (y - h/2 + 0.5), 0, getRandomUnwantedBroType(), 1);
                    bro.wrap = 2;
                    if (x === 0 || x === 5 || x === 6)
                        bro.vy = speed;
                    else
                        bro.vy = -speed;
                    bros.push(bro);
                }
            }

            var i = Helpers.randInt(0, bros.length-1);
            bros[i].bro = wantedbro;

            break;
        }
        case 3:
        case 4:
        case 6:
        case 7:
        case 8: {
            generateLevel_stillcrowd();
            break;
        }
        case 9: {
            const dist = 32;
            const w = 8;

            for (var x = 0; x < w; x++)
                bros.push(new Bro(W/2 + dist * (x - w/2 + 0.5), -4, 0, getRandomUnwantedBroType(), 0));

            var i = Helpers.randInt(0, bros.length-1);
            bros[i].bro = wantedbro;

            break;
        }
        default: {
            if (Math.random() < 0.5) {
                generateLevel_stillcrowd();
            }
            else {
                var type = Helpers.randInt(0,1);
                if (type === 0)
                    generateLevel_movingcrowd();
                else if (type === 1)
                    generateLevel_bouncingcrowd();
            }
            break;
        }
    }

    wantedbroi = 0;
    while (wantedbroi < bros.length) {
        if (bros[wantedbroi].bro === wantedbro)
            break;
        wantedbroi++;
    }
}

function generateLevel_grid(w,h) {
    const dist = 32;

    for (var x = 0; x < w; x++)
        for (var y = 0; y < h; y++)
            bros.push(new Bro(W/2 + dist * (x - w/2 + 0.5), SH/2 + dist * (y - h/2 + 0.5), 0, getRandomUnwantedBroType(), 0));

    var i = Helpers.randInt(0, bros.length-1);
    bros[i].bro = wantedbro;
}

function generateLevel_stillcrowd() {
    const w = 13;
    const h = 9;
    const paddingx = 8;
    const paddingy = 16;
    const offset = 2;
    const minholes = 30;
    const maxholes = 7;

    for (var x = 0; x < w; x++) {
        var xx = x/(w - 1) * (W - paddingx*2) + paddingx;
        for (var y = 0; y < h; y++) {
            var yy = y/(h - 1) * (SH - paddingy*2) + paddingy;
            bros.push(new Bro(xx + Helpers.randInt(-offset,offset), yy + Helpers.randInt(-offset,offset), Helpers.randInt(1,4), getRandomUnwantedBroType(), 0));
        }
    }

    var holes = Math.round(difficulty * (maxholes - minholes) + minholes) + Helpers.randInt(0,10);
    for (var i = 0; i < Math.round(holes); i++)
        bros.splice(Helpers.randInt(0, bros.length-1), 1);

    var wantedi = Helpers.randInt(0, bros.length-1);
    bros[wantedi].bro = wantedbro;

    if (level < 5)
        bros[wantedi].z = 5;
    else
        bros[wantedi].z = 0;

    difficulty += (1 - difficulty) * 0.1;
}

function generateLevel_movingcrowd() {
    const w = 13;
    const h = 9;
    const paddingx = 8;
    const paddingy = 16;
    const offset = 2;
    const minholes = 75;
    const maxholes = 25;

    var speeds = {};
    for (var i = BRO_START; i <= BRO_END; i++) {
        var speed = Helpers.randNum(0.5,1);
        var rad = Math.random() * Math.PI*2;
        speeds[i] = {
            x: Math.cos(rad) * speed,
            y: Math.sin(rad) * speed
        };
    }

    for (var x = 0; x < w; x++) {
        var xx = x/(w - 1) * (W - paddingx*2) + paddingx;
        for (var y = 0; y < h; y++) {
            var yy = y/(h - 1) * (SH - paddingy*2) + paddingy;
            var bro = new Bro(xx + Helpers.randInt(-offset,offset), yy + Helpers.randInt(-offset,offset), Helpers.randInt(1,4), getRandomUnwantedBroType(), 1);
            bro.wrap = 2;
            bro.vx = speeds[bro.bro].x;
            bro.vy = speeds[bro.bro].y;
            bros.push(bro);
        }
    }


    var holes = Math.round(difficulty * (maxholes - minholes) + minholes) + Helpers.randInt(0,5);
    for (var i = 0; i < Math.round(holes); i++)
        bros.splice(Helpers.randInt(0, bros.length-1), 1);

    var wantedi = Helpers.randInt(0, bros.length-1);
    bros[wantedi].bro = wantedbro;
    bros[wantedi].z = 0;
    bros[wantedi].vx *= 0.9;
    bros[wantedi].vy *= 0.9;

    difficulty += (1 - difficulty) * 0.1;
}

function generateLevel_bouncingcrowd() {
    const w = 13;
    const h = 9;
    const paddingx = 8;
    const paddingy = 16;
    const offset = 2;
    const minholes = 65;
    const maxholes = 35;

    for (var x = 0; x < w; x++) {
        var xx = x/(w - 1) * (W - paddingx*2) + paddingx;
        for (var y = 0; y < h; y++) {
            var yy = y/(h - 1) * (SH - paddingy*2) + paddingy;
            var bro = new Bro(xx + Helpers.randInt(-offset,offset), yy + Helpers.randInt(-offset,offset), Helpers.randInt(1,4), getRandomUnwantedBroType(), 1);
            bro.bounce = true;

            var speed = Helpers.randNum(0.5,1);
            var rad = Math.random() * Math.PI*2;
            bro.vx = Math.cos(rad) * speed;
            bro.vy = Math.sin(rad) * speed;
            bros.push(bro);
        }
    }


    var holes = Math.round(difficulty * (maxholes - minholes) + minholes) + Helpers.randInt(0,5);
    for (var i = 0; i < Math.round(holes); i++)
        bros.splice(Helpers.randInt(0, bros.length-1), 1);

    var wantedi = Helpers.randInt(0, bros.length-1);
    bros[wantedi].bro = wantedbro;
    bros[wantedi].z = 0;
    bros[wantedi].vx *= 0.9;
    bros[wantedi].vy *= 0.9;

    difficulty += (1 - difficulty) * 0.1;
}