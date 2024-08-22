import { CaptureFunction, MacroField } from "core/coreConfig";
import { CaptureInsertWhere } from "core/enums";

import EfrosinePlugin from "main";
import { Notice } from "obsidian";

interface CaptureManagerParams {
	plugin: EfrosinePlugin;
	macroField: MacroField;
}
export class CaptureManager {
	marcroField: MacroField;
	plugin: EfrosinePlugin;
	func: CaptureFunction;

	constructor({ plugin, macroField }: CaptureManagerParams) {
		this.plugin = plugin;
		this.marcroField = macroField;
		this.func = this.marcroField.funcions as CaptureFunction;
	}

	public async call() {
		const editor = this.plugin.app.workspace.activeEditor?.editor;
		const file = this.plugin.app.workspace.getActiveFile();

		if (!editor) {
			new Notice("Editor not found");
			return;
		}
		if (!file) {
			new Notice("File not found");
			return;
		}
		let insertPos = { line: 0, ch: 0 };
		let newValue = this.func.value;
		let endInsertPos;
		let content;

		switch (this.func.inssertWhere) {
			case CaptureInsertWhere.Cursor:
				insertPos = editor.getCursor();
				break;
			case CaptureInsertWhere.Top:
				const temp =
					this.plugin.app.metadataCache.getFileCache(file)
						?.frontmatterPosition?.end.line;
				insertPos = temp
					? { line: temp + 1, ch: 0 }
					: { line: 0, ch: 0 };
				newValue = `${newValue}\n`;
				break;
			case CaptureInsertWhere.Bottom:
				insertPos = { line: editor.lastLine() + 1, ch: 0 };
				break;
			case CaptureInsertWhere.Replace:
				content = editor.getValue();
				newValue = content.replace(
					this.func.insertRegEx ?? "",
					this.func.value
				);
				endInsertPos = { line: editor.lastLine(), ch: 0 };
				break;
			case CaptureInsertWhere.InsertAfter:
				new Notice("Not Implemented Yet");
				return;
			case CaptureInsertWhere.InsertBefore:
				content = editor.getValue();
				const contentLines = content.split("\n");
				const regex = new RegExp(this.func.insertRegEx ?? "");
				const targetline = contentLines.findIndex((line) =>
					regex.test(line)
				);
				insertPos = { line: targetline, ch: 0 };
				newValue = `${newValue}\n`;
				break;
			default:
				new Notice("Insert Where not found");
				return;
		}

		editor.replaceRange(newValue, insertPos, endInsertPos);
	}
}
