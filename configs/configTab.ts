import EfrosinePlugin from "../main";
import { PluginSettingTab, Setting } from "obsidian";
import { AddFmSettingsMod as AddFmSettingdMod } from "../modal/addFmSettingsMod";
import { SetupCaptureMacroSettingsMod } from "../modal/setupCaptureMacroSettingsMod";
import { EfrosineSettings, FrontmatterField } from "../configs/coreConfig";
import { FmFieldType, MacroType } from "./enums";

interface SettingsTabParams {
	plugin: EfrosinePlugin;
}

export class SettingsTab extends PluginSettingTab {
	private plugin: EfrosinePlugin;
	private fmFields: FrontmatterField[] = [];
	private settings: EfrosineSettings;

	constructor({ plugin }: SettingsTabParams) {
		super(plugin.app, plugin);
		this.plugin = plugin;
		this.fmFields = plugin.settings.fmFields || [];
		this.settings = plugin.settings;
	}

	display(): void {
		this.containerEl.empty();

		this.containerEl.createEl("h2", {
			text: "Settings for my awesome plugin",
		});

		this.renderFrontmatterFields();
		this.renderCustomMacro();
		this.renderCustomButton();
	}
	private renderCustomButton(): void {
		this.containerEl.createEl("h3", { text: "Custom Buttons" });

		const div = this.containerEl.createDiv();

		new Setting(div)
			.setName("Add CustomButtons")
			.setDesc("Create button for your needs")
			.addText((text) => text.setPlaceholder("Name"))
			.addButton((button) =>
				button
					.setButtonText("Create")
					.setClass("mod-cta")
					.onClick(() => {})
			);
	}

	private renderCustomMacro(): void {
		let name: string = "";
		let type: MacroType = MacroType.Capture;
		this.containerEl.createEl("h3", {
			text: "Custom Macros",
		});

		const div = this.containerEl.createDiv();

		new Setting(div)
			.setName("Add Custom Macro")
			.setDesc("Add a new custom Macro")
			.addText((text) => {
				text.setValue(name);
				text.setPlaceholder("Name").onChange((value) => {
					name = value;
				});
			})
			.addDropdown((dropdown) => {
				dropdown
					.addOptions(
						Object.fromEntries(
							Object.entries(MacroType).map(([key, value]) => {
								return [value as string, key];
							})
						)
					)
					.onChange((value) => {
						type = value as MacroType;
					});
			})
			.addButton((button) =>
				button
					.setButtonText("Add Command")
					.setClass("mod-cta")
					.onClick(() => {
						if (name.length > 0 && type) {
							this.settings.macros.push({
								name: name,
								type: type,
								addToCommand: false,
							});
							this.plugin.saveSettings(this.settings);
							this.display();
						}
					})
			);

		for (let field of this.settings.macros) {
			const itemFmDiv = div.createDiv();
			let descVal: string = field.type;

			new Setting(itemFmDiv)
				.setName(field.name)
				.setDesc(descVal)
				.addButton((button) =>
					button.setIcon("edit").onClick(() => {
						new SetupCaptureMacroSettingsMod({
							plugin: this.plugin,
							macroField: field,
						}).open();
					})
				)
				.addButton((button) =>
					button
						.setIcon("trash")
						.setClass("mod-warning")
						.onClick(() => {
							this.settings.macros = this.settings.macros.filter(
								(item) => item.name !== field.name
							);
							this.plugin.saveMacroSetting(this.settings.macros);
							this.display();
						})
				);
		}
	}

	private renderFrontmatterFields(): void {
		this.containerEl.createEl("h3", { text: "Frontmatter Field" });
		const div = this.containerEl.createDiv();

		new Setting(div)
			.setName("Add Frontmatter Property")
			.setDesc("Add a new property to the frontmatter")
			.addButton((button) =>
				button
					.setButtonText("Add Field")
					.setClass("mod-cta")
					.onClick(() => {
						new AddFmSettingdMod({ plugin: this.plugin })
							.open()
							.then(() => this.display());
					})
			);

		for (let field of this.fmFields) {
			const itemFmDiv = div.createDiv();
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
						new AddFmSettingdMod({
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

	private buildChildField(parent: HTMLDivElement, arrays: []) {}
}

class BaseSettingsField {}
