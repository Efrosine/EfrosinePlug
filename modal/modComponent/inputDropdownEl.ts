interface InputDropdwonElParams {
	parent: HTMLElement;
	label: string;
	option: Map<string, string>;
	selected: string;
}

export class InputDropdwonEl {
	private parent: HTMLElement;
	private label: string;
	private option: Map<string, string>;
	private selected: string;

	constructor({ parent, label, option, selected }: InputDropdwonElParams) {
		this.parent = parent;
		this.label = label;
		this.option = option;
		this.selected = selected;
	}

	create(listen?: (value: string) => void): HTMLDivElement {
		const div = this.parent.createDiv({ cls: "efro-setting-field" });

		const labelEl = div.createEl("label", {
			cls: "efro-label",
			text: `${this.label} :`,
		});

		const inputEl = div.createEl("select", {
			cls: "dropdown",
		});

		this.option.forEach((value, key) => {
			const option = inputEl.createEl("option", {
				value: value,
				text: key,
			});
			inputEl.appendChild(option);
		});
		inputEl.value = this.selected;

		if (listen) {
			inputEl.addEventListener("change", () => {
				listen(inputEl.value);
			});
		}

		div.appendChild(labelEl);
		div.appendChild(inputEl);

		return div;
	}
}
