import { SuggestModal } from "obsidian";
import EfrosinePlugin from "main";

import { ButtonField } from "entity/buttonField";
import { NavButtonCommadMod } from "./navButtonCommandMod";
import { ButtonType } from "core/enums";
import { ButtonManager } from "manager/buttonManager";

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
		if (item.type === ButtonType.Nav) {
			new NavButtonCommadMod(this.app, this.plugin, item).open();
		} else {
			new ButtonManager(this.plugin).insertButton(item);
		}
		this.close();
	}
}
