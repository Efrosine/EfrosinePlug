import { AbstractInputSuggest, App, TFile } from "obsidian";

export class FileSugest extends AbstractInputSuggest<TFile> {
	constructor(app: App, inputEl: HTMLInputElement) {
		super(app, inputEl);
	}
	protected getSuggestions(query: string): TFile[] | Promise<TFile[]> {
		return this.app.vault
			.getFiles()
			.filter((file) => file.path.includes(query));
	}
	renderSuggestion(value: TFile, el: HTMLElement): void {
		el.setText(value.path);
	}
}
