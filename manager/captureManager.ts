import { CaptureFunction, MacroField } from "core/coreConfig";
import { CaptureInsertWhere } from "core/enums";

import EfrosinePlugin from "main";
import { Notice } from "obsidian";
import { FrontmatterManager } from "./frontmatterManager";
import { NoteManager } from "./noteManager";

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
		const { app } = this.plugin;
		const file = app.workspace.getActiveFile();
		if (!file) {
			throw new Error("file not found");
		}
		const noteManager = new NoteManager(app);
		const content = await app.vault.read(file);
		let newContent = content;
		let target = NoteManager.contentToArray(content);
		const regex = this.func.insertRegEx;
		let insertPos = 0;
		switch (this.func.inssertWhere) {
			case CaptureInsertWhere.Cursor:
				const editor = app.workspace.activeEditor?.editor;
				if (!editor) throw new Error("editor not found");
				insertPos = editor.getCursor().line;
				break;
			case CaptureInsertWhere.Top:
				insertPos =
					new FrontmatterManager({ app: app }).getFmLastLine(file) +
					1;
				break;
			case CaptureInsertWhere.Bottom:
				insertPos = target.length;
				break;
			case CaptureInsertWhere.Replace:
				if (!regex) {
					new Notice("Regex not found");
					return;
				}
				newContent = content.replace(regex, this.func.value);
				noteManager.modifyContent(file, newContent);
				return;
			case CaptureInsertWhere.InsertAfter:
				new Notice("Not Implemented Yet");
				return;
			case CaptureInsertWhere.InsertBefore:
				if (!regex) {
					new Notice("Regex not found");
					return;
				}
				insertPos = NoteManager.getLinePos(target, regex);
				break;
			default:
				new Notice("Insert Where not valid");
				return;
		}
		target.splice(insertPos, 0, this.func.value);
		newContent = NoteManager.arrayToContent(target);
		noteManager.modifyContent(file, newContent);
	}
}
