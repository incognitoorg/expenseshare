{
    "baseUrl": "war/static-resources",
    "include": "../page-js/fem.js",
    "optimize": "uglify2",
    "uglify": {
        "toplevel": true,
        "ascii_only": true,
        "beautify": true,
        "max_line_length": 1000,
        "defines": {
            "DEBUG": [
                "name",
                "false"
            ]
        },
        "no_mangle": true
    },
    "uglify2": {
        "output": {
            "beautify": false
        },
        "compress": {
            "sequences": true,
            "join_vars": true,
            "if_return": true,
            "properties": true,
            "conditionals": true,
            "comparisons": true,
            "evaluate": true,
            "booleans": true,
            "loops": true,
            "drop_debugger": true,
            "dead_code": true
        },
        "warnings": true,
        "mangle": false
    },
    "closure": {
        "CompilerOptions": {},
        "CompilationLevel": "SIMPLE_OPTIMIZATIONS",
        "loggingLevel": "WARNING"
    },
    "skipModuleInsertion": false,
    "paths": {
        "backbone": "libraries/backbone/backbone.min",
        "jquery": "libraries/jquery/jquery-2.0.0.min",
        "underscore": "libraries/underscore/underscore.min",
        "handlebars": "libraries/handlebars/handlebarshelpers",
        "handlebarshelpers": "libraries/handlebars/handlebars",
        "css": "libraries/require/css",
        "normalize": "libraries/require/normalize",
        "async": "libraries/require/async",
        "text": "libraries/require/text",
        "facade": "core/facade",
        "envvariables": "core/envvariables",
        "sandbox": "core/sandbox",
        "locallayer": "core/locallayer",
        "mediator": "core/mediator",
        "debugmode": "libraries/debugmode/debugmode",
        "errorlogger": "libraries/errorlogger/errorlogger",
        "persistence": "libraries/lawnchair/lawnchair",
        "fbapioauth": "components/fbapi/fbapi-web",
        "googleapioauth": "components/googleapi/googleapi-web",
        "autocomplete": "libraries/jquery-ui/js/ui/minified/jquery.ui.autocomplete.min",
        "uicore": "libraries/jquery-ui/js/ui/minified/jquery.ui.core.min",
        "uiwidget": "libraries/jquery-ui/js/ui/minified/jquery.ui.widget.min",
        "uimenu": "libraries/jquery-ui/js/ui/minified/jquery.ui.menu.min",
        "uiposition": "libraries/jquery-ui/js/ui/minified/jquery.ui.position.min",
        "animate": "plugins/jquery/animate-enhanced/jquery.animate-enhanced.min"
    },
    "shim": {
        "backbone": {
            "deps": [
                "underscore",
                "jquery"
            ],
            "exports": "Backbone"
        },
        "handlebars": {
            "deps": [
                "handlebarshelpers"
            ]
        },
        "persistence": {
            "exports": "Lawnchair"
        },
        "animate": {
            "deps": [
                "jquery"
            ]
        },
        "autocomplete": {
            "deps": [
                "jquery",
                "uicore",
                "uiwidget",
                "uimenu",
                "uiposition"
            ]
        },
        "uimenu": {
            "deps": [
                "uiwidget"
            ]
        }
    },
    "inlineText": true,
    "dir": "war/built-static-resources",
    "modules": [
        {
            "name": "bootloaders/fembootloader/fembootloader",
            "include": [
                "bootloaders/fembootloader/fembootloader"
            ],
            "exclude": []
        },
        {
            "name": "plugins/jquery/formvalidation/formvalidation",
            "include": [
                "plugins/jquery/formvalidation/formvalidation"
            ],
            "exclude": [
                "backbone",
                "handlebars",
                "underscore",
                "jquery",
                "bootloaders/fembootloader/fembootloader"
            ]
        },
        {
            "name": "components/login/login",
            "include": [
                "components/login/login"
            ],
            "exclude": [
                "backbone",
                "handlebars",
                "underscore",
                "jquery",
                "bootloaders/fembootloader/fembootloader"
            ]
        },
        {
            "name": "modules/fem/fem",
            "include": [
                "modules/fem/fem"
            ],
            "exclude": [
                "backbone",
                "handlebars",
                "underscore",
                "jquery",
                "bootloaders/fembootloader/fembootloader",
                "components/login/login"
            ]
        },
        {
            "name": "modules/addgroup/addgroup",
            "include": [
                "modules/addgroup/addgroup"
            ],
            "exclude": [
                "backbone",
                "handlebars",
                "underscore",
                "jquery",
                "bootloaders/fembootloader/fembootloader",
                "components/login/login",
                "modules/fem/fem",
                "plugins/jquery/formvalidation/formvalidation"
            ]
        },
        {
            "name": "modules/selectgroup/selectgroup",
            "include": [
                "modules/selectgroup/selectgroup"
            ],
            "exclude": [
                "backbone",
                "handlebars",
                "underscore",
                "jquery",
                "bootloaders/fembootloader/fembootloader",
                "components/login/login",
                "modules/fem/fem",
                "modules/addgroup/addgroup"
            ]
        },
        {
            "name": "modules/expenseutiliy/expenseutility",
            "include": [
                "modules/selectgroup/selectgroup"
            ],
            "exclude": [
                "backbone",
                "handlebars",
                "underscore",
                "jquery",
                "bootloaders/fembootloader/fembootloader",
                "components/login/login",
                "modules/fem/fem",
                "modules/addgroup/addgroup"
            ]
        },
        {
            "name": "modules/newexpense/newexpense",
            "include": [
                "modules/newexpense/newexpense"
            ],
            "exclude": [
                "backbone",
                "handlebars",
                "underscore",
                "jquery",
                "bootloaders/fembootloader/fembootloader",
                "components/login/login",
                "modules/fem/fem",
                "modules/addgroup/addgroup",
                "modules/selectgroup/selectgroup",
                "plugins/jquery/formvalidation/formvalidation",
                "modules/expenseutiliy/expenseutility"
            ]
        },
        {
            "name": "modules/expensehistory/expensehistory",
            "include": [
                "modules/expensehistory/expensehistory"
            ],
            "exclude": [
                "backbone",
                "handlebars",
                "underscore",
                "jquery",
                "bootloaders/fembootloader/fembootloader",
                "components/login/login",
                "modules/fem/fem",
                "modules/addgroup/addgroup",
                "modules/selectgroup/selectgroup",
                "modules/newexpense/newexpense",
                "modules/expenseutiliy/expenseutility"
            ]
        },
        {
            "name": "modules/editgroup/editgroup",
            "include": [
                "modules/expensehistory/expensehistory"
            ],
            "exclude": [
                "backbone",
                "handlebars",
                "underscore",
                "jquery",
                "bootloaders/fembootloader/fembootloader",
                "components/login/login",
                "modules/fem/fem",
                "modules/addgroup/addgroup",
                "modules/selectgroup/selectgroup",
                "modules/newexpense/newexpense",
                "modules/expensehistory/expensehistory"
            ]
        },
        {
            "name": "modules/dashboard/dashboard",
            "include": [
                "modules/dashboard/dashboard"
            ],
            "exclude": [
                "backbone",
                "handlebars",
                "underscore",
                "jquery",
                "bootloaders/fembootloader/fembootloader",
                "components/login/login",
                "modules/fem/fem",
                "modules/addgroup/addgroup",
                "modules/selectgroup/selectgroup",
                "modules/newexpense/newexpense",
                "modules/expensehistory/expensehistory"
            ]
        },
        {
            "name": "modules/profile/profile",
            "include": [
                "modules/profile/profile"
            ],
            "exclude": [
                "backbone",
                "handlebars",
                "underscore",
                "jquery",
                "bootloaders/fembootloader/fembootloader",
                "components/login/login",
                "modules/fem/fem",
                "modules/addgroup/addgroup",
                "modules/selectgroup/selectgroup",
                "modules/newexpense/newexpense",
                "modules/expensehistory/expensehistory",
                "modules/dashboard/dashboard"
            ]
        },
        {
        	"name" :"autocomplete",
            "include": ["autocomplete"],
        	"exclude": ["backbone","handlebars","underscore","jquery", "bootloaders/fembootloader/fembootloader","components/login/login", "modules/fem/fem","modules/addgroup/addgroup","modules/selectgroup/selectgroup", "modules/newexpense/newexpense", "modules/expensehistory/expensehistory","modules/dashboard/dashboard"]
        }
    ]
}