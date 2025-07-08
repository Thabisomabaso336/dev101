"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = void 0;
const assert_1 = require("assert");
require("source-map-support/register");
const vscode = require("vscode");
const vscode_languageclient_1 = require("vscode-languageclient");
const createLanguageClientProxy_1 = require("./createLanguageClientProxy");
const assertDefined = val => {
    if (val === undefined || val === null) {
        throw new assert_1.AssertionError({
            message: `Expected 'value' to be defined, but received ${val}`
        });
    }
};
const autoRenameTagRequestType = new vscode_languageclient_1.RequestType('$/auto-rename-tag');
// TODO implement max concurrent requests
const askServerForAutoCompletionsElementRenameTag = async (languageClientProxy, document, tags) => {
    const params = {
        textDocument: languageClientProxy.code2ProtocolConverter.asVersionedTextDocumentIdentifier(document),
        tags
    };
    return languageClientProxy.sendRequest(autoRenameTagRequestType, params);
};
/**
 * Utility variable that stores the last changed version (document.uri.fsPath and document.version)
 * When a change was caused by auto-rename-tag, we can ignore that change, which is a simple performance improvement. One thing to take care of is undo, but that works now (and there are test cases).
 */
let lastChangeByAutoRenameTag = {
    fsPath: '',
    version: -1
};
const applyResults = async (results) => {
    assertDefined(vscode.window.activeTextEditor);
    const prev = vscode.window.activeTextEditor.document.version;
    const applied = await vscode.window.activeTextEditor.edit(editBuilder => {
        assertDefined(vscode.window.activeTextEditor);
        for (const result of results) {
            const startPosition = vscode.window.activeTextEditor.document.positionAt(result.startOffset);
            const endPosition = vscode.window.activeTextEditor.document.positionAt(result.endOffset);
            const range = new vscode.Range(startPosition, endPosition);
            editBuilder.replace(range, result.tagName);
        }
    }, {
        undoStopBefore: false,
        undoStopAfter: false
    });
    const next = vscode.window.activeTextEditor.document.version;
    if (!applied) {
        return;
    }
    if (prev + 1 !== next) {
        return;
    }
    for (const result of results) {
        const oldWordAtOffset = wordsAtOffsets[result.originalOffset];
        delete wordsAtOffsets[result.originalOffset];
        let moved = 0;
        if (result.originalWord.startsWith('</')) {
            moved = result.endOffset - result.startOffset + 2;
        }
        wordsAtOffsets[result.originalOffset + moved] = {
            newWord: oldWordAtOffset && oldWordAtOffset.newWord,
            oldWord: result.originalWord
        };
    }
    lastChangeByAutoRenameTag = {
        fsPath: vscode.window.activeTextEditor.document.uri.fsPath,
        version: vscode.window.activeTextEditor.document.version
    };
};
let latestCancelTokenSource;
let previousText;
const tagNameReLeft = /<\/?[^<>\s\\\/\'\"\(\)\`\{\}\[\]]*$/;
const tagNameRERight = /^[^<>\s\\\/\'\"\(\)\`\{\}\[\]]*/;
let wordsAtOffsets = {};
const updateWordsAtOffset = tags => {
    const keys = Object.keys(wordsAtOffsets);
    if (keys.length > 0) {
        if (keys.length !== tags.length) {
            wordsAtOffsets = {};
        }
        for (const tag of tags) {
            if (!wordsAtOffsets.hasOwnProperty(tag.previousOffset)) {
                wordsAtOffsets = {};
                break;
            }
        }
    }
    for (const tag of tags) {
        wordsAtOffsets[tag.offset] = {
            oldWord: (wordsAtOffsets[tag.previousOffset] &&
                wordsAtOffsets[tag.previousOffset].oldWord) ||
                tag.oldWord,
            newWord: tag.word
        };
        if (tag.previousOffset !== tag.offset) {
            delete wordsAtOffsets[tag.previousOffset];
        }
        tag.oldWord = wordsAtOffsets[tag.offset].oldWord;
    }
};
const doAutoCompletionElementRenameTag = async (languageClientProxy, tags) => {
    if (latestCancelTokenSource) {
        latestCancelTokenSource.cancel();
    }
    const cancelTokenSource = new vscode.CancellationTokenSource();
    latestCancelTokenSource = cancelTokenSource;
    if (!vscode.window.activeTextEditor) {
        return;
    }
    const beforeVersion = vscode.window.activeTextEditor.document.version;
    const results = await askServerForAutoCompletionsElementRenameTag(languageClientProxy, vscode.window.activeTextEditor.document, tags);
    if (cancelTokenSource.token.isCancellationRequested) {
        return;
    }
    if (latestCancelTokenSource === cancelTokenSource) {
        latestCancelTokenSource = undefined;
        cancelTokenSource.dispose();
    }
    if (results.length === 0) {
        wordsAtOffsets = {};
        return;
    }
    if (!vscode.window.activeTextEditor) {
        return;
    }
    const afterVersion = vscode.window.activeTextEditor.document.version;
    if (beforeVersion !== afterVersion) {
        return;
    }
    await applyResults(results);
};
const setPreviousText = textEditor => {
    if (textEditor) {
        previousText = textEditor.document.getText();
    }
    else {
        previousText = undefined;
    }
};
exports.activate = async (context) => {
    vscode.workspace
        .getConfiguration('auto-rename-tag')
        .get('activationOnLanguage');
    const isEnabled = (document) => {
        if (!document) {
            return false;
        }
        const languageId = document.languageId;
        if ((languageId === 'html' || languageId === 'handlebars') && vscode.workspace.getConfiguration('editor', document).get('renameOnType')) {
            return false;
        }
        const config = vscode.workspace.getConfiguration('auto-rename-tag', document.uri);
        const languages = config.get('activationOnLanguage', ['*']);
        return (languages.includes('*') || languages.includes(languageId));
    };
    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(event => {
        // purges cache for `vscode.workspace.getConfiguration`
        if (!event.affectsConfiguration('auto-rename-tag')) {
            return;
        }
    }));
    const clientOptions = {
        documentSelector: [
            {
                scheme: '*'
            }
        ]
    };
    const languageClientProxy = await createLanguageClientProxy_1.createLanguageClientProxy(context, 'auto-rename-tag', 'Auto Rename Tag', clientOptions);
    let activeTextEditor = vscode.window.activeTextEditor;
    let changeListener;
    context.subscriptions.push({
        dispose() {
            if (changeListener) {
                changeListener.dispose();
                changeListener = undefined;
            }
        }
    });
    const setupChangeListener = () => {
        if (changeListener) {
            return;
        }
        changeListener = vscode.workspace.onDidChangeTextDocument(async (event) => {
            if (event.document !== (activeTextEditor === null || activeTextEditor === void 0 ? void 0 : activeTextEditor.document)) {
                return;
            }
            if (!isEnabled(event.document)) {
                changeListener === null || changeListener === void 0 ? void 0 : changeListener.dispose();
                changeListener = undefined;
                return;
            }
            if (event.contentChanges.length === 0) {
                return;
            }
            const currentText = event.document.getText();
            const tags = [];
            let totalInserted = 0;
            const sortedChanges = event.contentChanges
                .slice()
                .sort((a, b) => a.rangeOffset - b.rangeOffset);
            const keys = Object.keys(wordsAtOffsets);
            for (const change of sortedChanges) {
                for (const key of keys) {
                    const parsedKey = parseInt(key, 10);
                    if (change.rangeOffset <= parsedKey &&
                        parsedKey <= change.rangeOffset + change.rangeLength) {
                        delete wordsAtOffsets[key];
                    }
                }
                assertDefined(previousText);
                const line = event.document.lineAt(change.range.start.line);
                const lineStart = event.document.offsetAt(line.range.start);
                const lineChangeOffset = change.rangeOffset - lineStart;
                const lineLeft = line.text.slice(0, lineChangeOffset + totalInserted);
                const lineRight = line.text.slice(lineChangeOffset + totalInserted);
                const lineTagNameLeft = lineLeft.match(tagNameReLeft);
                const lineTagNameRight = lineRight.match(tagNameRERight);
                const previousTextRight = previousText.slice(change.rangeOffset);
                const previousTagNameRight = previousTextRight.match(tagNameRERight);
                let newWord;
                let oldWord;
                if (!lineTagNameLeft) {
                    totalInserted += change.text.length - change.rangeLength;
                    continue;
                }
                newWord = lineTagNameLeft[0];
                oldWord = lineTagNameLeft[0];
                if (lineTagNameRight) {
                    newWord += lineTagNameRight[0];
                }
                if (previousTagNameRight) {
                    oldWord += previousTagNameRight[0];
                }
                const offset = change.rangeOffset - lineTagNameLeft[0].length + totalInserted;
                tags.push({
                    oldWord,
                    word: newWord,
                    offset,
                    previousOffset: offset - totalInserted
                });
                totalInserted += change.text.length - change.rangeLength;
            }
            updateWordsAtOffset(tags);
            if (tags.length === 0) {
                previousText = currentText;
                return;
            }
            assertDefined(vscode.window.activeTextEditor);
            const beforeVersion = vscode.window.activeTextEditor.document.version;
            // the change event is fired before we can update the version of the last change by auto rename tag, therefore we wait for that
            await new Promise(resolve => setImmediate(resolve));
            if (lastChangeByAutoRenameTag.fsPath === event.document.uri.fsPath &&
                lastChangeByAutoRenameTag.version === event.document.version) {
                previousText = currentText;
                return;
            }
            assertDefined(vscode.window.activeTextEditor);
            const afterVersion = vscode.window.activeTextEditor.document.version;
            if (beforeVersion !== afterVersion) {
                return;
            }
            previousText = currentText;
            doAutoCompletionElementRenameTag(languageClientProxy, tags);
        });
    };
    setPreviousText(vscode.window.activeTextEditor);
    setupChangeListener();
    context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(textEditor => {
        activeTextEditor = textEditor;
        const doument = activeTextEditor === null || activeTextEditor === void 0 ? void 0 : activeTextEditor.document;
        if (!isEnabled(doument)) {
            if (changeListener) {
                changeListener.dispose();
                changeListener = undefined;
            }
            return;
        }
        setPreviousText(textEditor);
        setupChangeListener();
    }));
};
//# sourceMappingURL=extensionMain.js.map