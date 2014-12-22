importScripts('/js/esprima.js')

self.onmessage = function (event) {
    try {
        ast = esprima.parse(event.data); // May error
        self.postMessage(ast);
    } catch (err) {
        self.postMessage(null);
    }
};