import { ButtonField, EfrosineSettings } from "configs/coreConfig";
import { CommandSugest } from "manager/fileSugest";
import EfrosinePlugin from "main";
import { Modal, Notice, Setting } from "obsidian";

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
		console.log("btfield", btField);
		this.buttonField = btField ?? {
			name: "",
			position: "",
			command: { name: "", id: "" },
		};
		console.log("this.buttonField", this.buttonField);
		this.setting = this.plugin.settings;
	}

	onOpen(): void {
		// this.loadField();
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
				let index = this.setting.buttons.indexOf(this.buttonField);
				if (index !== -1) {
					this.setting.buttons[index] = this.buttonField;
				} else {
					this.setting.buttons.push(this.buttonField);
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
		const { name, position, command } = this.buttonField;

		new Setting(contentEl).setName("Name").addText((text) =>
			text
				.setPlaceholder("Button Name")
				.setValue(name)
				.onChange((value) => (this.buttonField.name = value))
		);

		new Setting(contentEl).setName("Position").addDropdown((dropdown) =>
			dropdown
				.addOptions({ left: "Left", right: "Right" })
				.setValue(position)
				.onChange((value) => (this.buttonField.position = value))
		);

		new Setting(contentEl).setName("Command Id").addSearch((search) => {
			search.setPlaceholder("Command Id").setValue(command.name);
			const cmdSug = new CommandSugest(
				this.plugin,
				search.inputEl
			).onSelect((value) => {
				search.inputEl.value = value.name;
				this.buttonField.command = value;
				cmdSug.close();
			});
		});
	}
}
