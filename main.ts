import { Notice, Plugin, moment } from "obsidian";

import { SettingsTab } from "./configs/configTab";
import { FmOptionMod } from "./modal/fmOptionsMod";
import {
	EfrosineSettings,
	DEFAULT_SETTINGS,
	FrontmatterField,
	MacroField,
} from "./configs/coreConfig";

import { FrontmatterManager } from "./manager/frontmatterManager";
import { DateFormat, DateOptions } from "configs/enums";
import { CommandEngine } from "manager/commandEngine";
import { ButtonEngine, ButtonPostProcessor } from "manager/buttonEngine";
import { InsertButtonMod } from "modal/insertButtonMod";

export default class EfrosinePlugin extends Plugin {
	settings: EfrosineSettings;
	async onload() {
		new Notice("Welcome to Efrosine Plugin");

		//Settings
		this.settings = await this.loadSettings();
		this.addSettingTab(new SettingsTab({ plugin: this }));

		new ButtonPostProcessor(this).execute();
		this.addRibbonIcon("dice", "test", () => {
			new ButtonEngine(this).insertButton({
				name: "Test",
				position: "toolbar",
				command: {
					name: "Test",
					id: "tes",
					callback: () => console.log("Test"),
				},
			});
		});

		this.addCommand({
			id: "efrosine-open-fromatter-setting",
			name: "Open Frontmatter Setting",
			editorCallback: () => {
				new FmOptionMod({ plugin: this }).open();
			},
		});

		this.addCommand({
			name: "Add Button",
			id: "add-button",
			editorCallback: (e, m) => {
				new InsertButtonMod(this).open();
			},
		});

		new CommandEngine(this).loadCommands();

		this.registerEvent(
			this.app.workspace.on("editor-change", () => this.updateMtime())
		);
	}

	onunload() {
		new Notice("Unloading plugin");
	}

	public async loadSettings(): Promise<EfrosineSettings> {
		return Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	public async saveSettings(setting: EfrosineSettings) {
		await this.saveData(setting);
	}

	public async saveFmSetting(fmSettings: FrontmatterField[]) {
		this.settings.fmFields = fmSettings;
		await this.saveData(this.settings);
	}

	public async saveMacroSetting(macroSettings: MacroField[]) {
		this.settings.macros = macroSettings;
		await this.saveData(this.settings);
	}

	private async updateMtime() {
		await new Promise((resolve) => setTimeout(resolve, 1000));
		const file = this.app.workspace.getActiveFile();
		if (file) {
			const mtime = file.stat.mtime;
			const fmEngine = new FrontmatterManager({ app: this.app });

			const fm = fmEngine.getCurFm(file);
			const fmFieldSetting = this.settings.fmFields;

			const filteredFm = fmFieldSetting.filter((field) => {
				return field.dateOptions === DateOptions.MTime;
			});

			if (!fm) {
				return;
			}

			Object.entries(fm).forEach(([k, v]) => {
				filteredFm.forEach((field) => {
					if (k === field.name) {
						const formated = moment(mtime).format(
							field.type === "date"
								? DateFormat.Date
								: DateFormat.DateTime
						);
						fmEngine.updateFm(file, {
							[k]: formated,
						});
					}
				});
			});
		}
	}
}
