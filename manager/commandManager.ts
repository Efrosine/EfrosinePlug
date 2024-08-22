import { SequenceFunction, CaptureFunction, MacroField } from "core/coreConfig";
import EfrosinePlugin from "main";
import { App, Command } from "obsidian";
import { CaptureManager } from "./captureManager";
export class CommandManager {
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
			callback: () => {
				new CommandExecutor(this.plugin).execute(field);
			},
		});
	}

	public listCommand(): Command[] {
		//@ts-ignore
		return this.app.commands.listCommands();
	}

	public findCommand(id: string): Command {
		//@ts-ignore
		return this.app.commands.findCommand(id);
	}

	private formatCommandId(id: string): string {
		return "efrosine-plug:" + id;
	}

	public removeCommand(id: string) {
		if (this.findCommand(this.formatCommandId(id))) {
			// @ts-ignore
			delete this.app.commands.commands[this.formatCommandId(id)];
			//@ts-ignore
			delete this.app.commands.editorCommands[this.formatCommandId(id)];
		}
	}

	public loadCommands() {
		const macroFields = this.plugin.settings.macroFields.filter(
			(field) => field.addToCommand
		);
		macroFields.forEach((field) => {
			this.addCommand(field);
		});
	}

	public async executeCommandById(id: string) {
		//@ts-ignore
		await this.app.commands.executeCommandById(id);
	}
	public async executeCommand(cmd: Command) {
		// @ts-ignore
		await this.app.commands.executeCommand(cmd);
	}
}

class CommandExecutor {
	private plugin: EfrosinePlugin;

	constructor(plugin: EfrosinePlugin) {
		this.plugin = plugin;
	}

	public execute(field: MacroField) {
		if (isCaptureFunction(field.funcions)) {
			new CaptureManager({
				plugin: this.plugin,
				macroField: field,
			}).call();
		} else if (isSequenceFunction(field.funcions)) {
			field.funcions.value.forEach(
				async (func) =>
					await new CommandManager(this.plugin).executeCommand(func)
			);
		}
	}
}

function isCaptureFunction(func: any): func is CaptureFunction {
	return (func as CaptureFunction).toActiveFile !== undefined;
}

function isSequenceFunction(func: any): func is SequenceFunction {
	return (func as SequenceFunction).value !== undefined;
}
