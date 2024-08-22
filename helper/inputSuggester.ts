import { AbstractInputSuggest, Command, TFile } from "obsidian";
import { CommandManager } from "../manager/commandManager";
import EfrosinePlugin from "main";

abstract class InputSuggester<T> extends AbstractInputSuggest<T> {
	plugin: EfrosinePlugin;
	constructor(plugin: EfrosinePlugin, inputEl: HTMLInputElement) {
		super(plugin.app, inputEl);
		this.plugin = plugin;
	}

	protected abstract getItems(): T[];

	protected abstract filterItems(item: T, query: string): boolean;

	protected getSuggestions(query: string): T[] | Promise<T[]> {
		return this.getItems().filter((item) => this.filterItems(item, query));
	}

	abstract renderSuggestion(value: T, el: HTMLElement): void;
}

export class FileSuggester extends InputSuggester<TFile> {
	protected getItems(): TFile[] {
		return this.app.vault.getFiles();
	}

	protected filterItems(item: TFile, query: string): boolean {
		return item.path.includes(query);
	}

	renderSuggestion(value: TFile, el: HTMLElement): void {
		el.setText(value.path);
	}
}

export class CommandSugest extends InputSuggester<Command> {
	protected getItems(): Command[] {
		return new CommandManager(this.plugin).listCommand();
	}

	protected filterItems(item: Command, query: string): boolean {
		return item.name.toLowerCase().includes(query.toLowerCase());
	}

	renderSuggestion(value: Command, el: HTMLElement): void {
		el.setText(value.name);
	}
}
