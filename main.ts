import { Notice, Plugin } from "obsidian";
import { SettingsTab } from "core/configTab";
import { FmOptionCommandMod } from "modal/commandMod/fmOptionCommandMod";
import { EfrosineSettings, DEFAULT_SETTINGS } from "core/coreConfig";
import { FrontmatterManager } from "manager/frontmatterManager";
import { PostProcessorManager } from "manager/postProcessorManager";
import { ButtonCommandMod } from "modal/commandMod/buttonCommandMod";
import { CommandManager } from "manager/commandManager";
import { NoteManager } from "manager/noteManager";
import { CaptureInputMod } from "modal/modComponent/captureInputMod";

export default class EfrosinePlugin extends Plugin {
	settings: EfrosineSettings;
	async onload() {
		new Notice("Welcome to Efrosine Plugin");

		//Settings
		this.settings = await this.loadSettings();
		this.addSettingTab(new SettingsTab({ plugin: this }));

		new PostProcessorManager(this).execute();
		this.addRibbonIcon("dice", "test", async () => {});

		this.addCommand({
			id: "efrosine-open-fromatter-setting",
			name: "Open Frontmatter Setting",
			editorCallback: () => {
				new FmOptionCommandMod({ plugin: this }).open();
			},
		});

		this.addCommand({
			name: "Add Button",
			id: "add-button",
			editorCallback: (e, m) => {
				new ButtonCommandMod(this).open();
			},
		});

		this.addCommand({
			name: "Refresh Table of Content",
			id: "refresh-toc",
			callback: () => {
				new NoteManager(this).updateToc();
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

	async loadSettings(): Promise<EfrosineSettings> {
		return Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings(setting: EfrosineSettings) {
		await this.saveData(setting);
	}
}
