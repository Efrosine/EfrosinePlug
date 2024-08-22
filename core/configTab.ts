import EfrosinePlugin from "../main";
import { PluginSettingTab, Setting } from "obsidian";
import { AddFmSettingsMod as AddFmSettingdMod } from "../modal/addFmSettingsMod";
import { MacroCaptureSetupMod } from "../modal/setupCaptureMacroSettingsMod";
import { FrontmatterField, MacroField } from "./coreConfig";
import { FmFieldType, MacroType } from "./enums";
import { AddButtonSettingsMod } from "modal/addButtonSettingsMod";
import { ButtonField } from "entity/buttonField";

interface SettingsTabParams {
	plugin: EfrosinePlugin;
}

export class SettingsTab extends PluginSettingTab {
	private plugin: EfrosinePlugin;

	constructor({ plugin }: SettingsTabParams) {
		super(plugin.app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		this.containerEl.empty();

		this.containerEl.createEl("h2", {
			text: "Settings for my awesome plugin",
		});

		this.containerEl.createEl("h3", { text: "Frontmatter Field" });
		new FrontmatterSettingRenderrer(this, this.plugin).renderItem();
		this.containerEl.createEl("h3", { text: "Macro Field" });
		new MacroSettingRenderrer(this, this.plugin).renderItem();
		this.containerEl.createEl("h3", { text: "Button Field" });
		new ButtonSettingRendererrer(this, this.plugin).renderItem();
	}
}

abstract class SettingsRenderrer<T> {
	containerEl: HTMLElement;
	parent: SettingsTab;
	plugin: EfrosinePlugin;

	constructor(parent: SettingsTab, plugin: EfrosinePlugin) {
		this.parent = parent;
		this.containerEl = parent.containerEl;
		this.plugin = plugin;
	}

	public renderItem() {
		const mainDiv = this.containerEl.createDiv();
		this.renderMainInput(mainDiv);
		this.renderChildItems(mainDiv);
	}

	protected abstract renderMainInput(mainDiv: HTMLElement): void;

	protected abstract getNameNDesc(item: T): { name: string; desc: string };

	protected abstract getItems(): T[];

	protected abstract editItem(item: T): void;

	protected abstract deleteItem(item: T): void;

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
}

class FrontmatterSettingRenderrer extends SettingsRenderrer<FrontmatterField> {
	protected renderMainInput(mainDiv: HTMLElement): void {
		new Setting(mainDiv)
			.setName("Add Frontmatter Field")
			.setDesc("Add a new property to the frontmatter")
			.addButton((button) =>
				button
					.setButtonText("Add Field")
					.setClass("mod-cta")
					.onClick(() => {
						new AddFmSettingdMod({ plugin: this.plugin })
							.open()
							.then(() => this.parent.display());
					})
			);
	}
	protected getNameNDesc(item: FrontmatterField): {
		name: string;
		desc: string;
	} {
		let desc: string = item.type;
		if (item.type === FmFieldType.Select) {
			desc = `${item.type}: ${item.options!.join(", ")}`;
		}
		if (
			item.type === FmFieldType.Date ||
			item.type === FmFieldType.DateTime
		) {
			desc = `${item.type}: ${item.dateOptions}`;
		}
		return { name: item.name, desc: desc };
	}
	protected getItems(): FrontmatterField[] {
		return this.plugin.settings.fmFields || [];
	}
	protected editItem(item: FrontmatterField): void {
		new AddFmSettingdMod({
			plugin: this.plugin,
			fmField: item,
		})
			.open()
			.then(() => this.parent.display());
	}
	protected deleteItem(item: FrontmatterField): void {
		const { settings } = this.plugin;
		settings.fmFields = settings.fmFields.filter(
			(field) => field.name !== item.name
		);
		this.plugin.saveSettings(settings);
		this.parent.display();
	}
}

class MacroSettingRenderrer extends SettingsRenderrer<MacroField> {
	protected renderMainInput(mainDiv: HTMLElement): void {
		let name: string = "";
		let type: MacroType = MacroType.Capture;
		new Setting(mainDiv)
			.setName("Add Custom Macro")
			.setDesc("Add a new custom macro")
			.addText((text) => {
				text.setPlaceholder("Name")
					.setValue(name)
					.onChange((value) => (name = value));
			})
			.addDropdown((dropdown) =>
				dropdown
					.addOptions(
						Object.fromEntries(
							Object.entries(MacroType).map(([key, value]) => [
								value as string,
								key,
							])
						)
					)
					.onChange((value) => (type = value as MacroType))
			)
			.addButton((button) =>
				button
					.setButtonText("Add Command")
					.setClass("mod-cta")
					.onClick(() => {
						if (name.length < 0 || !type) return;
						this.plugin.settings.macroFields.push({
							name: name,
							type: type,
							addToCommand: false,
						});
						this.plugin.saveSettings(this.plugin.settings);
						this.parent.display();
					})
			);
	}
	protected getNameNDesc(item: MacroField): { name: string; desc: string } {
		const { name, type } = item;
		return { name: name, desc: type };
	}
	protected getItems(): MacroField[] {
		return this.plugin.settings.macroFields || [];
	}
	protected editItem(item: MacroField): void {
		new MacroCaptureSetupMod({
			plugin: this.plugin,
			macroField: item,
		}).open();
	}
	protected deleteItem(item: MacroField): void {
		const { settings } = this.plugin;
		settings.macroFields = settings.macroFields.filter(
			(field) => field.name !== item.name
		);
		this.plugin.saveSettings(settings);
		this.parent.display();
	}
}

class ButtonSettingRendererrer extends SettingsRenderrer<ButtonField> {
	protected renderMainInput(mainDiv: HTMLElement): void {
		new Setting(mainDiv)
			.setName("Add Custom Button")
			.setDesc("Create button for your needs")
			.addButton((button) =>
				button
					.setButtonText("Add Button")
					.setClass("mod-cta")
					.onClick(() =>
						new AddButtonSettingsMod({ plugin: this.plugin })
							.open()
							.then(() => this.parent.display())
					)
			);
	}
	protected getNameNDesc(item: ButtonField): { name: string; desc: string } {
		const { name, command, position, type } = item;
		const desc = `Type: ${type}, Position: ${position}, Command: ${command.name}`;
		return { name: name, desc: desc };
	}
	protected getItems(): ButtonField[] {
		return this.plugin.settings.buttonFields || [];
	}
	protected editItem(item: ButtonField): void {
		new AddButtonSettingsMod({
			plugin: this.plugin,
			buttonField: item,
		})
			.open()
			.then(() => this.parent.display());
	}
	protected deleteItem(item: ButtonField): void {
		const { settings } = this.plugin;
		settings.buttonFields = settings.buttonFields.filter(
			(field) => field.name !== item.name
		);
		this.plugin.saveSettings(settings);
		this.parent.display();
	}
}
