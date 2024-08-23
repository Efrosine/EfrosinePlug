import EfrosinePlugin from "main";
import { ButtonField } from "entity/buttonField";
import { ButtonPosition, ButtonType } from "core/enums";
import { NoteManager } from "manager/noteManager";
import { CommandManager } from "./commandManager";

export class PostProcessorManager {
	plugin: EfrosinePlugin;

	constructor(plugin: EfrosinePlugin) {
		this.plugin = plugin;
	}

	execute(): void {
		this.plugin.registerMarkdownCodeBlockProcessor(
			"efrosine-but",
			(source, el) => {
				const buttonEnt = ButtonField.fromString(this.plugin, source);
				if (!buttonEnt) {
					console.error("Button not found");
					return;
				}
				const { type, position } = buttonEnt;
				const mainDiv = el.createDiv({ cls: position });
				if (type === ButtonType.Nav) {
					this.navButton(mainDiv, buttonEnt);
				} else {
					this.normalButton(mainDiv, buttonEnt);
				}
			}
		);
	}

	private normalButton(el: HTMLElement, button: ButtonField): void {
		const buttonEl = el.createEl("button", {
			text: button.name,
			cls: button.type,
		});
		buttonEl.addEventListener("click", () => {
			new CommandManager(this.plugin).executeCommand(button.command);
		});
	}

	private navButton(el: HTMLElement, button: ButtonField): void {
		const filePath = button.filePath;
		if (!filePath) {
			el.createEl("p", { text: "Filepath must be filled" });
			return;
		}
		const subDiv = el.createDiv({ cls: button.type });
		const header =
			button.position === ButtonPosition.Left
				? "<<< See Prev Note"
				: "What's Next >>>";
		const displayString = filePath.split("/").pop();
		subDiv.createEl("p", { text: header });
		subDiv.createEl("p", { text: displayString });
		subDiv.addEventListener("click", () =>
			new NoteManager(this.plugin.app).openFileByPath(filePath)
		);
	}
}
