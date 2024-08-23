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
		this.fmField = fmField ?? this.loadField();
	}

	open(): Promise<void> {
		super.open();
		return new Promise((resolve) => {
			this.resolvePromise = resolve;
		});
	}

	onOpen(): void {
		this.loadField();
		const { titleEl, modalEl } = this;
		titleEl.setText("Add Frontmatter Field");
		this.onRebuild();

		const footerEl = modalEl.createDiv({ cls: "efro-footer-actions" });

		const addButton = modalEl.createEl("button", {
			text: this.fmField.name === "" ? "Add" : "Update",
			cls: "mod-cta",
		});
		addButton.addEventListener("click", () => {
			if (this.fmField.name.trim() === "") {
				new Notice("Name cannot be empty");
				return;
			}

			if (this.fmField) {
				let index = this.setting.fmFields.indexOf(this.fmField);
				if (index !== -1) {
					this.setting.fmFields[index] = this.fmField;
				} else {
					this.setting.fmFields.push(this.fmField);
				}
			} else {
				this.setting.fmFields.push(this.fmField);
			}
			this.plugin.saveSettings(this.setting);
			this.close();
		});

		footerEl.appendChild(addButton);
		modalEl.appendChild(footerEl);
	}

	onClose(): void {
		const { contentEl } = this;
		contentEl.empty();
		this.resolvePromise();
	}

	private loadField(): FrontmatterField {
		this.fmField = this.fmField ?? {
			name: "",
			type: FmFieldType.Text,
			options: null,
			dateOptions: null,
		};
		this.setting = this.plugin.settings;
		return this.fmField;
	}

	private onRebuild(): void {
		const { contentEl } = this;
		contentEl.empty();

		//Name Field
		if (this.fmField.type === FmFieldType.Tags) {
			this.fmField.name = "tags";
		}

		new Setting(contentEl).setName("Name :").addText((text) =>
			text
				.setPlaceholder("inupt name")
				.setValue(this.fmField.name)
				.onChange((value) => (this.fmField.name = value))
				.setDisabled(this.fmField.type === FmFieldType.Tags)
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
				.setValue(this.fmField.type)
				.onChange((value) => {
					this.fmField.type = value as FmFieldType;
					this.onRebuild();
				})
		);

		//Select Field
		if (this.fmField.type === FmFieldType.Select) {
			this.fmField.options = this.fmField.options ?? [];
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
							this.fmField.options?.push(optionValue);
							this.onRebuild();
						})
				);

			for (let idx = 0; idx < this.fmField.options.length; idx++) {
				let field = this.fmField.options[idx];
				new Setting(contentEl)
					.setClass("no-line")
					.addText((text) =>
						text
							.setValue(field)
							.onChange((value) => {
								field = value;
								this.fmField.options![idx] = field;
							})
							.inputEl.classList.add("full-width")
					)
					.addButton((button) =>
						button
							.setIcon("trash")
							.setClass("mod-warning")
							.onClick(() => {
								this.fmField.options?.remove(field);
								this.onRebuild();
							})
					);
			}
		}

		//Date and DateTime Field
		if (
			this.fmField.type === FmFieldType.Date ||
			this.fmField.type === FmFieldType.DateTime
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
						.setValue(this.fmField.dateOptions ?? DateOptions.Now)
						.onChange((value) => {
							this.fmField.dateOptions = value as DateOptions;
							this.onRebuild();
						})
				);
		}
	}
}
