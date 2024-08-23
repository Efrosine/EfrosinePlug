import { App, Notice, TFile } from "obsidian";

export class NoteManager {
	app: App;

	constructor(app: App) {
		this.app = app;
	}

	static contentToArray(content: string): string[] {
		return content.split("\n");
	}

	static arrayToContent(arr: string[]): string {
		return arr.join("\n");
	}

	static getLinePos(arr: string[], regex: string): number {
		return arr.findIndex((line) => line.includes(regex));
	}

	 modifyContent(file: TFile, newContent: string): void {
		this.app.vault.modify(file, newContent);
	}

	 openFileByPath(filePath: string): void {
		const file = this.app.vault.getFileByPath(filePath);
		if (!file) {
			new Notice("File not found");
			return;
		}
		this.app.workspace.getLeaf().openFile(file);
	}
}
