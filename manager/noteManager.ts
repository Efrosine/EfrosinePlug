import { App, Notice, TFile } from "obsidian";

/**
 * This class is used to manage the note.
 */
export class NoteManager {
	app: App;

	constructor(app: App) {
		this.app = app;
	}

	/**
	 * This method is used to convert the content to array.
	 *
	 * @param content - The file content.
	 * @returns string[]
	 */
	static contentToArray(content: string): string[] {
		return content.split("\n");
	}

	/**
	 * This method is used to convert the array to content.
	 *
	 * @param arr - The array.
	 * @returns string
	 */
	static arrayToContent(arr: string[]): string {
		return arr.join("\n");
	}

	/**
	 * This method is used to get the line position.
	 *
	 * @param arr - The array.
	 * @param regex - The regex to search.
	 * @returns number of element in the array.
	 */
	static getLinePos(arr: string[], regex: string): number {
		return arr.findIndex((line) => line.includes(regex));
	}

	/**
	 * This method is used to get the line position.
	 *
	 * @param file - file to modify its content.
	 * @param newContent - The new content that want to be modify.
	 * @returns void
	 */
	modifyContent(file: TFile, newContent: string): void {
		this.app.vault.modify(file, newContent);
	}

	/**
	 * This method is used to get the file content.
	 *
	 * @param filePath - The file path.
	 * @returns string
	 */
	openFileByPath(filePath: string): void {
		const file = this.app.vault.getFileByPath(filePath);
		if (!file) {
			new Notice("File not found");
			return;
		}
		this.app.workspace.getLeaf().openFile(file);
	}
}
