import {
	SequenceFunction,
	CaptureFunction,
	MacroField,
} from "configs/coreConfig";
import EfrosinePlugin from "main";
import { App, Command } from "obsidian";
import { CaptureFileEngine } from "./captureFileEngine";
export class CommandEngine {
	private app: App;
	private plugin: EfrosinePlugin;
	constructor(plugin: EfrosinePlugin) {
		this.plugin = plugin;
		this.app = plugin.app;
	}

	public addCommand(field: MacroField) {
		this.plugin.addCommand({
			id: field.name,
			name: field.name,
			callback: async () => {
				await new FuntionExecutor(this.plugin).execute(field);
			},
		});
	}

	private formatCommandId(id: string): string {
		return "efrosine-plug:" + id;
	}

	public findCommand(id: string) {
		//@ts-ignore
		return this.app.commands.findCommand(this.formatCommandId(id));
	}

	public removeCommand(id: string) {
		if (this.findCommand(id)) {
			// @ts-ignore
			delete this.app.commands.commands[this.formatCommandId(id)];
			//@ts-ignore
			delete this.app.commands.editorCommands[this.formatCommandId(id)];
		}
	}

	public loadCommands() {
		const macroFields = this.plugin.settings.macros;
		macroFields.forEach((field) => {
			if (field.addToCommand) this.addCommand(field);
		});
	}
}

class FuntionExecutor {
	private plugin: EfrosinePlugin;

	constructor(plugin: EfrosinePlugin) {
		this.plugin = plugin;
	}

	public async execute(field: MacroField) {
		// console.log(field);
		if (isCaptureFunction(field.funcions)) {
			// console.log("Capture Function");
			new CaptureFileEngine({
				plugin: this.plugin,
				macroField: field,
				// func: field.funcions,
			}).call();
		} else if (isSequenceFunction(field.funcions)) {
			console.log("Sequence Function");
		}
	}
}

function isCaptureFunction(func: any): func is CaptureFunction {
	return (func as CaptureFunction).toActiveFile !== undefined;
}

function isSequenceFunction(func: any): func is SequenceFunction {
	return (func as SequenceFunction).value !== undefined;
}
