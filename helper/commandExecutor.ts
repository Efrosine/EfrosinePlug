import { MacroField, CaptureFunction, SequenceFunction } from "core/coreConfig";
import EfrosinePlugin from "main";
import { CaptureManager } from "manager/captureManager";
import { CommandManager } from "manager/commandManager";


export class CommandExecutor {
	private plugin: EfrosinePlugin;

	constructor(plugin: EfrosinePlugin) {
		this.plugin = plugin;
	}

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
function isCaptureFunction(func: any): func is CaptureFunction {
	return (func as CaptureFunction).toActiveFile !== undefined;
}
function isSequenceFunction(func: any): func is SequenceFunction {
	return (func as SequenceFunction).value !== undefined;
}
