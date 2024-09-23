import { ButtonField } from "entity/buttonField";
import EfrosinePlugin from "main";
import { ButtonManager } from "manager/buttonManager";
import { App, SuggestModal, TFile } from "obsidian";

export class NavButtonCommadMod extends SuggestModal<TFile> {
	plugin: EfrosinePlugin;
	butttonField: ButtonField;

	constructor(app: App, plugin: EfrosinePlugin, butttonField: ButtonField) {
		super(app);
		this.plugin = plugin;
		this.butttonField = butttonField;
	}
	getSuggestions(query: string): TFile[] | Promise<TFile[]> {
		return this.app.vault
			.getFiles()
			.filter((file) => file.name.includes(query));
	}
	renderSuggestion(value: TFile, el: HTMLElement) {
		el.setText(value.name);
	}
	onChooseSuggestion(item: TFile, evt: MouseEvent | KeyboardEvent) {
		this.butttonField.filePath = item.path;
		new ButtonManager(this.plugin).insertButton(this.butttonField);
		this.close();
	}
}
