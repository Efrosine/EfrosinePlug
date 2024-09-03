import EfrosinePlugin from "main";
import { ButtonField } from "entity/buttonField";
import { ButtonPosition, ButtonType } from "core/enums";
import { NoteManager } from "manager/noteManager";
import { CommandManager } from "./commandManager";
import { FileHeading } from "entity/fileHeading";

/**
 * This class is responsible for managing the post processor.
 */
export class PostProcessorManager {
	plugin: EfrosinePlugin;

	constructor(plugin: EfrosinePlugin) {
		this.plugin = plugin;
	}

	/**
	 * This method is used to execute the post processor.
	 */
	execute(): void {
		this.buttonPostProcessor();
		this.tableOfContentPostProcessor();
	}

	/**
	 * This method is used to register the table of content post processor.
	 * It will create a table of content in the note.
	 */
	private tableOfContentPostProcessor() {
		this.plugin.registerMarkdownCodeBlockProcessor(
			"efrosine-toc",
			async (_source, el) => {
				const mainDiv = el.createDiv({ cls: "efrosine-toc" });

				const headerDiv = mainDiv.createDiv({
					cls: "efrosine-toc-header",
				});

				headerDiv.createEl("h3", { text: "Table of Content" });
				headerDiv
					.createEl("button", { text: "Refresh", cls: "mod-cta" })
					.addEventListener("click", async () => {
						new NoteManager(this.plugin).updateToc();
					});

				const noteManager = new NoteManager(this.plugin);
				const file = noteManager.getCurrentFile();
				if (!file) return;
				const headings = noteManager.getHeadings(file);
				if (!headings) return;
				const tocData = NoteManager.buildHeadingsHeararchy(headings);
				this.renderTocList(tocData, mainDiv);
			}
		);
	}

	/**
	 * This method is used to render the table of content list.
	 *
	 * @param items - The items to render.
	 * @param parentEl - The parent element.
	 */
	private renderTocList(items: FileHeading[], parentEl: HTMLElement) {
		const ul = parentEl.createEl("ul", {});
		items.forEach((item) => {
			const li = ul.createEl("li", { text: item.value });
			if (item.children && item.children.length > 0) {
				this.renderTocList(item.children, li);
			}
		});
	}

	/**
	 * This method is used to register the button post processor.
	 * It will create a button in the note.
	 */
	private buttonPostProcessor() {
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

	/**
	 * This method is used to insert a button to the note at
	 * cursor position.
	 *
	 * @param button - The button to insert.
	 */
	private normalButton(el: HTMLElement, button: ButtonField): void {
		const buttonEl = el.createEl("button", {
			text: button.name,
			cls: button.type,
		});
		buttonEl.addEventListener("click", () => {
			new CommandManager(this.plugin).executeCommand(button.command);
		});
	}

	/**
	 * This method is used to insert a navigation button to the note at
	 * cursor position.
	 *
	 * @param button - The button to insert.
	 */
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
			new NoteManager(this.plugin).openFileByPath(filePath)
		);
	}
}
