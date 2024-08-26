import { Notice, SuggestModal } from "obsidian";
import EfrosinePlugin from "main";
import { FrontmatterField } from "core/coreConfig";
import { CrudFrontmatter, DateOptions, FmFieldType } from "core/enums";
import {
	FmInputNumberMod,
	FmInputTextMod,
	FmInputDateMod,
	FmInputDateTimeMod,
	FmInputListMod,
	FmInputSelectionMod,
} from "modal/modComponent/fmInputsOption";
import { BaseFmMod } from "core/baseMod/baseFmMod";

interface FmOptionCommandModParams {
	plugin: EfrosinePlugin;
}

/**
 * This class is responsible for managing the frontmatter option command modal.
 */
export class FmOptionCommandMod extends SuggestModal<string> {
	private plugin: EfrosinePlugin;

	constructor({ plugin }: FmOptionCommandModParams) {
		super(plugin.app);
		this.plugin = plugin;
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

/**
 * This class is responsible for managing the frontmatter option command modal.
 */
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

/**
 * This class is responsible for managing the frontmatter option command modal.
 */
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
				new FmInputTextMod(this.plugin, item.name).open();
				break;
			case FmFieldType.Number:
				new FmInputNumberMod(this.plugin, item.name).open();
				break;
			case FmFieldType.List:
			case FmFieldType.Tags:
				new FmInputListMod(this.plugin, item.name).open();
				break;
			case FmFieldType.Select:
				new FmInputSelectionMod(
					this.plugin,
					item.name,
					item.options ?? []
				).open();
				break;
			case FmFieldType.Date:
				new FmInputDateMod(this.plugin, item.name).open();
				break;
			case FmFieldType.DateTime:
				new FmInputDateTimeMod(this.plugin, item.name).open();
				break;
		}
	}
}
