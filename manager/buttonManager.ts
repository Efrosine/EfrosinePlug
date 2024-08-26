import EfrosinePlugin from "main";
import { ButtonField } from "entity/buttonField";

/**
 * This class is responsible for managing the button field.
 */
export class ButtonManager {
	plugin: EfrosinePlugin;

	constructor(plugin: EfrosinePlugin) {
		this.plugin = plugin;
	}

	/**
	 * This method is used to insert a button to ethe note at
	 * cursor position.
	 *
	 * @param button - The button to insert.
	 */
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
