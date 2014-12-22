/** Initialize CodeMirror **/
var cm_config = {
    lineNumbers: true, 
    autofocus: true, 
    indentUnit: 4, 
    mode: 'javascript',
};
var cm = CodeMirror.fromTextArea(document.getElementById('code'), cm_config);

/** Link CodeMirror to Esprima (with web worker) **/
var ast; 
if (window.Worker) {
    // Set up our web worker
    var parser = new Worker('/js/esprima-worker.js');
    parser.onmessage = function (event) {
        if (event.data !== null) {
            ast = event.data;
            run_tests();
            print_tests();
        }        
    };
    // Link CodeMirror to worker
    cm.on('change', function(cm) {
        parser.postMessage(cm.getValue());
    });
} else {
    // No web worker support; parse in browser 
    cm.on('change', function(cm) {
        try {
            ast = esprima.parse(cm.getValue()); // May error
            run_tests();
            print_tests();
        } catch (err) {}
    });
}

/** Link tests to feedback console **/
// Store all the test names
var test_ids = ['forloop', 'noforloop', 'whileloop', 'nowhileloop', 'ifstatement', 
                'noifstatement', 'vardeclaration', 'novardeclaration', 'nestedforfor', 
                'nestedforwhile', 'nestedforif', 'nestedwhilefor', 'nestedwhilewhile', 
                'nestedwhileif'];

// Messages for the feedback console
var test_messages = {
    'forloop': 'Your code must have a for loop.',
    'noforloop': 'Your code cannot have a for loop.',
    'whileloop': 'Your code must have a while loop.',
    'nowhileloop': 'Your code cannot have a while loop.',
    'ifstatement': 'Your code must have an if statement.',
    'noifstatement': 'Your code cannot have an if statement.',
    'vardeclaration': 'Your code must declare a variable.',
    'novardeclaration': 'Your code cannot declare a variable.',
    'nestedforfor': 'Your code must have a for loop inside a for loop.',
    'nestedforwhile': 'Your code must have a while loop inside a for loop.',
    'nestedforif': 'Your code must have an if statement inside a for loop.',
    'nestedwhilefor': 'Your code must have a for loop inside a while loop.',
    'nestedwhilewhile': 'Your code must have a while loop inside a while loop.',
    'nestedwhileif': 'Your code must have an if statement inside a while loop.'
};

// Print statuses of running tests to feedback console
var print_tests = function () {
    var test_report = '';
    for (var i = 0; i < test_ids.length; i++) {
        var test_id = test_ids[i];
        var test = test_status[test_id];
        if (test['on']) {
            if (test['pass']) {
                test_report += '<div class="pass">&#x2713;&nbsp;&nbsp;';
            } else {
                test_report += '<div class="fail">&#x2717;&nbsp;&nbsp;';
            }
            test_report += test_messages[test_id] + '</div>';
        }
    }
    if (test_report === '') {
        test_report = 'Select tests below';
    }
    document.getElementById('feedback').innerHTML = test_report;
};

/** Test helpers **/
// Assign onclick event to all checkboxes
var inputs = document.getElementsByTagName('input');
for (var i = 0; i < inputs.length; i++) {
    var input = inputs[i];
    input.onclick = function (event) { 
        event = event || window.event;
        var test_id = (event.target || event.srcElement).id;
        toggle_test(test_id);
    };
}

// Stores whether each test is on and passed
var test_status = {
    'forloop': {'on': false, 'pass': false},
    'noforloop': {'on': false, 'pass': true},
    'whileloop': {'on': false, 'pass': false},
    'nowhileloop': {'on': false, 'pass': true},
    'ifstatement': {'on': false, 'pass': false},
    'noifstatement': {'on': false, 'pass': true},
    'vardeclaration': {'on': false, 'pass': false},
    'novardeclaration': {'on': false, 'pass': true},
    'nestedforfor': {'on': false, 'pass': false},
    'nestedforwhile': {'on': false, 'pass': false},
    'nestedforif': {'on': false, 'pass': false},
    'nestedwhilefor': {'on': false, 'pass': false},
    'nestedwhilewhile': {'on': false, 'pass': false},
    'nestedwhileif': {'on': false, 'pass': false}
};

// Stores pairs of opposite tests
var test_opposites = {
    'forloop': 'noforloop',
    'noforloop': 'forloop',
    'whileloop': 'nowhileloop',
    'nowhileloop': 'whileloop',
    'ifstatement': 'noifstatement',
    'noifstatement': 'ifstatement',
    'vardeclaration': 'novardeclaration',
    'novardeclaration': 'vardeclaration'
};

// Toggles tests appropriately (when checkbox is clicked)
var toggle_test = function (test_id) {
    if (test_status[test_id]['on']) {
        test_status[test_id]['on'] = false;

        // Check if there are no nested tests on
        if (!test_status['nestedforfor']['on'] && 
            !test_status['nestedforwhile']['on'] &&
            !test_status['nestedforif']['on']) {
            document.getElementById('nestedfor').checked = false;
        }
        if (!test_status['nestedwhilefor']['on'] && 
            !test_status['nestedwhilewhile']['on'] &&
            !test_status['nestedwhileif']['on']) {
            document.getElementById('nestedwhile').checked = false;
        }
    } else {
        test_status[test_id]['on'] = true;

        // Check if we should turn off the opposite test
        if (test_opposites[test_id] !== undefined) {
            var opposite_id = test_opposites[test_id];
            test_status[opposite_id]['on'] = false;
            document.getElementById(opposite_id).checked = false;
        }

        // Check if a nested checkbox was toggled
        if (test_id.indexOf('nestedwhile') > -1) { 
            document.getElementById('nestedwhile').checked = true;
        } else if (test_id.indexOf('nestedfor') > -1) {
            document.getElementById('nestedfor').checked = true;
        }
    }
    // Run tests, update the feedback console
    run_tests();
    print_tests();
};

/** Tests **/
// Runs all tests
var run_tests = function() {
    for (var i = 0; i < test_ids.length; i++) {
        var test_id = test_ids[i];
        if (test_status[test_id]['on']) {
            id_to_test[test_id](ast); // Execute appropriate test function
        }
    }
};

// Test for for loop
var assert_forloop = function (ast) {
    test_status['forloop']['pass'] = false;

    estraverse.traverse(ast, {
        enter: function(node){
            if (node.type == 'ForStatement') {
                test_status['forloop']['pass'] = true;
                return estraverse.VisitorOption.Break;
            }
        }
    });
};

// Test for no for loop
var assert_noforloop = function (ast) {
    test_status['noforloop']['pass'] = true;

    estraverse.traverse(ast, {
        enter: function(node){
            if (node.type == 'ForStatement') {
                test_status['noforloop']['pass'] = false;
                return estraverse.VisitorOption.Break;
            }
        }
    });
};

// Test for while loop
var assert_whileloop = function (ast) {
    test_status['whileloop']['pass'] = false;

    estraverse.traverse(ast, {
        enter: function(node){
            if (node.type == 'WhileStatement') {
                test_status['whileloop']['pass'] = true;
                return estraverse.VisitorOption.Break;
            }
        }
    });
};

// Test for no while loop
var assert_nowhileloop = function (ast) {
    test_status['nowhileloop']['pass'] = true;

    estraverse.traverse(ast, {
        enter: function(node){
            if (node.type == 'WhileStatement') {
                test_status['nowhileloop']['pass'] = false;
                return estraverse.VisitorOption.Break;
            }
        }
    });
};

// Test for if statement
var assert_ifstatement = function (ast) {
    test_status['ifstatement']['pass'] = false;

    estraverse.traverse(ast, {
        enter: function(node){
            if (node.type == 'IfStatement') {
                test_status['ifstatement']['pass'] = true;
                return estraverse.VisitorOption.Break;
            }
        }
    });
};

// Test for no if statement 
var assert_noifstatement = function (ast) {
    test_status['noifstatement']['pass'] = true;

    estraverse.traverse(ast, {
        enter: function(node){
            if (node.type == 'IfStatement') {
                test_status['noifstatement']['pass'] = false;
                return estraverse.VisitorOption.Break;
            }
        }
    });
};

// Test for variable declaration
var assert_vardeclaration = function (ast) {
    test_status['vardeclaration']['pass'] = false;

    estraverse.traverse(ast, {
        enter: function(node){
            if (node.type == 'VariableDeclaration') {
                test_status['vardeclaration']['pass'] = true;
                return estraverse.VisitorOption.Break;
            }
        }
    });
};

// Test for no variable declaration
var assert_novardeclaration = function (ast) {
    test_status['novardeclaration']['pass'] = true;

    estraverse.traverse(ast, {
        enter: function(node){
            if (node.type == 'VariableDeclaration') {
                test_status['novardeclaration']['pass'] = false;
                return estraverse.VisitorOption.Break;
            }
        }
    });
};

// Test for a for loop inside a for loop
var assert_nestedforfor = function (ast) {
    test_status['nestedforfor']['pass'] = false;

    estraverse.traverse(ast, {
        enter: function(node){
            if (node.type == 'ForStatement') {
                var nested_nodes = node.body.body;
                for (var i = 0; i < nested_nodes.length; i++) {
                    if (nested_nodes[i].type == 'ForStatement') {
                        test_status['nestedforfor']['pass'] = true;
                        return estraverse.VisitorOption.Break;
                    }
                }   
            }
        }
    });
};

// Test for a while loop inside a for loop
var assert_nestedforwhile = function (ast) {
    test_status['nestedforwhile']['pass'] = false;

    estraverse.traverse(ast, {
        enter: function(node){
            if (node.type == 'ForStatement') {
                var nested_nodes = node.body.body;
                for (var i = 0; i < nested_nodes.length; i++) {
                    if (nested_nodes[i].type == 'WhileStatement') {
                        test_status['nestedforwhile']['pass'] = true;
                        return estraverse.VisitorOption.Break;
                    }
                }   
            }
        }
    });
};

// Test for an if statement inside a for loop
var assert_nestedforif = function (ast) {
    test_status['nestedforif']['pass'] = false;

    estraverse.traverse(ast, {
        enter: function(node){
            if (node.type == 'ForStatement') {
                var nested_nodes = node.body.body;
                for (var i = 0; i < nested_nodes.length; i++) {
                    if (nested_nodes[i].type == 'IfStatement') {
                        test_status['nestedforif']['pass'] = true;
                        return estraverse.VisitorOption.Break;
                    }
                }   
            }
        }
    });
};

// Test for a for loop inside a while loop
var assert_nestedwhilefor = function (ast) {
    test_status['nestedwhilefor']['pass'] = false;

    estraverse.traverse(ast, {
        enter: function(node){
            if (node.type == 'WhileStatement') {
                var nested_nodes = node.body.body;
                for (var i = 0; i < nested_nodes.length; i++) {
                    if (nested_nodes[i].type == 'ForStatement') {
                        test_status['nestedwhilefor']['pass'] = true;
                        return estraverse.VisitorOption.Break;
                    }
                }   
            }
        }
    });
};

// Test for a while loop inside a while loop
var assert_nestedwhilewhile = function (ast) {
    test_status['nestedwhilewhile']['pass'] = false;

    estraverse.traverse(ast, {
        enter: function(node){
            if (node.type == 'WhileStatement') {
                var nested_nodes = node.body.body;
                for (var i = 0; i < nested_nodes.length; i++) {
                    if (nested_nodes[i].type == 'WhileStatement') {
                        test_status['nestedwhilewhile']['pass'] = true;
                        return estraverse.VisitorOption.Break;
                    }
                }   
            }
        }
    });
};

// Test for an if statement inside a while loop
var assert_nestedwhileif = function (ast) {
    test_status['nestedwhileif']['pass'] = false;

    estraverse.traverse(ast, {
        enter: function(node){
            if (node.type == 'WhileStatement') {
                var nested_nodes = node.body.body;
                for (var i = 0; i < nested_nodes.length; i++) {
                    if (nested_nodes[i].type == 'IfStatement') {
                        test_status['nestedwhileif']['pass'] = true;
                        return estraverse.VisitorOption.Break;
                    }
                }   
            }
        }
    });
};

// Maps test_id to test function
var id_to_test = {
    'forloop': assert_forloop,
    'noforloop': assert_noforloop,
    'whileloop': assert_whileloop,
    'nowhileloop': assert_nowhileloop,
    'ifstatement': assert_ifstatement,
    'noifstatement': assert_noifstatement,
    'vardeclaration': assert_vardeclaration,
    'novardeclaration': assert_novardeclaration,
    'nestedforfor': assert_nestedforfor,
    'nestedforwhile': assert_nestedforwhile,
    'nestedforif': assert_nestedforif,
    'nestedwhilefor': assert_nestedwhilefor,
    'nestedwhilewhile': assert_nestedwhilewhile,
    'nestedwhileif': assert_nestedwhileif
};