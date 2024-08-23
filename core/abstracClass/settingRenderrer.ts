import { Setting } from "obsidian";
import EfrosinePlugin from "main";
import { SettingsTab } from "core/configTab";

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

	renderItem() {
		const mainDiv = this.containerEl.createDiv();
		this.renderHeader(mainDiv);
		this.renderMainInput(mainDiv);
		this.renderChildItems(mainDiv);
	}

	protected renderHeader(mainDiv: HTMLElement): void {
		mainDiv.createEl("h3", { text: this.header });
	}

	protected abstract renderMainInput(mainDiv: HTMLElement): void;

	protected abstract getNameNDesc(item: T): { name: string; desc: string };

	protected abstract getItems(): T[];

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

	protected abstract editItem(item: T): void;

	protected abstract deleteItem(item: T): void;
}
