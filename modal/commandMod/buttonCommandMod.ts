import { SuggestModal } from "obsidian";
import EfrosinePlugin from "main";
import { ButtonManager } from "manager/buttonManager";
import { ButtonField } from "entity/buttonField";

/**
 * This class is responsible for managing the button command modal.
 */
export class ButtonCommandMod extends SuggestModal<ButtonField> {
	plugin: EfrosinePlugin;

	constructor(plugin: EfrosinePlugin) {
		super(plugin.app);
		this.plugin = plugin;
	}
	getSuggestions(query: string): ButtonField[] | Promise<ButtonField[]> {
		const buttons = this.plugin.settings.buttonFields;
		return buttons.filter((button) => button.name.includes(query));
	}
	renderSuggestion(value: ButtonField, el: HTMLElement) {
		el.setText(value.name);
	}
	onChooseSuggestion(item: ButtonField, evt: MouseEvent | KeyboardEvent) {
		new ButtonManager(this.plugin).insertButton(item);
		this.close();
	}
}
