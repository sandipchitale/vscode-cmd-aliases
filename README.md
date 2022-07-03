# vscode-cmd-aliases

A VSCode extention to interactively execute cmd aises (doskey macros). Use command ```Alias: Execute``` (```alt+ctrl+shift+enter```) to pick from available aliases.

You can get started by using the command ```Alias: Init```. This will configure the following files:

| File name | Description |
|---|---|
|```%USERPROFILE%\doskey.mac```|Initial set of aliases (dockey macros)|
|```%USERPROFILE%\cmd.cmd```|The script that is run at the cmd.exe startup to load the aliases file above (doskey macros).|
|```%USERPROFILE%\cmd.reg```| **CAUTION:** A registry initialization file to activate the above files. Use at your own risk. You may want to run this file manually.|
|||

Use command ```Alias: Edit``` to edit the ```%USERPROFILE%\doskey.mac``` file (if it exists).

### **NOTE:** The contents of the ```%USERPROFILE%\cmd.reg``` file are:

```
Windows Registry Editor Version 5.00

[HKEY_CURRENT_USER\Software\Microsoft\Command Processor]
"AutoRun"="%USERPROFILE%\\cmd.cmd"
```

### **NOTE:** The following set of default aliases (dockey macros) are installed using ```%USERPROFILE%\doskey.mac``` :

```
alias=doskey /macros
edalias=code "%USERPROFILE%\\doskey.mac"
.=explorer /e,.
e..=explorer /e,..
e~=explorer /e,"%userprofile%"
e=explorer /e,$*
cd~=cd /D "%userprofile%"
cd..=cd ..
```
