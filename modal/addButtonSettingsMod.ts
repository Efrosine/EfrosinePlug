import { EfrosineSettings } from "core/coreConfig";
import { CommandSugest } from "../helper/inputSuggester";
import EfrosinePlugin from "main";
import { Modal, Notice, Setting } from "obsidian";
import { ButtonField } from "entity/buttonField";
import { ButtonPosition, ButtonType } from "core/enums";

interface AddButtonSettingsModParams {
	plugin: EfrosinePlugin;
	buttonField?: ButtonField;
}

export class AddButtonSettingsMod extends Modal {
	private plugin: EfrosinePlugin;
	private setting: EfrosineSettings;
	private buttonField: ButtonField;
	private resolvePromise: (val?: unknown) => void;

	constructor({ plugin, buttonField }: AddButtonSettingsModParams) {
		super(plugin.app);
		this.plugin = plugin;
		this.loadField(buttonField);
	}

	open(): Promise<void> {
		super.open();
		return new Promise((resolve) => {
			this.resolvePromise = resolve;
		});
	}

	loadField(btField?: ButtonField): void {
		this.buttonField = btField ?? ButtonField.empty();
		this.setting = this.plugin.settings;
	}

	onOpen(): void {
		const { contentEl, titleEl, modalEl } = this;
		titleEl.setText("Add Button Field");
		this.onRebuild(contentEl);

		const footerEl = modalEl.createDiv({ cls: "efro-footer-actions" });

		const addButton = footerEl.createEl("button", {
			text: this.buttonField.name === "" ? "Add" : "Update",
			cls: "mod-cta",
		});

		addButton.addEventListener("click", () => {
			if (this.buttonField.name.trim() === "") {
				new Notice("Name cannot be empty");
				return;
			}

			if (this.buttonField) {
				let index = this.setting.buttonFields.indexOf(this.buttonField);
				if (index !== -1) {
					this.setting.buttonFields[index] = this.buttonField;
				} else {
					this.setting.buttonFields.push(this.buttonField);
				}
			}

			this.plugin.saveData(this.setting);
			this.close();
		});
	}

	onClose(): void {
		const { contentEl } = this;
		contentEl.empty();
		this.resolvePromise();
	}

	onRebuild(contentEl: HTMLElement): void {
		const { name, position, type, command } = this.buttonField;

		new Setting(contentEl).setName("Name").addText((text) =>
			text
				.setPlaceholder("Button Name")
				.setValue(name)
				.onChange((value) => (this.buttonField.name = value))
		);

		new Setting(contentEl).setName("Type").addDropdown((dropdown) =>
			dropdown
				.addOptions(
					Object.fromEntries(
						Object.entries(ButtonType).map(([key, value]) => [
							value as string,
							key,
						])
					)
				)
				.setValue(type)
				.onChange(
					(value) => (this.buttonField.type = value as ButtonType)
				)
		);

		new Setting(contentEl).setName("Position").addDropdown((dropdown) =>
			dropdown
				.addOptions(
					Object.fromEntries(
						Object.entries(ButtonPosition).map(([key, value]) => [
							value as string,
							key,
						])
					)
				)
				.setValue(position)
				.onChange(
					(value) =>
						(this.buttonField.position = value as ButtonPosition)
				)
		);

		new Setting(contentEl).setName("Command").addSearch((search) => {
			search.setPlaceholder("Command").setValue(command.name);
			const cmdSug = new CommandSugest(
				this.plugin,
				search.inputEl
			).onSelect((value) => {
				search.inputEl.value = value.name;
				this.buttonField.command = value;
				cmdSug.close();
			});
			search.clearButtonEl.addEventListener("click", () => {
				search.inputEl.focus();
			});
		});
	}
}
