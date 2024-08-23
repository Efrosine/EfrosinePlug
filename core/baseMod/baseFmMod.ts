import { SuggestModal, FrontMatterCache, TFile } from "obsidian";
import EfrosinePlugin from "main";
import { FrontmatterField } from "core/coreConfig";
import { FrontmatterManager } from "manager/frontmatterManager";
import { FmOptionCommandMod } from "modal/commandMod/fmOptionCommandMod";

export class BaseFmMod extends SuggestModal<FrontmatterField> {
	protected plugin: EfrosinePlugin;
	protected fmFields: FrontmatterField[];
	protected curFm: FrontMatterCache | null | undefined;
	protected fmEngine: FrontmatterManager;
	protected file: TFile | null;

	constructor(plugin: EfrosinePlugin) {
		super(plugin.app);
		this.plugin = plugin;
		this.inputEl.addEventListener("keydown", (evt: KeyboardEvent) => {
			if (evt.key === "Escape") {
				new FmOptionCommandMod({ plugin: this.plugin }).open();
			}
		});
		this.fmFields = this.plugin.settings.fmFields;
		this.file = this.app.workspace.getActiveFile();
		this.curFm = this.file
			? this.app.metadataCache.getFileCache(this.file)?.frontmatter
			: null;
		this.fmEngine = new FrontmatterManager({ app: this.plugin.app });
	}
	
	getSuggestions(
		query: string
	): FrontmatterField[] | Promise<FrontmatterField[]> {
		throw new Error("Method not implemented.");
	}

	renderSuggestion(value: FrontmatterField, el: HTMLElement) {
		return el.setText(`${value.name} (${value.type})`);
	}

	onChooseSuggestion(item: FrontmatterField) {
		throw new Error("Method not implemented.");
	}
}
