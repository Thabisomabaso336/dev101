"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rubyFn = exports.utf8length = void 0;
// eslint-disable-next-line @typescript-eslint/naming-convention
const RubyParser = require("ruby_parser");
const utils_1 = require("../utils");
const utils3_1 = require("../utils3");
const pushStartEndToArr = ({ arr, editorInfo, gloStartEndZero, }) => {
    const { lineZero: beginLZ, inLineIndexZero: beginIIZ } = utils_1.findLineZeroAndInLineIndexZero({
        globalIndexZero: gloStartEndZero.start,
        editorInfo,
    });
    const { lineZero: endLZ, inLineIndexZero: endIIZ } = utils_1.findLineZeroAndInLineIndexZero({
        globalIndexZero: gloStartEndZero.end,
        editorInfo,
    });
    // ----------------
    arr.push({
        type: "s",
        globalIndexZero: gloStartEndZero.start,
        lineZero: beginLZ,
        inLineIndexZero: beginIIZ,
    }, {
        type: "e",
        globalIndexZero: gloStartEndZero.end,
        lineZero: endLZ,
        inLineIndexZero: endIIZ,
    });
};
// eslint-disable-next-line @typescript-eslint/naming-convention
const json_dfsPre_recurs_ast = (root, editorInfo) => {
    const recursFn = (item, listInp) => {
        if (utils3_1.isPrim(item)) {
            // listInp.push(item as tyPrim);
            return;
        }
        const branches = Object.entries(item);
        for (const [branchKey, branchVal] of branches) {
            if (branchVal && branchKey) {
                if (["if_true"].includes(branchKey) ||
                    ("if_false" === branchKey &&
                        !branchVal.if_false &&
                        !branchVal.if_true)) {
                    const begin = branchVal.expression_l.begin - 1;
                    const end = branchVal.expression_l.end;
                    pushStartEndToArr({
                        arr: listInp,
                        editorInfo,
                        gloStartEndZero: {
                            start: begin,
                            end: end,
                        },
                    });
                }
                const aaaStart = branchVal.begin_l;
                const aaaEnd = branchVal.end_l;
                const aaaElse = branchVal.else_l;
                if (aaaStart && aaaEnd && !aaaElse) {
                    // console.log(branchKey);
                    const theStarterWall = aaaStart.end - 1;
                    const theEnderWall = aaaEnd.begin;
                    pushStartEndToArr({
                        arr: listInp,
                        editorInfo,
                        gloStartEndZero: {
                            start: theStarterWall,
                            end: theEnderWall,
                        },
                    });
                }
            }
            recursFn(branchVal, listInp);
        }
    };
    const list = [];
    recursFn(root, list);
    return list;
};
const rubyParserObj = new RubyParser();
function utf8length(s) {
    // https://gist.github.com/vmi/1633236
    var len = s.length;
    var u8len = 0;
    for (var i = 0; i < len; i++) {
        var c = s.charCodeAt(i);
        if (c <= 0x007f) {
            // ASCII
            u8len++;
        }
        else if (c <= 0x07ff) {
            u8len += 2;
        }
        else if (c <= 0xd7ff || 0xe000 <= c) {
            u8len += 3;
        }
        else if (c <= 0xdbff) {
            // high-surrogate code
            c = s.charCodeAt(++i);
            if (c < 0xdc00 || 0xdfff < c) {
                // Is trailing char low-surrogate code?
                throw new Error("Error: Invalid UTF-16 sequence. Missing low-surrogate code.");
            }
            u8len += 4;
        } /* if (c <= 0xdfff) */
        else {
            // low-surrogate code
            throw new Error("Error: Invalid UTF-16 sequence. Missing high-surrogate code.");
        }
    }
    return u8len;
}
exports.utf8length = utf8length;
const rubyFn = (rubyTextInput, editorInfo) => {
    // console.log("aaaa", rubyTextInput.length);
    // console.log(rubyTextInput);
    // console.log("bbbbb");
    if (rubyTextInput.trim() === "") {
        return [];
    }
    const sanitizedText = rubyTextInput
        .split("")
        .map((x) => {
        if (utf8length(x) > 1
        // new Blob([x]).size > 1
        ) {
            return "Z";
        }
        else {
            return x;
        }
    })
        .join("");
    const initialAst = rubyParserObj.parse({
        rubyString: 
        // rubyTextInput
        sanitizedText,
    });
    // const statementsArr = initialAst.statements; // NO MORE NEEDED
    // console.log("theAST");
    // console.log(initialAst);
    if (!initialAst) {
        return [];
    }
    // console.log("stringified");
    // console.log(JSON.stringify(initialAst, null, 2));
    // initialAst.expression_l = "-"; // IMPORTANT
    let mySuperList = [];
    try {
        mySuperList = json_dfsPre_recurs_ast({ ddd: { initialAst } }, editorInfo);
    }
    catch (err) {
        console.log("error while tokenizing Ruby file");
        console.log(err);
    }
    // console.log("daaaa");
    // console.log(rubyParserObj.getAst());
    return mySuperList;
};
exports.rubyFn = rubyFn;
//# sourceMappingURL=theFn.js.map