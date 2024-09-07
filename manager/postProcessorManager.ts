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
			"efro-toc-container",
			async (source, el) => {
				const mainDiv = el.createDiv({ cls: "efro-toc-container" });

				const headerDiv = mainDiv.createDiv({
					cls: "efro-toc-header",
				});

				headerDiv.createEl("h3", { text: "Table of Content" });
				headerDiv
					.createEl("button", { text: "Refresh", cls: "mod-cta" })
					.addEventListener("click", async () => {
						new NoteManager(this.plugin).updateToc();
					});

				const rows = source.split("\n").filter((row) => row !== "");
				const fileHeading = this.rowsToFildHeading(rows);
				this.renderTocList(fileHeading, mainDiv);
			}
		);
	}

	/**
	 * This method is used to convert the rows to file heading.
	 *
	 * @param rows - The rows to convert.
	 * @returns FileHeading[]
	 */
	private rowsToFildHeading(rows: string[]): FileHeading[] {
		let result: FileHeading[] = [];
		let stack: FileHeading[] = [];

		for (const row of rows) {
			const temp = new FileHeading({
				level: row.split("-")[0].match(/\t/g)?.length ?? 0,
				value: row.split("-")[1].trim(),
			});
			while (stack.length > 0 && stack.last()!.level >= temp.level) {
				stack.pop();
			}

			if (stack.length > 0) {
				const parent = stack.last()!;
				if (!parent.children) {
					parent.children = [];
				}
				parent.children.push(temp);
			} else {
				result.push(temp);
			}
			stack.push(temp);
		}
		return result;
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
