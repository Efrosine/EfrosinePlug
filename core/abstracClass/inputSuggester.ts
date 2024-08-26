import EfrosinePlugin from "main";
import { AbstractInputSuggest } from "obsidian";

/**
 * Represents an abstract class for input suggesters.
 * @template T - The type of items in the suggester.
 */
export abstract class inputSuggester<T> extends AbstractInputSuggest<T> {
	plugin: EfrosinePlugin;

	constructor(plugin: EfrosinePlugin, inputEl: HTMLInputElement) {
		super(plugin.app, inputEl);
		this.plugin = plugin;
	}
	/**
	 * Retrieves the items for suggestion.
	 * @returns An array of items for suggestion.
	 */
	protected abstract getItems(): T[];

	/**
	 * Filters the items based on the given query.
	 * @param item - The item to be filtered.
	 * @param query - The query to filter the items.
	 * @returns A boolean indicating whether the item matches the query.
	 */
	protected abstract filterItems(item: T, query: string): boolean;

	/**
	 * Retrieves the suggestions based on the given query.
	 * @param query - The query to retrieve suggestions for.
	 * @returns An array of suggestions that match the query.
	 */

	protected getSuggestions(query: string): T[] | Promise<T[]> {
		return this.getItems().filter((item) => this.filterItems(item, query));
	}

	/**
	 * Renders a suggestion value into the provided HTML element.
	 *
	 * @param value The Suggestion value to render
	 * @param el The HTML element to render the suggestion into
	 */
	abstract renderSuggestion(value: T, el: HTMLElement): void;
}
