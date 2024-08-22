import EfrosinePlugin from "main";
import { CommandManager } from "./commandManager";
import { ButtonField } from "entity/buttonField";
import { ButtonPosition, ButtonType } from "core/enums";

export class PostProcessorManager {
	plugin: EfrosinePlugin;
	constructor(plugin: EfrosinePlugin) {
		this.plugin = plugin;
	}

	public execute(): void {
		this.endButton();
	}

	endButton(): void {
		this.plugin.registerMarkdownCodeBlockProcessor(
			"efrosine-but",
			(source, el, ctx) => {
				const buttonEnt = ButtonField.fromString(this.plugin, source);
				if (!buttonEnt) {
					console.error("Button not found");
					return;
				}
				const { name, type, position, command } = buttonEnt;
				const mainDiv = el.createDiv({ cls: position });
				if (type !== ButtonType.Nav) {
					const buttonEl = mainDiv.createEl("button", {
						text: name,
						cls: type,
					});
					buttonEl.addEventListener("click", () => {
						new CommandManager(this.plugin).executeCommand(command);
					});
				} else {
					const subDiv = mainDiv.createDiv({ cls: type });
					const header =
						position === ButtonPosition.Left
							? "<<< See Prev Note"
							: "What's Next >>>";
					subDiv.createEl("p", { text: header });
					subDiv.createEl("p", { text: name });
					subDiv.addEventListener("click", () =>
						console.log("clicked" + type)
					);
				}
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
