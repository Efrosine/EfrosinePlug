import { FrontMatterCache, Notice, SuggestModal, TFile } from "obsidian";
import EfrosinePlugin from "../main";
import { EfrosineSettings, FrontmatterField } from "../core/coreConfig";
import { FrontmatterManager } from "../manager/frontmatterManager";
import { CrudFrontmatter, DateOptions, FmFieldType } from "../core/enums";
import {
	InsertNNumberFmMod,
	InsertTTextFmMod,
	InsertDateCustomFmMod,
	InsertDateTimeCustomFmMod,
	InsertListFmMod,
	InsertSelectFmMod,
} from "./modComponent/fmInputsOption";

interface FmOptionModParams {
	plugin: EfrosinePlugin;
}

export class FmOptionMod extends SuggestModal<string> {
	private plugin: EfrosinePlugin;
	private settings: EfrosineSettings;
	constructor({ plugin }: FmOptionModParams) {
		super(plugin.app);
		this.plugin = plugin;
		this.settings = plugin.settings;
	}
	getSuggestions(query: string): string[] | Promise<string[]> {
		return Object.values(CrudFrontmatter).filter((item) =>
			item.toLowerCase().includes(query.toLowerCase())
		);
	}
	renderSuggestion(value: string, el: HTMLElement) {
		el.setText(value);
	}
	onChooseSuggestion(item: string) {
		if (item === CrudFrontmatter.ADD) {
			new AddFmMod(this.plugin).open();
		} else if (item === CrudFrontmatter.UPDATE) {
			new UpdataFmMod(this.plugin).open();
		} else {
			new Notice("Invalid Option");
		}
	}
}

class BaseFmMod extends SuggestModal<FrontmatterField> {
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
				new FmOptionMod({ plugin: this.plugin }).open();
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

class AddFmMod extends BaseFmMod {
	getSuggestions(
		query: string
	): FrontmatterField[] | Promise<FrontmatterField[]> {
		let options = this.fmFields.filter(
			(item) => !this.curFm || !this.curFm.hasOwnProperty(item.name)
		);
		return options.filter((item) =>
			item.name.toLowerCase().includes(query.toLowerCase())
		);
	}

	onChooseSuggestion(item: FrontmatterField) {
		if (!this.file) {
			new Notice("No file is open");
			return;
		}
		this.fmEngine.insertFrontmatter(this.file, item);
	}
}

export class UpdataFmMod extends BaseFmMod {
	getSuggestions(
		query: string
	): FrontmatterField[] | Promise<FrontmatterField[]> {
		let options = this.fmFields
			.filter(
				(item) => this.curFm && this.curFm.hasOwnProperty(item.name)
			)
			.filter((item) => {
				if (item.dateOptions) {
					return item.dateOptions.includes(DateOptions.Custom);
				}
				return true;
			});
		return options.filter((item) =>
			item.name.toLowerCase().includes(query.toLowerCase())
		);
	}

	onChooseSuggestion(item: FrontmatterField) {
		switch (item.type) {
			case FmFieldType.Text:
				new InsertTTextFmMod(this.plugin, item.name).open();
				break;
			case FmFieldType.Number:
				new InsertNNumberFmMod(this.plugin, item.name).open();
				break;
			case FmFieldType.List:
			case FmFieldType.Tags:
				new InsertListFmMod(this.plugin, item.name).open();
				break;
			case FmFieldType.Select:
				new InsertSelectFmMod(
					this.plugin,
					item.name,
					item.options ?? []
				).open();
				break;
			case FmFieldType.Date:
				new InsertDateCustomFmMod(this.plugin, item.name).open();
				break;
			case FmFieldType.DateTime:
				new InsertDateTimeCustomFmMod(this.plugin, item.name).open();
				break;
		}
	}
}
