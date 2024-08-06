import EfrosinePlugin from "../main";
import { PluginSettingTab, Setting } from "obsidian";
import { AddFmFieldMod } from "../modal/addFmFieldMod";
import { FrontmatterField } from "../configs/coreConfig";
import { FmFieldType } from "./enums";

interface SettingsTabParams {
	plugin: EfrosinePlugin;
}

export class SettingsTab extends PluginSettingTab {
	private plugin: EfrosinePlugin;
	private fmFields: FrontmatterField[] = [];

	constructor({ plugin }: SettingsTabParams) {
		super(plugin.app, plugin);
		this.plugin = plugin;
		this.fmFields = this.plugin.settings.fmFields || [];
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl("h2", { text: "Settings for my awesome plugin" });

		containerEl.createEl("h3", { text: "Frontmatter Field" });
		const addFmDiv = containerEl.createDiv();

		new Setting(addFmDiv)
			.setName("Add Frontmatter Property")
			.setDesc("Add a new property to the frontmatter")
			.addButton((button) =>
				button
					.setButtonText("Add Field")
					.setClass("mod-cta")
					.onClick(() => {
						new AddFmFieldMod({ plugin: this.plugin })
							.open()
							.then(() => this.display());
					})
			);

		for (let field of this.fmFields) {
			const itemFmDiv = addFmDiv.createDiv();
			let descVal: string = field.type;

			if (field.type === FmFieldType.Select) {
				descVal = `${field.type}: ${field.options!.join(", ")}`;
			}

			if (
				field.type === FmFieldType.Date ||
				field.type === FmFieldType.DateTime
			) {
				descVal = `${field.type}: ${field.dateOptions}`;
			}

			new Setting(itemFmDiv)
				.setName(field.name)
				.setDesc(descVal)
				.addButton((button) =>
					button.setIcon("edit").onClick(() => {
						new AddFmFieldMod({
							plugin: this.plugin,
							fmField: field,
						})
							.open()
							.then(() => this.display());
					})
				)
				.addButton((button) =>
					button
						.setIcon("trash")
						.setClass("mod-warning")
						.onClick(() => {
							this.fmFields = this.fmFields.filter(
								(item) => item.name !== field.name
							);
							this.plugin.saveFmSetting(this.fmFields);
							this.display();
						})
				);
		}
	}
}
