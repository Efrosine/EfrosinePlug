interface InputTextElParams {
	parent: HTMLElement;
	label: string;
	value?: string;
	disable?: boolean;
}

export class InputTextEl {
	private parent: HTMLElement;
	private label: string;
	private value?: string;
	private disable?: boolean;

	constructor({ parent, label, value, disable }: InputTextElParams) {
		this.parent = parent;
		this.label = label;
		this.value = value;
		this.disable = disable;
	}

	create(listen?: (value: string) => void): HTMLDivElement {
		const div = this.parent.createDiv({ cls: "efro-setting-field" });

		const labelEl = div.createEl("label", {
			cls: "efro-label",
			text: `${this.label} :`,
		});

		const inputEl = div.createEl("input", {
			cls: "full-width",
			type: "text",
			value: this.value ?? "",
			attr: { disabled: this.disable ? true : null ?? null },
		});

		if (listen) {
			inputEl.addEventListener("input", () => {
				listen(inputEl.value);
			});
		}

		div.appendChild(labelEl);
		div.appendChild(inputEl);

		return div;
	}
}
