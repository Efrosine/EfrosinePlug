import { AbstractInputSuggest, App, Command, TFile } from "obsidian";
import { CommandEngine } from "./commandEngine";
import EfrosinePlugin from "main";

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

export class CommandSugest extends AbstractInputSuggest<Command> {
	plugin: EfrosinePlugin;
	constructor(plugin: EfrosinePlugin, inputEl: HTMLInputElement) {
		super(plugin.app, inputEl);
		this.plugin = plugin;
	}
	protected getSuggestions(query: string): Command[] | Promise<Command[]> {
		const commands = new CommandEngine(this.plugin).listCommand();
		return commands.filter((command) => command.name.includes(query));
	}
	renderSuggestion(value: Command, el: HTMLElement): void {
		el.setText(value.name);
	}
}
