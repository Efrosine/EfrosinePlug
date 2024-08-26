import { Modal, TFile, Notice } from "obsidian";
import EfrosinePlugin from "main";
import { FrontmatterManager } from "manager/frontmatterManager";
import { UpdataFmMod } from "modal/commandMod/fmOptionCommandMod";

/**
 * Represents a base class for a frontmatter input modal.
 */
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
		let { file, fmEngine, contentEl, titleEl } = this;

		contentEl.addEventListener("keydown", (evt: KeyboardEvent) => {
			if (evt.key === "Escape") {
				new UpdataFmMod(this.plugin).open();
			}
		});

		if (!file) {
			new Notice("No file is open");
			return;
		}
		const curFm = fmEngine.getCurrentField(file);
		let value: string = curFm?.[this.title] ?? "";

		contentEl.addEventListener("keydown", (evt: KeyboardEvent) => {
			if (evt.key === "Enter" && evt.altKey) {
				this.updateFm(file!, value);
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
			if (!file) {
				new Notice("No file is open");
				return;
			}
			this.updateFm(file, value);
			this.close();
		});
	}

	onClose(): void {
		let { contentEl } = this;
		contentEl.empty();
	}

	/**
	 * Renders the footer note element in the specified contentEl.
	 *
	 * @param contentEl - The content element to render the footer note in.
	 * @returns void
	 */
	protected footerNote(contentEl: HTMLElement): void {}

	/**
	 * Updates the frontmatter of the specified file with the given value.
	 *
	 * @param file - The file to update the frontmatter of.
	 * @param value - The value to update the frontmatter with.
	 * @returns void
	 */
	protected updateFm(file: TFile, value: string): void {
		this.fmEngine.updateFrontMatter(file, { [this.title]: value });
	}
}
