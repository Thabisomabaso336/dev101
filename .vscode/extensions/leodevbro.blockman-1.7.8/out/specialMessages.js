"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OptionsAtInstall = exports.atInstallEventMessage = void 0;
exports.atInstallEventMessage = `Blockman recommends for better experience to change these 7 items in VS Code settings. Would you try it now?

{
    // ...
    "editor.inlayHints.enabled": "off",
    "editor.guides.indentation": false,
    "editor.guides.bracketPairs": false,
    "editor.wordWrap": "off",
    "diffEditor.wordWrap": "off",

    "workbench.colorCustomizations": {
        // ...
        "editor.lineHighlightBorder": "#9fced11f",
        "editor.lineHighlightBackground": "#1073cf2d"
    }
}

`;
var OptionsAtInstall;
(function (OptionsAtInstall) {
    OptionsAtInstall["yes"] = "Yeah, let's set those settings";
    OptionsAtInstall["no"] = "No, thanks";
})(OptionsAtInstall = exports.OptionsAtInstall || (exports.OptionsAtInstall = {}));
//# sourceMappingURL=specialMessages.js.map