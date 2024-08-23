import EfrosinePlugin from "main";
import { ButtonField } from "entity/buttonField";

export class ButtonManager {
	plugin: EfrosinePlugin;

	constructor(plugin: EfrosinePlugin) {
		this.plugin = plugin;
	}

	insertButton(button: ButtonField): void {
		const editor = this.plugin.app.workspace.activeEditor?.editor;
		if (!editor) return;

		const cursorLine = editor.getCursor().line;
		const buttonString = ButtonField.toString(button);

		editor.replaceRange(buttonString, {
			line: cursorLine + 1,
			ch: 0,
		});
	}
}
