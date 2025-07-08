"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
function activate(context) {
    vscode.workspace.onDidCreateFiles((event) => {
        const config = vscode.workspace.getConfiguration("autoRenameFile").get("config");
        if (!config.length) {
            return;
        }
        const currentFileURI = vscode.Uri.file(event.files[0].path);
        const resultMapping = isTargetFile(config, currentFileURI);
        if (resultMapping) {
            performRename(currentFileURI, resultMapping);
        }
    });
    async function performRename(currentFileURI, resultMapping) {
        const wsedit = new vscode.WorkspaceEdit();
        const newFileURI = vscode.Uri.file(currentFileURI.path.replace(resultMapping.from, resultMapping.to));
        if (await doesFileExist(newFileURI)) {
            vscode.window.showErrorMessage(`Auto Rename File: ${newFileURI.path} already exists`);
            return;
        }
        wsedit.renameFile(currentFileURI, newFileURI);
        checkInsertText(resultMapping, wsedit, newFileURI);
        vscode.workspace.applyEdit(wsedit);
    }
    async function doesFileExist(testURI) {
        try {
            await vscode.workspace.fs.stat(testURI);
        }
        catch {
            return false;
        }
        return true;
    }
    function isTargetFile(config, currentFileURI) {
        let result = null;
        config.forEach((mapping) => {
            if (currentFileURI.path.endsWith(mapping.from)) {
                result = mapping;
                return;
            }
        });
        return result;
    }
    function checkInsertText(resultMapping, wsedit, newFileURI) {
        if (resultMapping.insertText) {
            wsedit.insert(newFileURI, new vscode.Position(0, 0), resultMapping.insertText);
        }
    }
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map