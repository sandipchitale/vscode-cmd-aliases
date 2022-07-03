import * as vscode from 'vscode';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';

class Alias implements vscode.QuickPickItem {
  label: string;
  description?: string | undefined;
  detail?: string | undefined;
  picked?: boolean | undefined;
  alwaysShow?: boolean | undefined;

  constructor(
    public alias: string,
    public command: string,
  ) {
    this.label = alias;
    this.description = command;
    if (/[$][*0-9T]/.test(command)) {
      this.detail = 'Needs additional parameters.';
    }
  }
}

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand('vscode-cmd-aliases.init', init);
  context.subscriptions.push(disposable);
  disposable = vscode.commands.registerCommand('vscode-cmd-aliases.execute', executeAlias);
  context.subscriptions.push(disposable);
  disposable = vscode.commands.registerCommand('vscode-cmd-aliases.edit', editAliases);
  context.subscriptions.push(disposable);

  const tictss = vscode.workspace.getConfiguration('terminal.integrated').get('commandsToSkipShell') as Array<string>;
  const index = tictss.findIndex((i) => i === 'vscode-cmd-aliases.execute');
  if (index === -1) {
    tictss.push('vscode-cmd-aliases.execute');
    vscode.workspace.getConfiguration('terminal.integrated').update('commandsToSkipShell', tictss, vscode.ConfigurationTarget.Global);
  }
}

function isFile(path: string): boolean {
  if (fs.existsSync(path) && fs.statSync(path).isFile()) {
    return true;
  }
  return false;
}

async function init() {

  let answer = await vscode.window.showInformationMessage('Initialize cmd aliases using dockey macros?', {
    modal: true
  }, {
    title: 'Yes', isCloseAffordance: false
  }, {
    title: 'No', isCloseAffordance: true
  });

  if (answer && answer.title === 'No') {
    return;
  }

  if (!isFile(path.join(os.homedir(), 'cmd.cmd'))) {
    fs.writeFileSync(path.join(os.homedir(), 'cmd.cmd'),
`@echo off
doskey /macrofile="%USERPROFILE%\\doskey.mac"
`
    );
  }

  if (!isFile(path.join(os.homedir(), 'doskey.mac'))) {
    fs.writeFileSync(path.join(os.homedir(), 'doskey.mac'),
`alias=doskey /macros
edalias=code "%USERPROFILE%\\doskey.mac"
.=explorer /e,.
e..=explorer /e,..
e~=explorer /e,"%userprofile%"
e=explorer /e,$*
cd~=cd /D "%userprofile%"
cd..=cd ..
`
    );
  }
  if (!isFile(path.join(os.homedir(), 'cmd.reg'))) {
    fs.writeFileSync(path.join(os.homedir(), 'cmd.reg'),
`Windows Registry Editor Version 5.00

[HKEY_CURRENT_USER\\Software\\Microsoft\\Command Processor]
"AutoRun"="%USERPROFILE%\\\\cmd.cmd"
`
    );
  }

  answer = await vscode.window.showInformationMessage(
`Will run ${path.join(os.homedir(), 'cmd.reg')} to activate cmd aliases. CAUTION: Modifies the registry.\n
You may want to review the ${path.join(os.homedir(), 'cmd.reg')} file and install it manually.\n
Proceed?
`, {
    modal: true
  }, {
    title: 'Yes', isCloseAffordance: false
  }, {
    title: 'No', isCloseAffordance: true
  });

  if (answer && answer.title === 'No') {
    return;
  }

  let terminal = vscode.window.activeTerminal;
  if (!terminal) {
    terminal = vscode.window.createTerminal('cmd');
  }

  await vscode.commands.executeCommand('workbench.action.terminal.sendSequence', {
    text: `REM CAUTION: The following command modifies the registry. Remove REM to run it.\r\n`
  });
  await vscode.commands.executeCommand('workbench.action.terminal.sendSequence', {
    text: `REM start ${path.join(os.homedir(), 'cmd.reg')}`
  });
  terminal.show();
}

async function executeAlias() {
  if (!isFile(path.join(os.homedir(), 'doskey.mac'))) {
    return;
  }
  const aliases = fs.readFileSync(path.join(os.homedir(), 'doskey.mac'), {
    'encoding': 'utf8'
  });

  const aliasLines = aliases.split(/\r?\n/);
  if (aliasLines.length === 0) {
    return;
  }
  aliasLines.sort();
  const aliasQuickPickItems: Array<Alias> = [];
  aliasLines.forEach((alias) => {
    const firstEqualAt = alias.indexOf('=');
    if (firstEqualAt !== -1) {
      const a = alias.substring(0, firstEqualAt);
      const c = alias.substring(firstEqualAt + 1);
      aliasQuickPickItems.push(new Alias(a, c));
    }
  });

  const aliasQuickPickItem = await vscode.window.showQuickPick(aliasQuickPickItems, {
    matchOnDescription: true,
    matchOnDetail: false
  });
  if (aliasQuickPickItem) {
    let suffix = ' ';
    if (aliasQuickPickItem.command.indexOf('$*') === -1) {
      suffix = '\r\n';
    }
    let terminal = vscode.window.activeTerminal;
    if (!terminal) {
      terminal = vscode.window.createTerminal('cmd');
    }
    await vscode.commands.executeCommand('workbench.action.terminal.sendSequence', {
      text: `REM ${aliasQuickPickItem.command}\r\n`
    });
    await vscode.commands.executeCommand('workbench.action.terminal.sendSequence', {
      text: aliasQuickPickItem.alias + suffix
    });
    terminal.show();
  }
}

async function editAliases() {
  if (isFile(path.join(os.homedir(), 'doskey.mac'))) {
    const doskeyDocument: vscode.TextDocument = await vscode.workspace.openTextDocument(path.join(os.homedir(), 'doskey.mac'));
    vscode.languages.setTextDocumentLanguage(doskeyDocument, 'doskey');
    const doskeyTextEditor = await vscode.window.showTextDocument(doskeyDocument, vscode.ViewColumn.Active);
    doskeyTextEditor.options.cursorStyle;
  }
}

export function deactivate() {}

