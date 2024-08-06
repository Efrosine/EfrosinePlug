import EfrosinePlugin from "../main";
import { Modal, Notice } from "obsidian";
import { DateOptions, FmFieldType } from "../configs/enums";
import { InputTextEl } from "./modComponent/inputTextEl";
import { InputDropdwonEl } from "./modComponent/inputDropdownEl";
import { InputSelectEl } from "./modComponent/inputSelectEl";
import { EfrosineSettings, FrontmatterField } from "../configs/coreConfig";

interface AddFmFieldModParams {
	plugin: EfrosinePlugin;
	fmField?: FrontmatterField;
}

export class AddFmFieldMod extends Modal {
	private plugin: EfrosinePlugin;
	private setting: EfrosineSettings;
	private fmField: FrontmatterField;
	private resolvePromise: (val?: unknown) => void;

	constructor({ plugin, fmField }: AddFmFieldModParams) {
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

	loadField(): FrontmatterField {
		this.fmField = this.fmField ?? {
			name: "",
			type: FmFieldType.Text,
			options: null,
			dateOptions: null,
		};
		this.setting = this.plugin.settings;
		return this.fmField;
	}

	onOpen(): void {
		this.loadField();
		const { contentEl, titleEl, modalEl } = this;
		titleEl.setText("Add Frontmatter Field");
		this.onRebuild(contentEl);

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

	onRebuild(contentEl: HTMLElement): void {
		contentEl.empty();

		//Name Field

		if (this.fmField.type === FmFieldType.Tags) {
			this.fmField.name = "tags";
		}
		const nameDiv = new InputTextEl({
			parent: contentEl,
			label: "Name",
			value: this.fmField.name,
			disable: this.fmField.type === FmFieldType.Tags,
		}).create((value) => {
			this.fmField.name = value;
		});

		contentEl.appendChild(nameDiv);

		//Type Field
		const typeMap = new Map<string, string>();
		Object.entries(FmFieldType).forEach(([key, value]) => {
			typeMap.set(key, value);
		});
		const typeDiv = new InputDropdwonEl({
			parent: contentEl,
			label: "Type",
			option: typeMap,
			selected: this.fmField.type,
		}).create((value) => {
			this.fmField.type = value as FmFieldType;
			this.onRebuild(contentEl);
		});
		contentEl.appendChild(typeDiv);

		//Select Field
		if (this.fmField.type === FmFieldType.Select) {
			const selectDiv = new InputSelectEl({
				parent: contentEl,
				label: "Options",
				option: this.fmField.options ?? [],
			}).create((value) => {
				this.fmField.options = value;
				this.onRebuild(contentEl);
			});
			contentEl.appendChild(selectDiv);
		}

		//Date and DateTime Field
		if (
			this.fmField.type === FmFieldType.Date ||
			this.fmField.type === FmFieldType.DateTime
		) {
			const dateDiv = new InputDropdwonEl({
				parent: contentEl,
				label: "Default Value",
				option: new Map(
					Object.entries(DateOptions).map(([key, value]) => [
						key,
						value,
					])
				),
				selected: this.fmField.dateOptions ?? DateOptions.Now,
			}).create((value) => {
				this.fmField.dateOptions = value as DateOptions;
			});

			contentEl.appendChild(dateDiv);
		}
	}
}
