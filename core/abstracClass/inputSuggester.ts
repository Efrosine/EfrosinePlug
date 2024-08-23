import EfrosinePlugin from "main";
import { AbstractInputSuggest } from "obsidian";

export abstract class inputSuggester<T> extends AbstractInputSuggest<T> {
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
