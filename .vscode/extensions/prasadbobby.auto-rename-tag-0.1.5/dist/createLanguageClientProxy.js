"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLanguageClientProxy = void 0;
const vscode = require("vscode");
const vscode_languageclient_1 = require("vscode-languageclient");
exports.createLanguageClientProxy = async (context, id, name, clientOptions) => {
    const serverModule = context.asAbsolutePath('../server/dist/serverMain.js');
    const serverOptions = {
        run: { module: serverModule, transport: vscode_languageclient_1.TransportKind.ipc },
        debug: {
            module: serverModule,
            transport: vscode_languageclient_1.TransportKind.ipc,
            options: { execArgv: ['--nolazy', '--inspect=6009'] }
        }
    };
    const outputChannel = vscode.window.createOutputChannel(name);
    clientOptions.outputChannel = {
        name: outputChannel.name,
        append() { },
        appendLine(value) {
            try {
                const message = JSON.parse(value);
                if (!message.isLSPMessage) {
                    outputChannel.appendLine(value);
                }
            }
            catch (error) {
                if (typeof value !== 'object') {
                    outputChannel.appendLine(value);
                }
            }
        },
        clear() {
            outputChannel.clear();
        },
        show() {
            outputChannel.show();
        },
        hide() {
            outputChannel.hide();
        },
        dispose() {
            outputChannel.dispose();
        }
    };
    const languageClient = new vscode_languageclient_1.LanguageClient(id, name, serverOptions, clientOptions);
    languageClient.registerProposedFeatures();
    context.subscriptions.push(languageClient.start());
    await languageClient.onReady();
    const languageClientProxy = {
        code2ProtocolConverter: languageClient.code2ProtocolConverter,
        sendRequest: (type, params) => languageClient.sendRequest(type, params)
    };
    return languageClientProxy;
};
//# sourceMappingURL=createLanguageClientProxy.js.map