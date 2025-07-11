"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
// this file is just a sample of the main file of vscode extention.
const vscode = require("vscode");
const vscode_1 = require("vscode");
const documentDecorationManager_1 = require("./documentDecorationManager");
function activate(context) {
    let documentDecorationManager = new documentDecorationManager_1.default();
    vscode_1.extensions.onDidChange(() => restart());
    context.subscriptions.push(vscode_1.commands.registerCommand("bracket-pair-colorizer-2.expandBracketSelection", () => { }), vscode_1.commands.registerCommand("bracket-pair-colorizer-2.undoBracketSelection", () => { }), vscode_1.workspace.onDidChangeConfiguration((event) => {
        if (event.affectsConfiguration("bracket-pair-colorizer-2") ||
            event.affectsConfiguration("editor.lineHeight") ||
            event.affectsConfiguration("editor.fontSize")) {
            restart();
        }
    }), vscode.window.onDidChangeVisibleTextEditors(() => {
        documentDecorationManager.updateAllDocuments();
    }), vscode_1.workspace.onDidChangeTextDocument((event) => {
        if (event.contentChanges.length > 0) {
            // documentDecorationManager.onDidChangeTextDocument(event);
        }
    }), vscode_1.workspace.onDidCloseTextDocument((event) => {
        documentDecorationManager.onDidCloseTextDocument(event);
    }), vscode_1.workspace.onDidOpenTextDocument((event) => {
        // documentDecorationManager.onDidOpenTextDocument(event);
    }), vscode.window.onDidChangeTextEditorSelection((event) => { }));
    documentDecorationManager.updateAllDocuments();
    function restart() {
        documentDecorationManager.Dispose();
        documentDecorationManager = new documentDecorationManager_1.default();
        documentDecorationManager.updateAllDocuments();
    }
}
exports.activate = activate;
// tslint:disable-next-line:no-empty
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map