import { App, Command } from "obsidian";
import EfrosinePlugin from "main";
import { MacroField } from "core/coreConfig";
import { CommandExecutor } from "helper/commandExecutor";

/**
 * This class is used to manage the command.
 */
export class CommandManager {
	private app: App;
	private plugin: EfrosinePlugin;

	constructor(plugin: EfrosinePlugin) {
		this.plugin = plugin;
		this.app = plugin.app;
	}

	/**
	 * This method is used to add the command.
	 * 
	 * @param field - The macro field.
	 */ 
	addCommand(field: MacroField) {
		this.plugin.addCommand({
			id: field.name,
			name: field.name,
			callback: () => {
				new CommandExecutor(this.plugin).execute(field);
			},
		});
	}

	/**
	 * This method is used to remove the command.
	 * 
	 * @param id - The id of the command.
	 */
	removeCommand(id: string) {
		if (this.findCommand(this.formatCommandId(id))) {
			// @ts-ignore
			delete this.app.commands.commands[this.formatCommandId(id)];
			//@ts-ignore
			delete this.app.commands.editorCommands[this.formatCommandId(id)];
		}
	}

	/**
	 * This method is used to rename the command.
	 * 
	 * @param oldField - The old macro field.
	 * @param newField - The new macro field.
	 */
	renameCommand(oldField: MacroField, newField: MacroField) {
		this.removeCommand(oldField.name);
		this.addCommand(newField);
	}

	/**
	 * This method is used to get the list of commands.
	 * 
	 * @returns Command[]
	 */
	listCommand(): Command[] {
		//@ts-ignore
		return this.app.commands.listCommands();
	}

	/**
	 * This method is used to find the command by its id.
	 * 
	 * @param id - The id of the command.
	 * @returns Command
	 */
	findCommand(id: string): Command {
		//@ts-ignore
		return this.app.commands.findCommand(id);
	}

	/**
	 * This method is used to load
	 */
	loadCommands() {
		const macroFields = this.plugin.settings.macroFields.filter(
			(field) => field.addToCommand
		);
		macroFields.forEach((field) => {
			this.addCommand(field);
		});
	}

	/**
	 * This method is used to execute the command.
	 * 
	 * @param cmd - The command to execute.
	 */
	async executeCommand(cmd: Command) {
		// @ts-ignore
		await this.app.commands.executeCommand(cmd);
	}

	/**
	 * This method is used to execute the command by its id.
	 * 
	 * @param id - The id of the command.
	 */
	async executeCommandById(id: string) {
		//@ts-ignore
		await this.app.commands.executeCommandById(id);
	}

	/**
	 * This method is used to format the command id.
	 * 
	 * @param id - The id of the command.
	 */
	private formatCommandId(id: string): string {
		return "efrosine-plug:" + id;
	}
}
