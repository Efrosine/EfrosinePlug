import { App, Command } from "obsidian";
import EfrosinePlugin from "main";
import { MacroField } from "core/coreConfig";
import { CommandExecutor } from "helper/commandExecutor";
export class CommandManager {
	private app: App;
	private plugin: EfrosinePlugin;

	constructor(plugin: EfrosinePlugin) {
		this.plugin = plugin;
		this.app = plugin.app;
	}

	addCommand(field: MacroField) {
		this.plugin.addCommand({
			id: field.name,
			name: field.name,
			callback: () => {
				new CommandExecutor(this.plugin).execute(field);
			},
		});
	}

	removeCommand(id: string) {
		if (this.findCommand(this.formatCommandId(id))) {
			// @ts-ignore
			delete this.app.commands.commands[this.formatCommandId(id)];
			//@ts-ignore
			delete this.app.commands.editorCommands[this.formatCommandId(id)];
		}
	}

	renameCommand(oldField: MacroField, newField: MacroField) {
		this.removeCommand(oldField.name);
		this.addCommand(newField);
	}

	listCommand(): Command[] {
		//@ts-ignore
		return this.app.commands.listCommands();
	}

	findCommand(id: string): Command {
		//@ts-ignore
		return this.app.commands.findCommand(id);
	}

	loadCommands() {
		const macroFields = this.plugin.settings.macroFields.filter(
			(field) => field.addToCommand
		);
		macroFields.forEach((field) => {
			this.addCommand(field);
		});
	}

	async executeCommand(cmd: Command) {
		// @ts-ignore
		await this.app.commands.executeCommand(cmd);
	}

	async executeCommandById(id: string) {
		//@ts-ignore
		await this.app.commands.executeCommandById(id);
	}

	private formatCommandId(id: string): string {
		return "efrosine-plug:" + id;
	}
}
