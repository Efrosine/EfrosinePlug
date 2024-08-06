import { App, Modal, Notice, TFile, SuggestModal } from "obsidian";
import { FrontmatterEngine } from "engine/frontmatterEngine";

class BaseInputFmMod extends Modal {
	protected title: string;
	private inputType: string;
	protected fmEngine: FrontmatterEngine;
	private file: TFile | null;

	constructor(app: App, title: string, inputType: string) {
		super(app);
		this.title = title;
		this.inputType = inputType;
		this.fmEngine = new FrontmatterEngine({ app: this.app });
		this.file = this.app.workspace.getActiveFile();
	}

	onOpen(): void {
		let { contentEl, titleEl } = this;

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
	constructor(app: App, title: string) {
		super(app, title, "text");
	}
}

export class InsertNNumberFmMod extends BaseInputFmMod {
	constructor(app: App, title: string) {
		super(app, title, "number");
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
	constructor(app: App, title: string) {
		super(app, title, "date");
	}
}

export class InsertDateTimeCustomFmMod extends BaseInputFmMod {
	constructor(app: App, title: string) {
		super(app, title, "datetime-local");
	}
}

export class InsertListFmMod extends BaseInputFmMod {
	constructor(app: App, title: string) {
		super(app, title, "text");
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
	options: string[];
	title: string;
	constructor(app: App, title: string, options: string[]) {
		super(app);
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
