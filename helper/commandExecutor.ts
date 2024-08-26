import { MacroField, CaptureFunction, SequenceFunction } from "core/coreConfig";
import EfrosinePlugin from "main";
import { CaptureManager } from "manager/captureManager";
import { CommandManager } from "manager/commandManager";

/**
 * This class is used to execute the command.
 */ 
export class CommandExecutor {
	private plugin: EfrosinePlugin;

	constructor(plugin: EfrosinePlugin) {
		this.plugin = plugin;
	}

	/**
	 * This method is used to execute the command.
	 * 
	 * @param field - The macro field.
	 */
	execute(field: MacroField) {
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

/**
 * This class is used to check if the function is a capture function.
 * 
 * @param func - The function to test.
 */
function isCaptureFunction(func: any): func is CaptureFunction {
	return (func as CaptureFunction).toActiveFile !== undefined;
}

/**
 * This class is used to check if the function is a sequence function.
 * 
 * @param func - The function to test.
 */
function isSequenceFunction(func: any): func is SequenceFunction {
	return (func as SequenceFunction).value !== undefined;
}
