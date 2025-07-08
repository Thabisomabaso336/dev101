"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEditorCodeLensItemsLinesSet = exports.getEditorCodeLensItemsArr = exports.getEditorColorDecoratorsArr = exports.isPrim = void 0;
const vscode = require("vscode");
const isPrim = (value) => {
    // if (typeof value === "object" && value !== null) {
    //     return false;
    // } else {
    //     return true;
    // }
    if ([null, undefined].includes(value) ||
        ["string", "number", "boolean"].includes(typeof value)) {
        return true;
    }
    else {
        return false;
    }
};
exports.isPrim = isPrim;
const getEditorColorDecoratorsArr = (editor) => __awaiter(void 0, void 0, void 0, function* () {
    const theNativeColorDecoratorsArr = (yield vscode.commands.executeCommand("vscode.executeDocumentColorProvider", editor.document.uri)) || [];
    return theNativeColorDecoratorsArr;
});
exports.getEditorColorDecoratorsArr = getEditorColorDecoratorsArr;
const getEditorCodeLensItemsArr = (editor) => __awaiter(void 0, void 0, void 0, function* () {
    const codeLensItemsArr = (yield vscode.commands.executeCommand("vscode.executeCodeLensProvider", editor.document.uri)) || [];
    return codeLensItemsArr;
});
exports.getEditorCodeLensItemsArr = getEditorCodeLensItemsArr;
const getEditorCodeLensItemsLinesSet = (editor) => __awaiter(void 0, void 0, void 0, function* () {
    const codeLensItemsArr = yield exports.getEditorCodeLensItemsArr(editor);
    const codelensItemsLinesSet = new Set(codeLensItemsArr.map((x) => {
        const rawNum = x.range.start.line;
        return rawNum; // zero index of line which is after a codelens item
    }));
    return codelensItemsLinesSet;
});
exports.getEditorCodeLensItemsLinesSet = getEditorCodeLensItemsLinesSet;
//# sourceMappingURL=utils3.js.map