class Assets {
    constructor() {};
    static loadAsset(assetsobj, id, type, src, onLoad, onError) {

        // data loading
        var data;
        switch (type) {
            case 'image': {
                data = new Image();
                data.onload = () => {assetsobj[id] = data; onLoad()};
                data.onerror = () => onError(`Error loading image asset (${id})!`);
                data.src = src;
                break;
            }
            case 'audio': {
                // data = new Audio();
                // // var condition = 0;
                // // function conditionMet(e) {
                // //     condition++;
                // //     if (condition === 1) {
                // //         condition = 0;
                // //         onLoad();
                // //     }
                // // }
                // //assets[name].oncanplay = conditionMet;
                // data.onloadeddata = () => {assetsobj[id] = data; onLoad()};
                // data.onerror = () => onError(`Error loading audio asset (${id})!`);
                // data.src = src;
                // data.load();

                const AudioContext = window.AudioContext || window.webkitAudioContext;
                var audioCtx = new AudioContext();
                var audioFile = fetch(src).then(response => response.arrayBuffer()).then(buffer => audioCtx.decodeAudioData(buffer)).then(buffer => {
                    assetsobj[id] = buffer;
                    onLoad();
                });
                break;
            }
            case 'font': {
                data = new FontFace(id, `url('${src}')`);

                data.load().then(font => {
                    document.fonts.add(font);
                    assetsobj[id] = data; 
                    onLoad();
                }).catch(e => {
                    onError(`Error loading font asset (${id})! Details: '${e}'`);
                });
                break;
            }

            default: {
                onError(`Unknown asset type (${type})!`);
            }
        }
    }

        /*
            a bundle consists of:
            [
                [id, type, src],
                [id, type, src],
                ...
            ]
        */

    static loadAssetBundle(assetsobj, bundle, onLoad, onFinalLoad, onError) {
        var assetsloaded = 0;
        var erroroccured = false;

        function onLoadHandler() {
            if (erroroccured)
                return;

            assetsloaded++;

            // everything done
            if (assetsloaded === bundle.length) {
                onFinalLoad();
            }
            // still assets left
            else {
                onLoad(assetsloaded-1, bundle.length);
            }
        }
        function onErrorHandler(e='?') {
            erroroccured = true;
            console.log('error loading bundle!! details below');
            console.log(e);

            onError(e);
        }

        for (var i = 0; i < bundle.length; i++) {
            if (erroroccured)
                break;

            var assetarr = bundle[i];
            var id = assetarr[0];
            var type = assetarr[1];
            var src = assetarr[2];

            // load
            this.loadAsset(assetsobj, id, type, src, onLoadHandler, onErrorHandler)
        }
    }
}