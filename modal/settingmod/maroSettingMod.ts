import { Modal, Setting } from "obsidian";
import EfrosinePlugin from "main";
import { CaptureFunction, EfrosineSettings, MacroField } from "core/coreConfig";
import { CaptureInsertWhere } from "core/enums";
import { FileSuggester } from "helper/suggester";
import { CommandManager } from "manager/commandManager";

interface MacroCaptureSettingModParams {
	plugin: EfrosinePlugin;
	macroField: MacroField;
}
export class MacroCaptureSettingMod extends Modal {
	private plugin: EfrosinePlugin;
	private setting: EfrosineSettings;
	private macroField: MacroField;
	private captureFunction: CaptureFunction;
	private resolvePromise: (val?: unknown) => void;

	constructor({ plugin, macroField }: MacroCaptureSettingModParams) {
		super(plugin.app);
		this.plugin = plugin;
		this.setting = this.plugin.settings;
		this.macroField = { ...macroField };
		this.captureFunction = this.loadField();
	}

	open(): Promise<void> {
		super.open();
		return new Promise((resolve) => {
			this.resolvePromise = resolve;
		});
	}

	onOpen(): void {
		const { macroField, plugin, setting, titleEl, modalEl } = this;
		titleEl.setText(`Setup Capture : ${macroField.name}`);
		const oldMarofield = { ...macroField };
		this.onRebuild();

		const footerEl = modalEl.createDiv({ cls: "efro-footer-actions" });
		footerEl
			.createEl("button", {
				text: "Add",
				cls: "mod-cta",
			})
			.addEventListener("click", () => {
				macroField.funcions = this.captureFunction;
				let index = setting.macroFields.findIndex(
					(field) => field.name === oldMarofield.name
				);
				setting.macroFields[index] = macroField;
				plugin.saveSettings(this.setting);
				const commandEngine = new CommandManager(plugin);
				if (macroField.addToCommand) {
					if (oldMarofield.name !== macroField.name) {
						commandEngine.renameCommand(oldMarofield, macroField);
					} else {
						commandEngine.addCommand(macroField);
					}
				}
				this.close();
			});
	}

	onClose(): void {
		const { contentEl } = this;
		contentEl.empty();
		this.resolvePromise();
	}

	private loadField(): CaptureFunction {
		let funcions = { ...this.macroField.funcions } as CaptureFunction;
		return (
			funcions ??
			({
				toActiveFile: true,
				filePath: "",
				inssertWhere: CaptureInsertWhere.Cursor,
				insertAtEndSection: false,
				value: "",
			} as CaptureFunction)
		);
	}

	private onRebuild(): void {
		const { macroField, captureFunction, contentEl } = this;
		contentEl.empty();
		new Setting(contentEl).setName("Name").addText((text) => {
			text.setValue(macroField.name);
			text.onChange((value) => {
				macroField.name = value;
			});
		});

		new Setting(contentEl)
			.setName("Add to Command")
			.setClass("no-line")
			.addToggle((toggle) => {
				toggle.setValue(macroField.addToCommand);
				toggle.onChange((value) => {
					macroField.addToCommand = value;
				});
			});

		new Setting(contentEl)
			.setName("To Active File")
			.setDesc("File to capture to")
			.setClass("no-line")
			.addToggle((toggle) => {
				toggle.setValue(captureFunction.toActiveFile);
				toggle.onChange((value) => {
					captureFunction.toActiveFile = value;
					this.onRebuild();
				});
			});

		if (!captureFunction.toActiveFile) {
			new Setting(contentEl).setName("File path").addSearch((search) => {
				search.setPlaceholder("File path");
				const filesug = new FileSuggester(
					this.plugin,
					search.inputEl
				).onSelect((value) => {
					search.inputEl.value = value.path;
					captureFunction.filePath = value.path;
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
							([_key, value]) => {
								return [value, value as string];
							}
						)
					)
				);
				dropdown.setValue(captureFunction.inssertWhere);
				dropdown.onChange((value) => {
					captureFunction.inssertWhere = value as CaptureInsertWhere;
					dropdown.setValue(captureFunction.inssertWhere);
					// this.onRebuild();
				});
			});

		const isNeedRegex = [
			CaptureInsertWhere.Replace,
			CaptureInsertWhere.InsertAfter,
			CaptureInsertWhere.InsertBefore,
		];
		if (isNeedRegex.includes(captureFunction.inssertWhere)) {
			new Setting(contentEl)
				.setName("Insert Regex")
				.setClass("no-line")
				.addText((text) => {
					text.setValue(captureFunction.insertRegEx ?? "");
					text.onChange((value) => {
						captureFunction.insertRegEx = value;
					});
				});
		}

		if (captureFunction.inssertWhere === CaptureInsertWhere.InsertAfter) {
			new Setting(contentEl)
				.setName("Insert At End Section")
				.setClass("no-line")
				.addToggle((toggle) => {
					toggle.setValue(captureFunction.insertAtEndSection!);
					toggle.onChange((value) => {
						captureFunction.insertAtEndSection = value;
					});
				});
		}

		new Setting(contentEl)
			.setName("Value")
			.setDesc("{{value}} for fect from modal value")
			.addTextArea((text) => {
				text.setValue(captureFunction.value);
				text.onChange((value) => {
					captureFunction.value = value;
				});
			});
	}
}
