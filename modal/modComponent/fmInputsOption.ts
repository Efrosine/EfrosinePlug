import { App, Modal, Notice, TFile, SuggestModal } from "obsidian";
import { FrontmatterEngine } from "engine/frontmatterEngine";
import { UpdataFmMod } from "modal/fmOptionsMod";
import EfrosinePlugin from "main";

class BaseInputFmMod extends Modal {
	protected title: string;
	private inputType: string;
	protected fmEngine: FrontmatterEngine;
	private file: TFile | null;
	private plugin: EfrosinePlugin;

	constructor(plugin: EfrosinePlugin, title: string, inputType: string) {
		super(plugin.app);
		this.plugin = plugin;
		this.title = title;
		this.inputType = inputType;
		this.fmEngine = new FrontmatterEngine({ app: this.app });
		this.file = this.app.workspace.getActiveFile();
	}

	onOpen(): void {
		let { contentEl, titleEl } = this;

		contentEl.addEventListener("keydown", (evt: KeyboardEvent) => {
			if (evt.key === "Escape") {
				new UpdataFmMod(this.plugin).open();
			}
		});

		if (!this.file) {
			new Notice("No file is open");
			return;
		}
		const curFm = this.fmEngine.getCurFm(this.file);
		let value: string = curFm?.[this.title] ?? "";

		contentEl.addEventListener("keydown", (evt: KeyboardEvent) => {
			if (evt.key === "Enter" && evt.altKey) {
				this.updateFm(this.file!, value);
				this.close();
			}
		});

		titleEl.setText(`Insert Value of ${this.title}`);

		const inputDiv = contentEl.createDiv({ cls: "efro-setting-field" });

		const inputEl = inputDiv.createEl("input", {
			cls: "full-width",
			type: this.inputType,
			value: value,
		});
		inputEl.addEventListener("input", () => {
			value = inputEl.value;
		});

		this.createNote(contentEl);

		const footerEl = contentEl.createDiv({ cls: "efro-footer-actions" });
		const tooltipText = footerEl.createEl("p", {
			text: "Alt + Enter to Insert",
		});

		const addButton = footerEl.createEl("button", {
			text: "Insert",
			cls: "mod-cta",
		});
		addButton.addEventListener("click", () => {
			if (!this.file) {
				new Notice("No file is open");
				return;
			}
			this.updateFm(this.file, value);
			this.close();
		});
	}

	createNote(contentEl: HTMLElement): void {}

	updateFm(file: TFile, value: string): void {
		this.fmEngine.updateFm(file, { [this.title]: value });
	}

	onClose(): void {
		let { contentEl } = this;
		contentEl.empty();
	}
}

export class InsertTTextFmMod extends BaseInputFmMod {
	constructor(plugin: EfrosinePlugin, title: string) {
		super(plugin, title, "text");
	}
}

export class InsertNNumberFmMod extends BaseInputFmMod {
	constructor(plugin: EfrosinePlugin, title: string) {
		super(plugin, title, "number");
	}

	updateFm(file: TFile, value: string): void {
		const numberValue = Number(value);
		if (!isNaN(numberValue)) {
			this.fmEngine.updateFm(file, { [this.title]: numberValue });
		} else {
			new Notice("Please enter a valid number");
		}
	}
}

export class InsertDateCustomFmMod extends BaseInputFmMod {
	constructor(plugin: EfrosinePlugin, title: string) {
		super(plugin, title, "date");
	}
}

export class InsertDateTimeCustomFmMod extends BaseInputFmMod {
	constructor(plugin: EfrosinePlugin, title: string) {
		super(plugin, title, "datetime-local");
	}
}

export class InsertListFmMod extends BaseInputFmMod {
	constructor(plugin: EfrosinePlugin, title: string) {
		super(plugin, title, "text");
	}

	updateFm(file: TFile, value: string): void {
		const listValue = value.contains(",")
			? value.split(",").map((item) => item.trim())
			: [value];
		this.fmEngine.updateFm(file, { [this.title]: listValue });
	}

	createNote(contentEl: HTMLElement): void {
		contentEl.createEl("p", {
			text: "Separate items with comma",
		});
	}
}

export class InsertSelectFmMod extends SuggestModal<string> {
	private options: string[];
	private title: string;
	private plugin: EfrosinePlugin;
	constructor(plugin: EfrosinePlugin, title: string, options: string[]) {
		super(plugin.app);
		this.plugin = plugin;
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
		let fmEngine = new FrontmatterEngine({ app: this.app });
		const file = this.app.workspace.getActiveFile();
		if (!file) {
			new Notice("No file is open");
			return;
		}
		fmEngine.updateFm(file, { [this.title]: item });
		new Notice("Frontmatter Updated");
		this.close();
	}
}
