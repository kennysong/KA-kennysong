// Wire textarea to esprima
var codearea = document.getElementById('code');
codearea.onkeyup = function() {
    var ast = esprima.parse(codearea.value);
    document.getElementById('feedback').innerHTML = JSON.stringify(ast, null, 4);
};