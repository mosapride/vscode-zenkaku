// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
var vscode = require('vscode');

var enabled = false;

var appearanceSpace = {
    borderWidth: '1px',
    borderRadius: '2px',
    borderStyle: 'solid',
    light: {
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        borderColor: 'rgba(200, 200, 200, 0.4)'
    },
    dark: {
        backgroundColor: 'rgba(200, 200, 200, 0.3)',
        borderColor: 'rgba(0, 0, 0, 0.4)'
    }
};

var whitespaceDecorationSpace;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {

    EnableZenkaku();

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    var disposable1 = vscode.commands.registerCommand('extension.enableZenkaku', () => EnableZenkaku());

    function EnableZenkaku() {
        var activeEditor = vscode.window.activeTextEditor;
        if (activeEditor) {
            enabled = true;
            triggerUpdate();
        }

        vscode.window.onDidChangeActiveTextEditor(editor => {
            activeEditor = editor;
            if (editor) {
                triggerUpdate();
            }
        }, null, context.subscriptions);

        vscode.workspace.onDidChangeTextDocument(event => {
            if (activeEditor && event.document === activeEditor.document) {
                triggerUpdate();
            }
        }, null, context.subscriptions);

        var timeout = null;

        function triggerUpdate() {
            if (timeout) {
                clearTimeout(timeout);
            }
            timeout = setTimeout(updateDecorations, 100);
        }

        function updateDecorations() {
            if ((!activeEditor) || (!enabled)) {
                return;
            }

            if (whitespaceDecorationSpace == null) { whitespaceDecorationSpace = vscode.window.createTextEditorDecorationType(appearanceSpace); }

            var regExSpace = /\u3000/g;
            var text = activeEditor.document.getText();
            var whitespaceSpaceChars = [];

            var match;
            while (match = regExSpace.exec(text)) {
                var startPos = activeEditor.document.positionAt(match.index);
                var endPos = activeEditor.document.positionAt(match.index + match[0].length);
                var decoration = { range: new vscode.Range(startPos, endPos) };
                whitespaceSpaceChars.push(decoration);
            }
            activeEditor.setDecorations(whitespaceDecorationSpace, whitespaceSpaceChars);
        }
    }
    context.subscriptions.push(disposable1);

    var disposable2 = vscode.commands.registerCommand('extension.disableZenkaku', function() {
        cleanDecorations();
        enabled = false;
    });

    context.subscriptions.push(disposable2);

    function cleanDecorations() {
        if (whitespaceDecorationSpace != null) {
            whitespaceDecorationSpace.dispose();
            whitespaceDecorationSpace = null;
        }
    }
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}
exports.deactivate = deactivate;