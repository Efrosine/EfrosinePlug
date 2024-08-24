import { Notice, Plugin } from "obsidian";
import { SettingsTab } from "core/configTab";
import { FmOptionCommandMod } from "modal/commandMod/fmOptionCommandMod";
import { EfrosineSettings, DEFAULT_SETTINGS } from "core/coreConfig";
import { FrontmatterManager } from "manager/frontmatterManager";
import { PostProcessorManager } from "manager/postProcessorManager";
import { ButtonCommandMod } from "modal/commandMod/buttonCommandMod";
import { CommandManager } from "manager/commandManager";

export default class EfrosinePlugin extends Plugin {
	settings: EfrosineSettings;
	async onload() {
		new Notice("Welcome to Efrosine Plugin");

		//Settings
		this.settings = await this.loadSettings();
		this.addSettingTab(new SettingsTab({ plugin: this }));

		new PostProcessorManager(this).execute();
		this.addRibbonIcon("dice", "test", () => {
			console.log(this.app);
		});

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
