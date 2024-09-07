import { Notice } from "obsidian";
import EfrosinePlugin from "main";
import { CaptureFunction, MacroField } from "core/coreConfig";
import { CaptureInsertWhere } from "core/enums";
import { FrontmatterManager } from "manager/frontmatterManager";
import { NoteManager } from "manager/noteManager";
import { CaptureInputMod } from "modal/modComponent/captureInputMod";

interface CaptureManagerParams {
	plugin: EfrosinePlugin;
	macroField: MacroField;
}

/**
 * This class is responsible for managing the capture function.
 */
export class CaptureManager {
	marcroField: MacroField;
	plugin: EfrosinePlugin;
	func: CaptureFunction;

	constructor({ plugin, macroField }: CaptureManagerParams) {
		this.plugin = plugin;
		this.marcroField = macroField;
		this.func = this.marcroField.funcions as CaptureFunction;
	}

	async call() {
		const { app } = this.plugin;
		const { insertRegEx, inssertWhere, value } = this.func;
		const noteManager = new NoteManager(this.plugin);
		const file = app.workspace.getActiveFile();

		if (!file) throw new Error("file not found");
		const content = await app.vault.read(file);
		let insertVal: string | null = value;

		if (value.includes("{{value}}")) {
			const captureInput = new CaptureInputMod(
				this.plugin,
				this.marcroField.name,
				value
			);
			insertVal = await captureInput.open();
		}

		let insertPos = 0;
		let newContent = content;
		let target = NoteManager.contentToArray(content);

		switch (inssertWhere) {
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
				if (!insertRegEx) {
					new Notice("Regex not found");
					return;
				}
				newContent = content.replace(insertRegEx, value);
				noteManager.modifyContent(file, newContent);
				return;
			case CaptureInsertWhere.InsertAfter:
				new Notice("Not Implemented Yet");
				return;
			case CaptureInsertWhere.InsertBefore:
				if (!insertRegEx) {
					new Notice("Regex not found");
					return;
				}
				insertPos = NoteManager.getLinePos(target, insertRegEx);
				break;
			default:
				new Notice("Insert Where not valid");
				return;
		}

		target.splice(insertPos, 0, insertVal);
		newContent = NoteManager.arrayToContent(target);
		noteManager.modifyContent(file, newContent);
	}
}
