"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = exports.updateControlledEditorsForOneDoc = exports.updateAllControlledEditors = exports.areSameDocs = exports.haveSameDocs = exports.dropTextLinesMapForEditor = exports.infosOfControlledEditors = exports.allWhiteSpace = exports.oneCharLineBreaks = exports.oneCharNonLineBreakingWhiteSpaces = exports.glo = exports.optionsForRightEdgeBaseOfBlocks = exports.bracketManager = void 0;
const vscode_1 = require("vscode");
const vscode = require("vscode");
const documentDecorationManager_1 = require("./bracketAlgos/documentDecorationManager");
const settingsManager_1 = require("./settingsManager");
const colors_1 = require("./colors");
const utils2_1 = require("./utils2");
const specialMessages_1 = require("./specialMessages");
const utilsGeneral_1 = require("./utilsGeneral");
const iiGlobal = "blockman_data_iicounter";
const iiGlobal2 = "blockman_data_iicounter2";
const iiGlobal3 = "blockman_data_iicounter3";
const iiGlobal5OnOff = "blockman_data_onOffState";
// const iiGlobal6AutoShowHideIndentGuides =
//     "blockman_data_autoShowHideIndentGuides";
const iiGlobal7AtInstallEventUserAcceptedToChangeVSCodeSettings = "blockman_data_atInstallEventUserAcceptedToChangeVSCodeSettings"; // "true" | "false"
const stateHolder = {
    myState: undefined,
};
// colorCombos.forEach((combo) => {
//     combo.focusedBlock = makeGradientNotation(combo.focusedBlock);
//     combo.onEachDepth = combo.onEachDepth.map((color) =>
//         makeGradientNotation(color),
//     );
// });
const classicDark1Combo = colors_1.colorCombos.find((x) => x.name === "Classic Dark 1 (Gradients)");
const bigVars = {
    currColorCombo: classicDark1Combo,
};
exports.optionsForRightEdgeBaseOfBlocks = {
    innerC: "Rightmost Edge Of Inner Content",
    vpC: "Rightmost Edge Of Viewport",
    fileC: "Rightmost Edge Of File Content",
};
exports.glo = {
    isOn: true,
    atInstallEventUserAcceptedToChangeVSCodeSettings: null,
    nominalLineHeight: 1,
    ratioOfCodeLensHeightByEditorLineHeight: 1,
    currZoomLevel: 0,
    eachCharFrameHeight: 1,
    eachCharFrameWidth: 1,
    letterSpacing: 0,
    maxDepth: 9,
    enableFocus: true,
    renderIncBeforeAfterVisRange: 20,
    renderTimerForInit: 50,
    renderTimerForChange: 1200,
    renderTimerForFocus: 200,
    renderTimerForScroll: 100,
    analyzeCurlyBrackets: true,
    analyzeSquareBrackets: false,
    analyzeRoundBrackets: false,
    analyzeTags: true,
    analyzeIndentDedentTokens: true,
    renderInSingleLineAreas: false,
    hideBlockOfFocusedSingleLineArea: false,
    borderThicknessOfNonFocusedBlock: 1,
    borderThicknessOfFocusedBlock: 2,
    // For future. (Cannot change this yet, because backgroundAndBorder, well the divs don't have real borders)
    borderStyleOfFocusedBlock: "solid",
    borderStyleOfNonFocusedBlock: "solid",
    /*

    // For future. (Cannot change this yet, because backgroundAndBorder, well the divs don't have real borders)

    "blockman.n34A03BorderStyleOfFocusedBlock": {
        "type": "string",
        "default": "solid",
        "description": "CSS border-style, e.g solid, dotted, dashed, groove",
        "scope": "window"
    },
    "blockman.n34A04BorderStyleOfNonFocusedBlock": {
        "type": "string",
        "default": "solid",
        "description": "CSS border-style, e.g solid, dotted, dashed, groove",
        "scope": "window"
    },

    */
    borderRadius: 5,
    edgeExpanding: {
        rightSideBaseOfBlocks: "innerC",
        minDistanceBetweenRightSideEdges: 0,
        additionalPaddingRight: 0,
    },
    coloring: {
        onEachDepth: bigVars.currColorCombo.onEachDepth,
        border: bigVars.currColorCombo.border,
        borderOfDepth0: bigVars.currColorCombo.borderOfDepth0,
        focusedBlock: bigVars.currColorCombo.focusedBlock,
        borderOfFocusedBlock: bigVars.currColorCombo.borderOfFocusedBlock,
        advanced: {
            forBorders: [],
            forBackgrounds: [],
        },
    },
    colorDecoratorsInStyles: true,
    trySupportDoubleWidthChars: false,
    blackListOfFileFormats: {
        actsAsWhiteList: false,
        formatArr: ["plaintext", "markdown"],
    },
    disableRecommendationDialog: false,
    // maxHistoryOfParsedTabs: 7,
    maxCharCountInAnyLine: 3000, // Blockman will not work in a file if the file has at least one line with N (or more) number of chars.
};
const calcLineHeight = () => {
    // return glo.nominalLineHeight * (1 + glo.currZoomLevel * 0.1);
    return exports.glo.nominalLineHeight;
};
const updateBlockmanLineHeightAndLetterSpacing = () => {
    /**
     * Determined from empirical observations.
     */
    const editorConfig = vscode_1.workspace.getConfiguration("editor");
    // console.log("editorConfig:", editorConfig);
    exports.glo.nominalLineHeight = utilsGeneral_1.getEditorLineHeight();
    exports.glo.eachCharFrameHeight = calcLineHeight();
    exports.glo.ratioOfCodeLensHeightByEditorLineHeight =
        utilsGeneral_1.getRatioOfCodeLensHeightByEditorLineHeight();
    // now letter spacing:
    const editorLetterSpacing = editorConfig.get("letterSpacing");
    exports.glo.letterSpacing = editorLetterSpacing;
};
// extention-wide GLOBALS _start_
exports.oneCharNonLineBreakingWhiteSpaces = [" "];
exports.oneCharLineBreaks = ["\n"];
exports.allWhiteSpace = [
    ...exports.oneCharNonLineBreakingWhiteSpaces,
    ...exports.oneCharLineBreaks,
];
// export const maxNumberOfControlledEditors = 5;
exports.infosOfControlledEditors = [];
// extention-wide GLOBALS _end_
const dropTextLinesMapForEditor = (editor) => {
    for (let edInfoIndex = 0; edInfoIndex < exports.infosOfControlledEditors.length; edInfoIndex += 1) {
        const currEdInfo = exports.infosOfControlledEditors[edInfoIndex];
        if (currEdInfo.editorRef === editor) {
            currEdInfo.textLinesMap = [];
            break;
        }
    }
};
exports.dropTextLinesMapForEditor = dropTextLinesMapForEditor;
const haveSameDocs = (ed1, ed2) => {
    if (ed1 === ed2) {
        return true;
    }
    if (ed1.document === ed2.document) {
        return true;
    }
    if (ed1.document.uri === ed2.document.uri) {
        return true;
    }
    if (ed1.document.uri.fsPath === ed2.document.uri.fsPath) {
        return true;
    }
    if (ed1.document.uri.path === ed2.document.uri.path) {
        return true;
    }
    return false;
};
exports.haveSameDocs = haveSameDocs;
const areSameDocs = (d1, d2) => {
    if (d1 === d2) {
        return true;
    }
    if (d1.uri === d2.uri) {
        return true;
    }
    if (d1.uri.fsPath === d2.uri.fsPath) {
        return true;
    }
    if (d1.uri.path === d2.uri.path) {
        return true;
    }
    return false;
};
exports.areSameDocs = areSameDocs;
const updateAllControlledEditors = ({ alsoStillVisibleAndHist, }) => {
    const supMode = "init";
    const visibleEditors = vscode.window.visibleTextEditors;
    const infosOfStillVisibleEditors = exports.infosOfControlledEditors.filter((edInfo) => visibleEditors.includes(edInfo.editorRef));
    // nukeJunkDecorations();
    if (infosOfStillVisibleEditors.length === 0) {
        utils2_1.nukeJunkDecorations();
        utils2_1.nukeAllDecs();
    }
    const stillVisibleEditors = infosOfStillVisibleEditors.map((edInfo) => edInfo.editorRef);
    const newEditors = visibleEditors.filter((editor) => !stillVisibleEditors.includes(editor));
    const infosOfNewEditors = [];
    newEditors.forEach((editor) => {
        infosOfNewEditors.push({
            editorRef: editor,
            needToAnalyzeFile: true,
            textLinesMap: [],
            decors: [],
            upToDateLines: {
                upEdge: -1,
                lowEdge: -1,
            },
            focusDuo: {
                curr: null,
                prev: null,
            },
            timerForDo: null,
            focusTreePath: null,
            innersFromFocus: null,
            renderingInfoForFullFile: undefined,
            monoText: "",
            colorDecoratorsArr: [],
            codelensItemsLines: new Set([]),
        });
    });
    let infosOfDisposedEditors = exports.infosOfControlledEditors.filter((edInfo) => !stillVisibleEditors.includes(edInfo.editorRef));
    infosOfDisposedEditors.forEach((edInfo) => {
        utils2_1.junkDecors3dArr.push(edInfo.decors);
    });
    const finalArrOfInfos = [
        ...infosOfStillVisibleEditors,
        ...infosOfNewEditors,
    ];
    exports.infosOfControlledEditors = finalArrOfInfos;
    infosOfNewEditors.forEach((editorInfo) => {
        editorInfo.needToAnalyzeFile = true;
        utils2_1.updateRender({ editorInfo, timer: exports.glo.renderTimerForInit });
    });
    if (alsoStillVisibleAndHist) {
        infosOfStillVisibleEditors.forEach((editorInfo) => {
            editorInfo.upToDateLines.upEdge = -1;
            editorInfo.upToDateLines.lowEdge = -1;
            editorInfo.needToAnalyzeFile = true;
            utils2_1.updateRender({ editorInfo, timer: exports.glo.renderTimerForInit });
        });
    }
};
exports.updateAllControlledEditors = updateAllControlledEditors;
const updateControlledEditorsForOneDoc = ({ editor, doc, supMode, }) => {
    let thisTimer = exports.glo.renderTimerForChange;
    if (supMode === "scroll") {
        thisTimer = exports.glo.renderTimerForScroll;
    }
    else if (supMode === "focus") {
        thisTimer = exports.glo.renderTimerForFocus;
    }
    let thisDoc;
    if (doc) {
        thisDoc = doc;
    }
    else if (editor) {
        thisDoc = editor.document;
    }
    else {
        console.log("both -> doc and editor are falsy");
        return;
    }
    exports.infosOfControlledEditors.forEach((editorInfo) => {
        if (thisDoc === editorInfo.editorRef.document
        // areSameDocs(thisDoc!, editorInfo.editorRef.document)
        ) {
            if (["scroll", "focus"].includes(supMode) &&
                editorInfo.needToAnalyzeFile) {
                // !!! VERY IMPORTANT for optimization
                return; // it's the same as 'continue' for 'for/while' loop.
            }
            // console.log("kok", supMode);
            utils2_1.updateRender({ editorInfo, timer: thisTimer, supMode });
        }
    });
};
exports.updateControlledEditorsForOneDoc = updateControlledEditorsForOneDoc;
const setLightColorComboIfLightTheme = () => {
    const currVscodeThemeKind = vscode.window.activeColorTheme.kind;
    if (currVscodeThemeKind === vscode.ColorThemeKind.Light) {
        // glo.coloring.
        vscode_1.workspace
            .getConfiguration("blockman")
            .update("n04ColorComboPreset", "Classic Light (Gradients)", 1);
    }
};
const setColorDecoratorsBool = () => {
    const vsConfigOfEditors = vscode.workspace.getConfiguration("editor");
    const colorDecoratorsBool = vsConfigOfEditors.get("colorDecorators");
    // console.log(vsConfigOfEditors, colorDecoratorsBool);
    if (colorDecoratorsBool === true || colorDecoratorsBool === false) {
        exports.glo.colorDecoratorsInStyles = colorDecoratorsBool;
    }
};
const setUserwideIndentGuides = (myBool) => {
    // const st = stateHolder.myState;
    // if (st) {
    //     const autoShowHideIndentGuides = st.get(
    //         iiGlobal6AutoShowHideIndentGuides,
    //     );
    //     if (autoShowHideIndentGuides === "off") {
    //         return;
    //     }
    // }
    /*
    const indent1 = (boo: boolean) => {
        try {
            // old API
            vscode.workspace
                .getConfiguration()
                .update("editor.renderIndentGuides", myBool, 1); // 1 means Userwide
        } catch (err) {
            //
        }
    };
    */
    const indent2 = (boo) => {
        try {
            vscode.workspace
                .getConfiguration()
                .update("editor.guides.indentation", myBool, 1); // 1 means Userwide
        }
        catch (err) {
            //
        }
    };
    const indent3 = (boo) => {
        try {
            vscode.workspace
                .getConfiguration()
                .update("editor.guides.bracketPairs", myBool, 1); // 1 means Userwide
        }
        catch (err) {
            //
        }
    };
    // indent1(myBool); // DEPRECATED, because "editor.renderIndentGuides" is old API
    indent2(myBool);
    indent3(myBool);
    // vscode.workspace
    //     .getConfiguration()
    //     .update("editor.highlightActiveIndentGuide", myBool, 1); // 1 means Userwide
};
// for archive
// const configOfVscodeBeforeBlockman: IConfigOfVscode = {
//     renderIndentGuides: true,
// };
// for blockman
const configOfVscodeWithBlockman = {
    inlayHints: "off",
    lineHighlightBackground: "#1073cf2d",
    lineHighlightBorder: "#9fced11f",
    editorWordWrap: "off",
    diffEditorWordWrap: "off",
    // renderIndentGuides: false, // for old API of indent guides
    guidesIndentation: false,
    guidesBracketPairs: false,
};
// let vvvv = vscode.workspace.getConfiguration().get("editor.wordWrap");
const setUserwideConfigOfVscode = (userwideConfig) => {
    vscode.workspace
        .getConfiguration()
        .update("editor.inlayHints.enabled", configOfVscodeWithBlockman.inlayHints, 1);
    let vscodeColorConfig = vscode.workspace
        .getConfiguration("workbench")
        .get("colorCustomizations");
    vscode.workspace.getConfiguration("workbench").update("colorCustomizations", Object.assign(Object.assign({}, vscodeColorConfig), { "editor.lineHighlightBackground": userwideConfig.lineHighlightBackground, "editor.lineHighlightBorder": userwideConfig.lineHighlightBorder }), 1);
    vscode.workspace
        .getConfiguration()
        .update("editor.wordWrap", userwideConfig.editorWordWrap, 1);
    vscode.workspace
        .getConfiguration()
        .update("diffEditor.wordWrap", userwideConfig.diffEditorWordWrap, 1);
    // let vscodeMarkdownConfig: any = vscode.workspace
    //     .getConfiguration()
    //     .get("[markdown]");
    // vscode.workspace.getConfiguration().update(
    //     "[markdown]",
    //     {
    //         ...vscodeMarkdownConfig,
    //         "editor.wordWrap": userwideConfig.markdownEditorWordWrap,
    //     },
    //     1,
    // );
    if (userwideConfig.guidesIndentation !== undefined) {
        setUserwideIndentGuides(userwideConfig.guidesIndentation);
    }
};
const softRestart = () => {
    utils2_1.nukeAllDecs();
    utils2_1.nukeJunkDecorations();
    exports.infosOfControlledEditors = [];
    exports.updateAllControlledEditors({ alsoStillVisibleAndHist: true });
};
let settingsChangeTimout;
function activate(context) {
    stateHolder.myState = context.globalState;
    // workspace.getConfiguration("blockman").update("n01LineHeight", 0, 1); // TODO: later
    updateBlockmanLineHeightAndLetterSpacing();
    // adjustVscodeUserConfig();
    setColorDecoratorsBool();
    exports.bracketManager = new documentDecorationManager_1.default();
    vscode.extensions.onDidChange(() => restart());
    // console.log("all Config:", vscode.workspace.getConfiguration()); // lineHighlightBorder
    // let bbqq = context.globalStorageUri;
    if (stateHolder.myState) {
        const st = stateHolder.myState;
        const iicounter = st.get(iiGlobal);
        const iicounter2 = st.get(iiGlobal2);
        const iicounter3 = st.get(iiGlobal3);
        const onOffState = st.get(iiGlobal5OnOff);
        if (onOffState === "off") {
            exports.glo.isOn = false;
        }
        else {
            exports.glo.isOn = true;
        }
        // console.log(iicounter);
        const userAcceptedToChangeSettingsAtInstallEvent = st.get(iiGlobal7AtInstallEventUserAcceptedToChangeVSCodeSettings);
        const uATCSAIE = userAcceptedToChangeSettingsAtInstallEvent;
        if (uATCSAIE === "true") {
            exports.glo.atInstallEventUserAcceptedToChangeVSCodeSettings = true;
        }
        else if (uATCSAIE === "false") {
            exports.glo.atInstallEventUserAcceptedToChangeVSCodeSettings = false;
        }
        else {
            exports.glo.atInstallEventUserAcceptedToChangeVSCodeSettings = null;
        }
        if (!["1", "2", "3", "4", "5"].includes(iicounter)) {
            console.log("first activation iicounter");
            // collectVSCodeConfigArchive();
            setLightColorComboIfLightTheme();
            settingsManager_1.applyAllBlockmanSettings();
            if (!exports.glo.disableRecommendationDialog) {
                vscode.window
                    .showInformationMessage(specialMessages_1.atInstallEventMessage, { modal: true }, specialMessages_1.OptionsAtInstall.yes, specialMessages_1.OptionsAtInstall.no)
                    .then((x) => {
                    console.log("x--->", x);
                    if (x === specialMessages_1.OptionsAtInstall.yes) {
                        exports.glo.atInstallEventUserAcceptedToChangeVSCodeSettings =
                            true;
                        st.update(iiGlobal7AtInstallEventUserAcceptedToChangeVSCodeSettings, "true");
                        setUserwideConfigOfVscode(configOfVscodeWithBlockman);
                    }
                    else {
                        exports.glo.atInstallEventUserAcceptedToChangeVSCodeSettings =
                            false;
                        st.update(iiGlobal7AtInstallEventUserAcceptedToChangeVSCodeSettings, "false");
                    }
                });
            }
            st.update(iiGlobal, "1");
            // console.log("iyo undefined, gaxda 1:", st.get(iiGlobal));
        }
        else if (iicounter === "1") {
            st.update(iiGlobal, "2");
            // console.log("iyo 1, gaxda 2:", st.get(iiGlobal));
        }
        else if (iicounter === "2") {
            // console.log("aris 2:", st.get(iiGlobal));
            // ----
        }
        if (!["1", "2", "3", "4", "5"].includes(iicounter2)) {
            console.log("first activation iicounter2");
            // vscode.workspace
            //     .getConfiguration()
            //     .update(
            //         "editor.inlayHints.enabled",
            //         configOfVscodeWithBlockman.inlayHints,
            //         1,
            //     );
            st.update(iiGlobal2, "1");
        }
        else if (iicounter2 === "1") {
            st.update(iiGlobal2, "2");
            //
        }
        else if (iicounter2 === "2") {
            //
        }
        if (!["1", "2", "3", "4", "5"].includes(iicounter3)) {
            console.log("first activation iicounter3");
            // vscode.workspace
            //     .getConfiguration()
            //     .update(
            //         "editor.guides.indentation",
            //         configOfVscodeWithBlockman.guidesIndentation,
            //         1,
            //     );
            st.update(iiGlobal3, "1");
        }
        else if (iicounter3 === "1") {
            st.update(iiGlobal3, "2");
            //
        }
        else if (iicounter3 === "2") {
            //-
        }
    }
    if (exports.glo.isOn) {
        if (exports.glo.atInstallEventUserAcceptedToChangeVSCodeSettings === true) {
            // setUserwideIndentGuides(false);
        }
    }
    // setLightColorComboIfLightTheme(); // not on every activation
    settingsManager_1.applyAllBlockmanSettings();
    context.subscriptions.push(
    // vscode.commands.registerCommand(
    //     "bracket-pair-colorizer-2.expandBracketSelection",
    //     () => {
    //         const editor = window.activeTextEditor;
    //         if (!editor) {
    //             return;
    //         }
    //         documentDecorationManager.expandBracketSelection(editor);
    //     },
    // ),
    vscode.commands.registerCommand("blockman.helloWorld", () => {
        console.log("Hello, I'm Blockman, a visual helper for software developers.");
        vscode.window
            .showInformationMessage(`Hello, I'm Blockman, a visual helper for software developers.`, { modal: false }, "opt1", "opt2", "opt3", "opt4")
            .then((x) => {
            console.log("x--->", x);
        });
    }), vscode.commands.registerCommand("blockman.toggleEnableDisable", () => {
        const st = stateHolder.myState;
        if (exports.glo.isOn) {
            exports.glo.isOn = false;
            utils2_1.nukeAllDecs();
            utils2_1.nukeJunkDecorations();
            exports.infosOfControlledEditors = [];
        }
        else {
            exports.glo.isOn = true;
            exports.updateAllControlledEditors({ alsoStillVisibleAndHist: true });
        }
        if (st) {
            st.update(iiGlobal5OnOff, exports.glo.isOn ? "on" : "off");
        }
    }), vscode.commands.registerCommand("blockman.toggleEnableDisableAndForceShowHideIndentGuides", () => {
        const st = stateHolder.myState;
        if (exports.glo.isOn) {
            exports.glo.isOn = false;
            utils2_1.nukeAllDecs();
            utils2_1.nukeJunkDecorations();
            exports.infosOfControlledEditors = [];
            setUserwideIndentGuides(true);
        }
        else {
            exports.glo.isOn = true;
            setUserwideIndentGuides(false);
            exports.updateAllControlledEditors({
                alsoStillVisibleAndHist: true,
            });
        }
        if (st) {
            st.update(iiGlobal5OnOff, exports.glo.isOn ? "on" : "off");
        }
    }), 
    /*
    vscode.commands.registerCommand("blockman.toggleKeepOff", () => {
        const st = stateHolder.myState;
        if (st) {
            const onOffStateAfterRestart = st.get(iiGlobal4OnOffAR);
            let newAROnOffState =
                onOffStateAfterRestart === "off" ? "on" : "off";

            st.update(iiGlobal4OnOffAR, newAROnOffState);

            if (newAROnOffState === "off") {
                vscode.window.showInformationMessage(
                    `If you disable Blockman, it will still be disabled after restarting VS Code.`,
                    { modal: false },
                );
            } else {
                vscode.window.showInformationMessage(
                    `If you disable Blockman, it will be enabled after restarting VS Code`,
                    { modal: false },
                );
            }
        } else {
            vscode.window.showInformationMessage(
                `Something's wrong, context.globalState is falsy.`,
                { modal: false },
            );
        }
    }),
    */
    /*
    vscode.commands.registerCommand(
        "blockman.toggleDisableAutomaticShowHideIndentGuides",
        () => {
            const st = stateHolder.myState;
            if (st) {
                const autoShowHideIndentGuides = st.get(
                    iiGlobal6AutoShowHideIndentGuides,
                );
                let newVal =
                    autoShowHideIndentGuides === "off" ? "on" : "off";

                st.update(iiGlobal6AutoShowHideIndentGuides, newVal);

                if (newVal === "off") {
                    vscode.window.showInformationMessage(
                        `OK, Blockman will NOT change anything about indent guides.`,
                        { modal: false },
                    );
                } else {
                    vscode.window.showInformationMessage(
                        `Cool, Blockman will automatically show/hide indent guides.`,
                        { modal: false },
                    );
                }
            } else {
                vscode.window.showInformationMessage(
                    `Something's wrong, context.globalState is falsy.`,
                    { modal: false },
                );
            }
        },
    ),
    */
    vscode.commands.registerCommand("blockman.printLeak", () => {
        console.log(utils2_1.notYetDisposedDecsObject.decs);
    }), 
    // vscode.commands.registerCommand("blockman.zoomLineHeight", () => {
    //     glo.currZoomLevel += 1;
    //     glo.eachCharFrameHeight = calcLineHeight();
    //     updateAllControlledEditors({ alsoStillVisibleAndHist: true });
    // }),
    // vscode.commands.registerCommand("blockman.unzoomLineHeight", () => {
    //     glo.currZoomLevel -= 1;
    //     glo.eachCharFrameHeight = calcLineHeight();
    //     updateAllControlledEditors({ alsoStillVisibleAndHist: true });
    // }),
    vscode.commands.registerCommand("blockman.toggleTrySupportDoubleWidthChars", () => {
        exports.glo.trySupportDoubleWidthChars =
            !exports.glo.trySupportDoubleWidthChars;
        softRestart();
        const isOn = exports.glo.trySupportDoubleWidthChars
            ? "ON"
            : "OFF";
        vscode.window.showInformationMessage(`Double-width char support (experimental) is ${isOn}`, { modal: false });
    }), vscode.commands.registerCommand("blockman.toggleFreezeFocus", () => {
        const thisEditor = vscode.window.activeTextEditor;
        if (thisEditor) {
            const thisEditorInfo = exports.infosOfControlledEditors.find((x) => x.editorRef === thisEditor);
            if (thisEditorInfo) {
                const currFr = thisEditorInfo.focusDuo.currIsFreezed;
                thisEditorInfo.focusDuo.currIsFreezed = !currFr;
            }
        }
    }), vscode.commands.registerCommand("blockman.selectFocused", () => {
        utils2_1.selectFocusedBlock();
    }), vscode.commands.registerCommand("blockman.clearStateStorage", () => {
        const st = stateHolder.myState;
        if (st) {
            st.update(iiGlobal, "");
            st.update(iiGlobal2, "");
            st.update(iiGlobal3, "");
            st.update(iiGlobal5OnOff, "");
            st.update(iiGlobal7AtInstallEventUserAcceptedToChangeVSCodeSettings, "");
            vscode.window.showInformationMessage(`Blockman state storage cleared`, { modal: false });
            console.log("Blockman state storage cleared");
        }
        else {
            console.log("State not found");
        }
    }), vscode_1.workspace.onDidChangeConfiguration((event) => {
        console.log("settings changed");
        // if (
        //     event.affectsConfiguration("bracket-pair-colorizer-2") ||
        //     event.affectsConfiguration("editor.lineHeight") ||
        //     event.affectsConfiguration("editor.fontSize")
        // ) {
        //     console.log(
        //         "all:",
        //         vscode.workspace
        //             .getConfiguration("editor")
        //             .get("lineHeight"),
        //     ); // lineHighlightBorder
        //     // restart();
        // }
        // if (event.affectsConfiguration("blockman")) { // sometimes cannot catch the change from the scope
        updateBlockmanLineHeightAndLetterSpacing();
        setColorDecoratorsBool();
        // console.log("scrrr:", glo.renderTimerForScroll);
        // updateAllControlledEditors({
        //     alsoUndisposed: true,
        // });
        // }
        if (exports.glo.isOn) {
            if (settingsChangeTimout) {
                clearTimeout(settingsChangeTimout);
            }
            settingsChangeTimout = setTimeout(() => {
                settingsManager_1.applyAllBlockmanSettings(); // setTimeout is important because VS Code needs certain amount of time to update latest changes of settings.
                exports.updateAllControlledEditors({
                    alsoStillVisibleAndHist: true,
                });
            }, 500);
        }
        else {
            utils2_1.nukeAllDecs();
            utils2_1.nukeJunkDecorations();
            exports.infosOfControlledEditors = [];
        }
    }), vscode.window.onDidChangeTextEditorOptions((event) => {
        if (!exports.glo.isOn) {
            return;
        }
        exports.infosOfControlledEditors.forEach((editorInfo) => {
            if (event.textEditor === editorInfo.editorRef) {
                editorInfo.needToAnalyzeFile = true;
            }
        });
        exports.updateControlledEditorsForOneDoc({
            editor: event.textEditor,
            supMode: "reparse",
        });
    }), vscode.window.onDidChangeVisibleTextEditors((event) => {
        if (!exports.glo.isOn) {
            return;
        }
        const visEditors = event;
        exports.updateAllControlledEditors({});
    }), vscode_1.workspace.onDidChangeTextDocument((event) => {
        if (!exports.glo.isOn) {
            return;
        }
        // console.log("araaaa nulze meti");
        // return;
        if (event.contentChanges.length > 0) {
            // console.log("changed text");
            const thisDoc = event.document;
            exports.infosOfControlledEditors.forEach((editorInfo) => {
                if (thisDoc === editorInfo.editorRef.document) {
                    editorInfo.needToAnalyzeFile = true;
                }
            });
            // console.log("chhhhhhhhhhhh:", glo.renderTimerForChange);
            // console.log("reparse");
            exports.updateControlledEditorsForOneDoc({
                doc: thisDoc,
                supMode: "reparse",
            });
        }
    }), vscode_1.workspace.onDidOpenTextDocument((event) => {
        // documentDecorationManager.onDidOpenTextDocument(event);
        // setTimeout(() => {
        //     let eds = window.visibleTextEditors;
        //     console.log("eds-opennnnnnnn:", eds);
        // }, 2000);
    }), vscode.window.onDidChangeTextEditorSelection((event) => {
        const thisDoc = event.textEditor.document;
        // console.log("focus");
        // return;
        if (!exports.glo.isOn) {
            return;
        }
        exports.updateControlledEditorsForOneDoc({
            doc: thisDoc,
            supMode: "focus",
        });
    }), vscode.window.onDidChangeTextEditorVisibleRanges((event) => {
        // console.log("scroll");
        // return;
        if (!exports.glo.isOn) {
            return;
        }
        const thisEditor = event.textEditor;
        exports.updateControlledEditorsForOneDoc({
            editor: thisEditor,
            supMode: "scroll",
        });
    }), vscode.window.onDidChangeActiveTextEditor((event) => {
        // needToAnalyzeFile = true;
        // let thisEditor = window.activeTextEditor;
        // if (thisEditor) {
        //     updateRender({ thisEditor });
        // }
    }), vscode_1.workspace.onDidCloseTextDocument((event) => {
        if (exports.bracketManager) {
            exports.bracketManager.onDidCloseTextDocument(event);
        }
    }));
    // documentDecorationManager.updateAllDocuments();
    // setTimeout(() => {
    exports.updateAllControlledEditors({});
    // }, 5000);
    function restart() {
        // documentDecorationManager.Dispose();
        // documentDecorationManager = new DocumentDecorationManager();
        // documentDecorationManager.updateAllDocuments();
        exports.bracketManager === null || exports.bracketManager === void 0 ? void 0 : exports.bracketManager.Dispose();
        exports.bracketManager = new documentDecorationManager_1.default();
        softRestart();
    }
}
exports.activate = activate;
// tslint:disable-next-line:no-empty
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map