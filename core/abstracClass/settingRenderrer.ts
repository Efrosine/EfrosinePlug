import { Setting } from "obsidian";
import EfrosinePlugin from "main";
import { SettingsTab } from "core/configTab";


/**
 * Represents an abstract class for rendering settings.
 * @template T - The type of the settings item.
 */
export abstract class SettingsRenderrer<T> {
	plugin: EfrosinePlugin;
	parent: SettingsTab;
	containerEl: HTMLElement;
	header: string;

	constructor(plugin: EfrosinePlugin, parent: SettingsTab, header: string) {
		this.parent = parent;
		this.containerEl = parent.containerEl;
		this.plugin = plugin;
		this.header = header;
	}

	/**
	 * Renders an item by creating a main div element and rendering the header, main input, and child items within it.
	 */
	renderItem() {
		const mainDiv = this.containerEl.createDiv();
		this.renderHeader(mainDiv);
		this.renderMainInput(mainDiv);
		this.renderChildItems(mainDiv);
	}

	/**
	 * Renders the header element in the specified mainDiv.
	 * 
	 * @param mainDiv - The main div element to render the header in.
	 * @returns void
	 */
	protected renderHeader(mainDiv: HTMLElement): void {
		mainDiv.createEl("h3", { text: this.header });
	}

	/**
	 * Renders the main input element in the specified mainDiv.
	 * 
	 * @param mainDiv - The main div element to render the main input in.
	 * @returns void
	 */
	protected abstract renderMainInput(mainDiv: HTMLElement): void;

	/**
	 * Retrieves the name and description of the specified item.
	 * 
	 * @param item - The item to retrieve the name and description for.
	 * @returns An object containing the name and description of the item.
	 */
	protected abstract getNameNDesc(item: T): { name: string; desc: string };

	/**
	 * Retrieves the items for rendering.
	 * 
	 * @returns An array of items for rendering.
	 */
	protected abstract getItems(): T[];

	/**
	 * Renders the child items in the specified mainDiv.
	 * 
	 * @param mainDiv - The main div element to render the child items in.
	 * @returns void
	 */
	protected renderChildItems(mainDiv: HTMLElement) {
		const arrays = this.getItems();
		for (let field of arrays) {
			const itemDiv = mainDiv.createDiv();
			const { name, desc } = this.getNameNDesc(field);

			new Setting(itemDiv)
				.setName(name)
				.setDesc(desc)
				.addButton((button) =>
					button.setIcon("edit").onClick(() => this.editItem(field))
				)
				.addButton((button) =>
					button
						.setIcon("trash")
						.setClass("mod-warning")
						.onClick(() => this.deleteItem(field))
				);
		}
	}

	/**
	 * Edits the specified item.
	 * 
	 * @param item - The item to be edited.
	 * @returns void
	 */
	protected abstract editItem(item: T): void;

	/**
	 * Deletes the specified item.
	 * 
	 * @param item - The item to be deleted.
	 * @returns void
	 */
	protected abstract deleteItem(item: T): void;
}
