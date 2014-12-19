/** Wire textarea to Esprima **/
var codearea = document.getElementById('code');
codearea.onkeyup = function () {
    var ast = esprima.parse(codearea.value);
};

/** Wire tests to feedback div **/
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

var test_ids = Object.keys(test_messages);

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
        test_report = 'Select tests below'
    }
    document.getElementById('feedback').innerHTML = test_report;
}

/** Test helpers **/
// Stores whether each test is on and passed
var test_status = {
    'forloop': {'on': false, 'pass': false},
    'noforloop': {'on': false, 'pass': false},
    'whileloop': {'on': false, 'pass': false},
    'nowhileloop': {'on': false, 'pass': false},
    'ifstatement': {'on': false, 'pass': false},
    'noifstatement': {'on': false, 'pass': false},
    'vardeclaration': {'on': false, 'pass': false},
    'novardeclaration': {'on': false, 'pass': false},
    'nestedforfor': {'on': false, 'pass': false},
    'nestedforwhile': {'on': false, 'pass': false},
    'nestedforif': {'on': false, 'pass': false},
    'nestedwhilefor': {'on': false, 'pass': false},
    'nestedwhilewhile': {'on': false, 'pass': false},
    'nestedwhileif': {'on': false, 'pass': false}
};

var test_opposites = {
    'forloop': 'noforloop',
    'noforloop': 'forloop',
    'whileloop': 'nowhileloop',
    'nowhileloop': 'whileloop',
    'ifstatement': 'noifstatement',
    'noifstatement': 'ifstatement',
    'vardeclaration': 'novardeclaration',
    'novardeclaration': 'vardeclaration'
}

// Assign onclick event to all checkboxes
inputs = document.getElementsByTagName('input');
for (var i = 0; i < inputs.length; i++) {
    var input = inputs[i];
    input.onclick = function (e) { 
        test_toggle(e.target.id)
    };
};

// Toggles each test
var test_toggle = function (test_id) {
    if (!test_status[test_id]['on']) {
        test_status[test_id] = {'on': true, 'pass': false};

        // Check if we should turn off the opposite test
        if (test_opposites[test_id] !== undefined) {
            var opposite_id = test_opposites[test_id];
            test_status[opposite_id] = {'on': false, 'pass': false};
            document.getElementById(opposite_id).checked = false;
        }

        // Check if a nested checkbox was toggled
        if (test_id.indexOf('nestedwhile') > -1) { 
            document.getElementById('nestedwhile').checked = true;
        } else if (test_id.indexOf('nestedfor') > -1) {
            document.getElementById('nestedfor').checked = true;
        }
    } else {
        test_status[test_id] = {'on': false, 'pass': false};

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
    }

    // Update the feedback console
    print_tests();
};

/** Tests **/

var assert_forloop = function () {

}

var assert_noforloop = function () {

}

var assert_whileloop = function () {

}

var assert_nowhileloop = function () {

}

var assert_ifstatement = function () {

}

var assert_noifstatement = function () {

}

var assert_vardeclaration = function () {

}

var assert_novardeclaration = function () {

}

var assert_nestedforfor = function () {

}

var assert_nestedforwhile = function () {

}

var assert_nestedforif = function () {

}

var assert_nestedwhilefor = function () {

}

var assert_nestedwhilewhile = function () {

}

var assert_nestedwhileif = function () {

}