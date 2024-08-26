import { Modal, Notice, Setting } from "obsidian";
import EfrosinePlugin from "main";
import { DateOptions, FmFieldType } from "core/enums";
import { EfrosineSettings, FrontmatterField } from "core/coreConfig";

interface FmSettingModParams {
	plugin: EfrosinePlugin;
	fmField?: FrontmatterField;
}

export class FmSettingMod extends Modal {
	private plugin: EfrosinePlugin;
	private setting: EfrosineSettings;
	private fmField: FrontmatterField;
	private resolvePromise: (val?: unknown) => void;

	constructor({ plugin, fmField }: FmSettingModParams) {
		super(plugin.app);
		this.plugin = plugin;
		this.setting = plugin.settings;
		this.fmField = fmField
			? JSON.parse(JSON.stringify(fmField))
			: this.loadField();
	}

	open(): Promise<void> {
		super.open();
		return new Promise((resolve) => {
			this.resolvePromise = resolve;
		});
	}

	onOpen(): void {
		const { fmField, plugin, setting, titleEl, modalEl } = this;
		titleEl.setText("Add Frontmatter Field");
		const oldFmField = { ...fmField };
		this.onRebuild();

		const footerEl = modalEl.createDiv({ cls: "efro-footer-actions" });

		const addButton = footerEl.createEl("button", {
			text: fmField.name === "" ? "Add" : "Update",
			cls: "mod-cta",
		});
		addButton.addEventListener("click", () => {
			if (fmField.name.trim() === "") {
				new Notice("Name cannot be empty");
				return;
			}

			let index = setting.fmFields.findIndex(
				(field) => field.name === oldFmField.name
			);
			if (index >= 0) {
				setting.fmFields[index] = fmField;
			} else {
				setting.fmFields.push(fmField);
			}

			plugin.saveSettings(setting);
			this.close();
		});
	}

	onClose(): void {
		const { contentEl } = this;
		contentEl.empty();
		this.resolvePromise();
	}

	/**
	 * Load the field
	 * @returns FrontmatterField
	 */
	private loadField(): FrontmatterField {
		this.fmField = {
			name: "",
			type: FmFieldType.Text,
		};
		return this.fmField;
	}

	private onRebuild(): void {
		const { fmField, contentEl } = this;
		contentEl.empty();

		//Name Field
		if (fmField.type === FmFieldType.Tags) {
			fmField.name = "tags";
		}

		new Setting(contentEl).setName("Name :").addText((text) =>
			text
				.setPlaceholder("inupt name")
				.setValue(fmField.name)
				.onChange((value) => (fmField.name = value))
				.setDisabled(fmField.type === FmFieldType.Tags)
				.inputEl.classList.add("full-width")
		);

		//Type Field
		new Setting(contentEl).setName("Type :").addDropdown((dropdown) =>
			dropdown
				.addOptions(
					Object.fromEntries(
						Object.entries(FmFieldType).map(([key, val]) => [
							val as string,
							key,
						])
					)
				)
				.setValue(fmField.type)
				.onChange((value) => {
					fmField.type = value as FmFieldType;
					this.onRebuild();
				})
		);

		//Select Field
		if (fmField.type === FmFieldType.Select) {
			fmField.options = fmField.options ?? [];
			let optionValue = "";
			new Setting(contentEl)
				.setName("Options :")
				.addText((text) =>
					text
						.setPlaceholder("insert option")
						.onChange((value) => (optionValue = value))
						.inputEl.classList.add("full-width")
				)
				.addButton((button) =>
					button
						.setButtonText("Add Option")
						.setClass("mod-cta")
						.onClick(() => {
							fmField.options?.push(optionValue);
							this.onRebuild();
						})
				);

			for (let idx = 0; idx < fmField.options.length; idx++) {
				let field = fmField.options[idx];
				new Setting(contentEl)
					.setClass("no-line")
					.addText((text) =>
						text
							.setValue(field)
							.onChange((value) => {
								field = value;
								fmField.options![idx] = field;
							})
							.inputEl.classList.add("full-width")
					)
					.addButton((button) =>
						button
							.setIcon("trash")
							.setClass("mod-warning")
							.onClick(() => {
								fmField.options?.remove(field);
								this.onRebuild();
							})
					);
			}
		}

		//Date and DateTime Field
		if (
			fmField.type === FmFieldType.Date ||
			fmField.type === FmFieldType.DateTime
		) {
			new Setting(contentEl)
				.setName("Default Value :")
				.setClass("no-line")
				.addDropdown((dropdown) =>
					dropdown
						.addOptions(
							Object.fromEntries(
								Object.entries(DateOptions).map(
									([key, val]) => [val as string, key]
								)
							)
						)
						.setValue(fmField.dateOptions ?? DateOptions.Now)
						.onChange((value) => {
							fmField.dateOptions = value as DateOptions;
							this.onRebuild();
						})
				);
		}
	}
}
