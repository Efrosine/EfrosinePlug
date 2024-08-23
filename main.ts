import { getLinkpath, Notice, parseLinktext, Plugin } from "obsidian";

import { SettingsTab } from "./core/configTab";
import { FmOptionMod } from "./modal/fmOptionsMod";
import { EfrosineSettings, DEFAULT_SETTINGS } from "./core/coreConfig";

import { FrontmatterManager } from "./manager/frontmatterManager";
import { CommandManager } from "manager/commandManager";
import { ButtonManager } from "manager/buttonManager";
import { PostProcessorManager } from "manager/postProcessorManager";
import { InsertButtonMod } from "modal/insertButtonMod";

export default class EfrosinePlugin extends Plugin {
	settings: EfrosineSettings;
	async onload() {
		new Notice("Welcome to Efrosine Plugin");

		//Settings
		this.settings = await this.loadSettings();
		this.addSettingTab(new SettingsTab({ plugin: this }));

		new PostProcessorManager(this).execute();
		this.addRibbonIcon("dice", "test", () => {
			const temp = this.app.metadataCache.getFileCache(
				this.app.workspace.getActiveFile()!
			);
			console.log(temp);
			const link = this.app.vault.getFileByPath("123/qwert.md");
			console.log("file path", link);
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

		new CommandManager(this).loadCommands();

		this.registerEvent(
			this.app.workspace.on("editor-change", () =>
				new FrontmatterManager({ app: this.app }).updateMtime(
					this.settings
				)
			)
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
}
