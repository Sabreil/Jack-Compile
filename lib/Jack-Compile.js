/* global atom */
"use strict";

const CompositeDisposable = require("atom").CompositeDisposable;
const path = require("path");
const child_process = require("child_process");

module.exports = {
    activate: () => {
        this.subscriptions = new CompositeDisposable();
        this.subscriptions.add(
            atom.commands.add("atom-text-editor", "Jack Run: run-f4", run_f4),
            atom.commands.add("atom-text-editor", "Jack run: run-f3", run_f3)
        );
    },
    deactivate: () => {
        this.subscriptions.dispose();
    },
    config: {
        f4_command: {
            title: "Command of F4",
            description: "{file} stands for current file path",
            type: "string",
            default: "JackCompiler.bat \"{file}\""
        },
        f3_command: {
            title: "Command of F3",
            description: "{file} stands for current file path",
            type: "string",
            default: "JackCompiler.bat \"{file}\""
        },
        disable_notifications: {
            title: "Disable success notifications",
            description: "Disable notifications while saving and running",
            type: "boolean",
            default: false
        },
        disable_notifications_on_fail: {
            title: "Disable failure notifications",
            description: "Disable notifications when extension name does not match",
            type: "boolean",
            default: false
        }
    },
    subscriptions: null
};

function run_f4() {
    run(atom.config.get("Jack-Compile.f4_command"));
}

function run_f3() {
    run(atom.config.get("Jack-Compile.f3_command"));
}

function run(command) {
    var editor = atom.workspace.getActiveTextEditor();
    if (!editor) {
        return;
    }
    var file = editor.buffer.file;
    if (!file) {
        notification("warning", "You have to create the file first.", true);
        return;
    }
    notification("info", "Saving...");
    editor.save();
    var info = path.parse(file.path);
    if (info.ext != ".jack") {
        notification("warning", format("{0} is not a .jack file, exit.", [info.base]));
        return;
    }
    notification("info", format("Running {0} ...", [info.base]));
    var ca = command.split(" ");
    ca.forEach(function(k, i, a) {
        a[i] = format(k, {
            "file": file.path,
            "dir": info.dir,
            "name": info.name,
            "ext": info.ext,
        });
    });
    var child = child_process.spawn("cmd", [
        "/c", "start", __dirname + "/../bin/cp.exe"
    ].concat(ca), {
        cwd: info.dir,
        detached: true
    });
    child.unref();
}

function notification(type, message, always) {
    if (type == "info") {
        if (always || !atom.config.get("Jack-Compile.disable_notifications")) {
            atom.notifications.add("info", message);
        }
    } else if (type == "warning") {
        if (always || !atom.config.get("Jack-Compile.disable_notifications_on_fail")) {
            atom.notifications.add("warning", message);
        }
    }
}

function format(string, array) {
    return string.replace(/{(.*?)}/g, k => array[k.substring(1, k.length - 1)]);
}
