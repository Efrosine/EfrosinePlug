import EfrosinePlugin from "main";
import { Modal, Notice } from "obsidian";

export class CaptureInputMod extends Modal {
	private name: string;
	private target: string;
	private resolvePromise: (val?: unknown) => void;

	constructor(plugin: EfrosinePlugin, name: string, target: string) {
		super(plugin.app);
		this.name = name;
		this.target = target;
	}

	open(): Promise<string> {
		super.open();
		return new Promise((resolve) => {
			this.resolvePromise = resolve;
		});
	}

	onOpen(): void {
		const { contentEl, titleEl, modalEl } = this;
		titleEl.setText(`Capture ${this.name}`);
		let show = this.target;

		contentEl.addEventListener("keydown", (evt: KeyboardEvent) => {
			if (evt.key === "Enter" && evt.altKey) {
				this.target = show;
				this.close();
			}
		});

		const mainDiv = contentEl.createDiv("efro-setting-field");
		const inputEl = mainDiv.createEl("input", {
			type: "text",
			cls: "efro-full-width",
		});

		inputEl.addEventListener("input", () => {
			show = this.target!.replace("{{value}}", inputEl.value);
			result.setText(`Result : ${show}`);
		});

		const subDiv = contentEl.createDiv("efro-setting-field");
		const result = subDiv.createEl("p", {
			text: `Result : ${show}`,
		});

		const footerEl = modalEl.createDiv({ cls: "efro-footer-actions" });

		footerEl.createEl("p", {
			text: "Alt + Enter to Insert",
		}).createEl;

		const addButton = footerEl.createEl("button", {
			text: "Add",
			cls: "mod-cta",
		});

		addButton.addEventListener("click", () => {
			if (inputEl.value.trim() !== "") {
				this.target = show;
				this.close();
			} else {
				new Notice("Value cannot be empty");
			}
		});
	}

	onClose(): void {
		this.resolvePromise(this.target);
		this.contentEl.empty();
	}
}
