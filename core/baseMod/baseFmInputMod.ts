import { Modal, TFile, Notice } from "obsidian";
import EfrosinePlugin from "main";
import { FrontmatterManager } from "manager/frontmatterManager";
import { UpdataFmMod } from "modal/commandMod/fmOptionCommandMod";

export class BaseFmInputMod extends Modal {
	protected title: string;
	private inputType: string;
	protected fmEngine: FrontmatterManager;
	private file: TFile | null;
	private plugin: EfrosinePlugin;

	constructor(plugin: EfrosinePlugin, title: string, inputType: string) {
		super(plugin.app);
		this.plugin = plugin;
		this.title = title;
		this.inputType = inputType;
		this.fmEngine = new FrontmatterManager({ app: this.app });
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
		const curFm = this.fmEngine.getCurrentField(this.file);
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

		this.footerNote(contentEl);

		const footerEl = contentEl.createDiv({ cls: "efro-footer-actions" });
		footerEl.createEl("p", {
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

	onClose(): void {
		let { contentEl } = this;
		contentEl.empty();
	}

	protected footerNote(contentEl: HTMLElement): void {}

	protected updateFm(file: TFile, value: string): void {
		this.fmEngine.updateFrontMatter(file, { [this.title]: value });
	}
}
