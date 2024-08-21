import { ButtonField } from "configs/coreConfig";
import { ButtonEngine } from "manager/buttonEngine";
import EfrosinePlugin from "main";
import { SuggestModal } from "obsidian";

export class InsertButtonMod extends SuggestModal<ButtonField> {
	plugin: EfrosinePlugin;

	constructor(plugin: EfrosinePlugin) {
		super(plugin.app);
		this.plugin = plugin;
	}
	getSuggestions(query: string): ButtonField[] | Promise<ButtonField[]> {
		const buttons = this.plugin.settings.buttons;
		return buttons.filter((button) => button.name.includes(query));
	}
	renderSuggestion(value: ButtonField, el: HTMLElement) {
		el.setText(value.name);
	}
	onChooseSuggestion(item: ButtonField, evt: MouseEvent | KeyboardEvent) {
		new ButtonEngine(this.plugin).insertButton(item);
		this.close();
	}
}
