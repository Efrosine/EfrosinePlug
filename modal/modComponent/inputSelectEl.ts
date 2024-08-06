
interface InputSelectElParams {
	parent: HTMLElement;
	label: string;
	option: Array<string>;
}

export class InputSelectEl {
	parent: HTMLElement;
	label: string;
	option: Array<string>;

	constructor({ parent, label, option }: InputSelectElParams) {
		this.parent = parent;
		this.label = label;
		this.option = option;
	}

	create(listen: (value: Array<string>) => void): HTMLDivElement {
		const div = this.parent.createDiv();

		const mainDiv = div.createDiv({ cls: "efro-setting-field" });

		const labelEl = mainDiv.createEl("label", {
			cls: "efro-label",
			text: `${this.label} :`,
		});

		const inputEl = mainDiv.createEl("input", {
			cls: "full-width efro-select-input",
			type: "text",
		});

		const buttonEl = mainDiv.createEl("button", {
			cls: "mod-cta",
			text: "Add Option",
		});
		buttonEl.addEventListener("click", () => {
			this.option.push(inputEl.value);
			listen(this.option);
		});

		mainDiv.appendChild(labelEl);
		mainDiv.appendChild(inputEl);
		mainDiv.appendChild(buttonEl);

		const optionDiv = div.createDiv();

		this.option.forEach((value) => {
			const innerOptionDiv = div.createDiv({ cls: "efro-setting-field" });

			const optionValue = innerOptionDiv.createEl("input", {
				cls: "full-width efro-select-input",
				type: "text",
				value: value,
			});

			const optionDelete = innerOptionDiv.createEl("button", {
				cls: "mod-warning",
				text: "Delete",
			});
			optionDelete.addEventListener("click", () => {
				this.option.remove(value);
				listen(this.option);
			});

			innerOptionDiv.appendChild(optionValue);
			innerOptionDiv.appendChild(optionDelete);
			optionDiv.appendChild(innerOptionDiv);
		});

		div.appendChild(mainDiv);
		div.appendChild(optionDiv);
		return div;
	}
}
