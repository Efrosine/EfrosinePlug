import { Modal, Notice, Setting } from "obsidian";
import EfrosinePlugin from "main";
import { EfrosineSettings } from "core/coreConfig";
import { CommandSugest } from "helper/suggester";
import { ButtonField } from "entity/buttonField";
import { ButtonPosition, ButtonType } from "core/enums";

interface ButtonSettingModParams {
	plugin: EfrosinePlugin;
	buttonField?: ButtonField;
}

export class ButtonSettingMod extends Modal {
	private plugin: EfrosinePlugin;
	private setting: EfrosineSettings;
	private buttonField: ButtonField;
	private resolvePromise: (val?: unknown) => void;

	constructor({ plugin, buttonField }: ButtonSettingModParams) {
		super(plugin.app);
		this.plugin = plugin;
		this.setting = plugin.settings;
		this.buttonField = buttonField
			? { ...buttonField }
			: ButtonField.empty();
	}

	open(): Promise<void> {
		super.open();
		return new Promise((resolve) => {
			this.resolvePromise = resolve;
		});
	}

	onOpen(): void {
		const { buttonField, plugin, setting, contentEl, titleEl, modalEl } =
			this;
		const oldButtonField = { ...buttonField };
		titleEl.setText("Add Button Field");
		this.onRebuild(contentEl);

		const footerEl = modalEl.createDiv({ cls: "efro-footer-actions" });

		const addButton = footerEl.createEl("button", {
			text: buttonField.name === "" ? "Add" : "Update",
			cls: "mod-cta",
		});

		addButton.addEventListener("click", () => {
			if (buttonField.name.trim() === "") {
				new Notice("Name cannot be empty");
				return;
			}

			if (buttonField) {
				let index = setting.buttonFields.findIndex(
					(field) => field.name === oldButtonField.name
				);
				if (index >= 0) {
					setting.buttonFields[index] = buttonField;
				} else {
					setting.buttonFields.push(buttonField);
				}
			}

			plugin.saveData(setting);
			this.close();
		});
	}

	onClose(): void {
		const { contentEl } = this;
		contentEl.empty();
		this.resolvePromise();
	}

	private onRebuild(contentEl: HTMLElement): void {
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
