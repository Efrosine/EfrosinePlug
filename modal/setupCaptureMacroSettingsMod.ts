import {
	CaptureFunction,
	EfrosineSettings,
	MacroField,
} from "configs/coreConfig";
import { CaptureInsertWhere } from "configs/enums";
import EfrosinePlugin from "main";
import { Modal, Notice, Setting } from "obsidian";
import { FileSugest } from "manager/fileSugest";
import { CommandEngine } from "manager/commandEngine";

interface SetupCaptureMacroSettigsModParams {
	plugin: EfrosinePlugin;
	macroField: MacroField;
}
export class SetupCaptureMacroSettingsMod extends Modal {
	private plugin: EfrosinePlugin;
	private setting: EfrosineSettings;
	private macroField: MacroField;
	private captureFunction: CaptureFunction;
	private resolvePromise: (val?: unknown) => void;

	constructor({ plugin, macroField }: SetupCaptureMacroSettigsModParams) {
		super(plugin.app);
		this.plugin = plugin;
		this.setting = this.plugin.settings;
		this.macroField = macroField;
		this.captureFunction = this.loadField();
	}

	private loadField(): CaptureFunction {
		return (
			(this.macroField.funcions as CaptureFunction) ??
			({
				toActiveFile: true,
				filePath: "",
				inssertWhere: CaptureInsertWhere.Cursor,
				insertAtEndSection: false,
				value: "",
			} as CaptureFunction)
		);
	}

	open(): Promise<void> {
		super.open();
		return new Promise((resolve) => {
			this.resolvePromise = resolve;
		});
	}

	onOpen(): void {
		const { titleEl, modalEl } = this;
		titleEl.setText(`Setup Capture : ${this.macroField.name}`);

		this.onRebuild();

		const footerEl = modalEl.createDiv({ cls: "efro-footer-actions" });
		footerEl
			.createEl("button", {
				text: "Add",
				cls: "mod-cta",
			})
			.addEventListener("click", () => {
				this.macroField.funcions = this.captureFunction;
				let index = this.setting.macros.indexOf(this.macroField);
				this.setting.macros[index] = this.macroField;

				this.plugin.saveSettings(this.setting);
				this.close();
			});
	}

	private onRebuild(): void {
		const { macroField, contentEl } = this;
		contentEl.empty();
		new Setting(contentEl).setName("Name").addText((text) => {
			text.setValue(macroField.name);
			text.onChange((value) => {
				this.macroField.name = value;
			});
		});
		new Setting(contentEl)
			.setName("Add to Command")
			.setClass("no-line")
			.addToggle((toggle) => {
				toggle.setValue(macroField.addToCommand);
				toggle.onChange((value) => {
					console.log("toggle value : ", value);

					this.macroField.addToCommand = value;
					const commandEngine = new CommandEngine(this.plugin);
					if (value) {
						commandEngine.addCommand(macroField);
					} else {
						commandEngine.removeCommand(macroField.name);
					}
				});
			});
		new Setting(contentEl)
			.setName("To Active File")
			.setDesc("File to capture to")
			.setClass("no-line")
			.addToggle((toggle) => {
				toggle.setValue(this.captureFunction.toActiveFile);
				toggle.onChange((value) => {
					this.captureFunction.toActiveFile = value;
					this.onRebuild();
				});
			});

		if (!this.captureFunction.toActiveFile) {
			new Setting(contentEl).setName("File path").addSearch((search) => {
				search.setPlaceholder("File path");
				const filesug = new FileSugest(
					this.app,
					search.inputEl
				).onSelect((value) => {
					search.inputEl.value = value.path;
					this.captureFunction.filePath = value.path;
					filesug.close();
				});
			});
		}

		new Setting(contentEl)
			.setName("Insert Where")
			.addDropdown((dropdown) => {
				dropdown.addOptions(
					Object.fromEntries(
						Object.entries(CaptureInsertWhere).map(
							([key, value]) => {
								return [value, value as string];
							}
						)
					)
				);
				dropdown.setValue(this.captureFunction.inssertWhere);
				dropdown.onChange((value) => {
					this.captureFunction.inssertWhere =
						value as CaptureInsertWhere;
					this.onRebuild();
				});
			});

		if (
			this.captureFunction.inssertWhere === CaptureInsertWhere.Replace ||
			this.captureFunction.inssertWhere ===
				CaptureInsertWhere.InsertAfter ||
			this.captureFunction.inssertWhere ===
				CaptureInsertWhere.InsertBefore
		) {
			new Setting(contentEl)
				.setName("Insert Regex")
				.setClass("no-line")
				.addText((text) => {
					text.setValue(this.captureFunction.insertRegEx ?? "");
					text.onChange((value) => {
						this.captureFunction.insertRegEx = value;
					});
				});
		}

		if (
			this.captureFunction.inssertWhere === CaptureInsertWhere.InsertAfter
		) {
			new Setting(contentEl)
				.setName("Insert At End Section")
				.setClass("no-line")
				.addToggle((toggle) => {
					toggle.setValue(this.captureFunction.insertAtEndSection!);
					toggle.onChange((value) => {
						this.captureFunction.insertAtEndSection = value;
					});
				});
		}

		new Setting(contentEl)
			.setName("Value")
			.setDesc("{{value}} for fect from modal value")
			.addTextArea((text) => {
				text.setValue(this.captureFunction.value);
				text.onChange((value) => {
					this.captureFunction.value = value;
				});
			});
	}

	onClose(): void {
		const { contentEl } = this;
		contentEl.empty();
		this.resolvePromise();
	}
}
