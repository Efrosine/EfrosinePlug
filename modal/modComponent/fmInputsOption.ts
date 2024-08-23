import { Notice, TFile, SuggestModal } from "obsidian";
import EfrosinePlugin from "main";
import { FrontmatterManager } from "manager/frontmatterManager";
import { BaseFmInputMod } from "core/baseMod/baseFmInputMod";

export class FmInputTextMod extends BaseFmInputMod {
	constructor(plugin: EfrosinePlugin, title: string) {
		super(plugin, title, "text");
	}
}

export class FmInputNumberMod extends BaseFmInputMod {
	constructor(plugin: EfrosinePlugin, title: string) {
		super(plugin, title, "number");
	}

	updateFm(file: TFile, value: string): void {
		const numberValue = Number(value);
		if (!isNaN(numberValue)) {
			this.fmEngine.updateFrontMatter(file, {
				[this.title]: numberValue,
			});
		} else {
			new Notice("Please enter a valid number");
		}
	}
}

export class FmInputDateMod extends BaseFmInputMod {
	constructor(plugin: EfrosinePlugin, title: string) {
		super(plugin, title, "date");
	}
}

export class FmInputDateTimeMod extends BaseFmInputMod {
	constructor(plugin: EfrosinePlugin, title: string) {
		super(plugin, title, "datetime-local");
	}
}

export class FmInputListMod extends BaseFmInputMod {
	constructor(plugin: EfrosinePlugin, title: string) {
		super(plugin, title, "text");
	}

	updateFm(file: TFile, value: string): void {
		const listValue = value.contains(",")
			? value.split(",").map((item) => item.trim())
			: [value];
		this.fmEngine.updateFrontMatter(file, { [this.title]: listValue });
	}

	footerNote(contentEl: HTMLElement): void {
		contentEl.createEl("p", {
			text: "Separate items with comma",
		});
	}
}

export class FmInputSelectionMod extends SuggestModal<string> {
	private options: string[];
	private title: string;

	constructor(plugin: EfrosinePlugin, title: string, options: string[]) {
		super(plugin.app);
		this.title = title;
		this.options = options;
	}
	getSuggestions(query: string): string[] | Promise<string[]> {
		return this.options.filter((item) =>
			item.toLowerCase().includes(query.toLowerCase())
		);
	}
	renderSuggestion(value: string, el: HTMLElement) {
		el.setText(value);
	}
	onChooseSuggestion(item: string, evt: MouseEvent | KeyboardEvent) {
		let fmEngine = new FrontmatterManager({ app: this.app });
		const file = this.app.workspace.getActiveFile();
		if (!file) {
			new Notice("No file is open");
			return;
		}
		fmEngine.updateFrontMatter(file, { [this.title]: item });
		new Notice("Frontmatter Updated");
		this.close();
	}
}
