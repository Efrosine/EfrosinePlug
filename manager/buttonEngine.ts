import { ButtonField } from "configs/coreConfig";
import EfrosinePlugin from "main";
import { Notice } from "obsidian";
import { CommandEngine } from "./commandEngine";

export class ButtonPostProcessor {
	plugin: EfrosinePlugin;
	constructor(plugin: EfrosinePlugin) {
		this.plugin = plugin;
	}

	public execute(): void {
		this.endButton();
	}

	endButton(): void {
		this.plugin.registerMarkdownCodeBlockProcessor(
			"end-but",
			(source, el, ctx) => {
				const data: { [key: string]: string } = {};
				const rows = source.split("\n").filter((row) => row.length > 0);
				rows.forEach((row) => {
					const [key, val] = row
						.split("=")
						.map((part) => part.trim());
					data[key] = val;
				});
				const div = el.createDiv({ cls: "end-div" });
				const button = div.createEl("button", { cls: "mod-cta" });
				button.setText("Click 22me33");

				button.addEventListener("click", () => {
					new Notice("Button ");
					const btField = new ButtonEngine(
						this.plugin
					).stringToButton(data);
					console.log("btFielddata", data);

					if (btField) {
						new CommandEngine(this.plugin).executeCommand(
							btField.command.id
						);
					}
				});
			}
		);
	}
	nextButton(): void {
		this.plugin.registerMarkdownCodeBlockProcessor(
			"next-but",
			(s, e, c) => {
				const rows = s.split("\n").filter((row) => row.length > 0);
				const div = e.createDiv();
			}
		);
	}
}
export class ButtonEngine {
	plugin: EfrosinePlugin;
	constructor(plugin: EfrosinePlugin) {
		this.plugin = plugin;
	}
	public insertButton(button: ButtonField): void {
		const editor = this.plugin.app.workspace.activeEditor?.editor;
		if (!editor) return;
		const cursorLine = editor.getCursor().line;
		editor.replaceRange(this.buttonToString(button), {
			line: cursorLine + 1,
			ch: 0,
		});
	}

	private buttonToString(button: ButtonField): string {
		const { name, position, command } = button;
		const backtic = "```";
		const displayString = `${backtic}end-but\nname= ${name}\nposition= ${position}\ncommandId= ${command.id}\n${backtic}\n`;
		return displayString;
	}

	public stringToButton(s: {
		[key: string]: string;
	}): ButtonField | undefined {
		const name = s["name"]!;
		const position = s["position"]!;
		const commandId = s["commandId"]!;
		const command = new CommandEngine(this.plugin).findCommand(commandId)!;
		console.log("commandId", commandId);
		console.log("data", `${name} ${position} ${command}`);
		if (!name || !position || !command) return undefined;
		return { name, position, command };
	}
}
