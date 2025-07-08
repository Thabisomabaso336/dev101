"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RubyParser = void 0;
class RubyParser {
    constructor() {
        const parser = require('./nodejs-lib-ruby-parser');
        // const fs = require('fs');
        // if (typeof contentString === "string") {
        //     this.source = contentString;
        // } else if (typeof filePath === "string") {
        //     this.file = filePath;
        //     this.source = fs.readFileSync(this.file, 'utf8');
        // }
        // this.parsed = parser.parse(this.source);
    }
    doParse(rubyString) {
        try {
            this.parsed = this.parser.parse(rubyString);
            return this.parsed.ast;
        }
        catch (err) {
            console.log(err);
        }
    }
    // getInfo() {
    //     return {
    //         name: this.parsed.ast.name.name,
    //         type: this.parsed.ast.constructor.name,
    //         body: {
    //             name: this.parsed.ast.body.name.name,
    //             type: this.parsed.ast.body.constructor.name,
    //         }
    //     };
    // }
    getDiagnostics() {
        return this.parsed.diagnostics;
    }
    getMethods() {
        /*
        let resp = {};
        let _type = 'public';
        const source = this.source;
        this.parsed.ast.body.body.statements.forEach(statement=>{
            if (statement.method_name) {
                _type = statement.method_name;
            } else {
                let loc = { begin: statement.args.end_l.end, end: statement.body.expression_l.end };
                resp[statement.name] = {
                    args_type: statement.args.args.map(x=>x.constructor.name.toLowerCase())[0],
                    args: statement.args.args.map(x=>x.name),
                    location: loc,
                    body: source.substring(loc.begin, loc.end),
                    comments: this.parsed.comments.map(comment=>{
                        if (comment.location.begin >= loc.begin && comment.location.end <= loc.end) {
                            return source.substring(comment.location.begin, comment.location.end);
                        }
                    }).filter(x=>x!==undefined),
                    type: _type
                };
            }
        });
        return resp;
        */
    }
    getComments() {
        /*
        let resp = [];
        const source = this.source;
        this.parsed.comments.forEach(comment=>{
            let text = source.substring(comment.location.begin, comment.location.end);
            resp.push({text, location: comment.location});
        });
        return resp;
        */
    }
    getAst() {
        return this.parsed.ast;
    }
}
exports.RubyParser = RubyParser;
// export rubyParser;
// module.exports = rubyParser;
//test
/*
const inspect = require('util').inspect;
const full = (x)=>inspect(x,true,Infinity);

const parser = new rubyParser('./tests/test.rb');
const methods = parser.getMethods();
console.log('info', parser.getInfo());
console.log('methods', methods);
*/
//# sourceMappingURL=index.js.map