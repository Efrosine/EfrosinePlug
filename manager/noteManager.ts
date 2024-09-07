import { FileHeading } from "entity/fileHeading";
import EfrosinePlugin from "main";
import { App, HeadingCache, Notice, TFile } from "obsidian";

/**
 * This class is used to manage the note.
 */
export class NoteManager {
	private plugin: EfrosinePlugin;
	private app: App;

	constructor(plugin: EfrosinePlugin) {
		this.plugin = plugin;
		this.app = plugin.app;
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
	 * This method is used to build the headings hierarchy.
	 *
	 * @param headings - The headings.
	 * @returns FileHeading[]
	 */
	static buildHeadingsHeararchy(headings: HeadingCache[]): FileHeading[] {
		let result: FileHeading[] = [];
		let stack: FileHeading[] = [];

		for (const heading of headings) {
			const temp = new FileHeading({
				value: heading.heading,
				pos: heading.position,
				level: heading.level,
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
	 * This method is used to update the table of content.
	 *
	 * @returns Promise<void>
	 */
	async updateToc(): Promise<void> {
		const file = this.getCurrentFile();
		if (!file) return;
		const headings = this.getHeadings(file);
		if (!headings) return;
		const content = await this.getFileContent(file);
		const tocData = NoteManager.buildHeadingsHeararchy(headings);
		const tocArray = this.createTocArray(tocData);
		const contentArray = NoteManager.contentToArray(content);
		const { lineStart, lineEnd } = this.findCodeBlockPost(
			contentArray,
			"efro-toc-container"
		);
		contentArray.splice(
			lineStart + 1,
			lineEnd - lineStart - 1,
			...tocArray
		);
		const newContent = NoteManager.arrayToContent(contentArray);
		this.modifyContent(file, newContent);
	}

	/**
	 * This method is used to get the current file.
	 *
	 * @returns TFile
	 */
	getCurrentFile(): TFile | null {
		return this.app.workspace.getActiveFile();
	}

	/**
	 * This method is used to get the file content.
	 *
	 * @param file - The file.
	 * @returns Promise<string>
	 */
	getFileContent(file: TFile): Promise<string> {
		return this.app.vault.read(file);
	}

	/**
	 * This method is used to get the file headings.
	 *
	 * @param file - The file.
	 * @returns HeadingCache[] | undefined
	 */
	getHeadings(file: TFile): HeadingCache[] | undefined {
		return this.app.metadataCache.getFileCache(file)?.headings;
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

	/**
	 * This method is used to create a table of content array.
	 *
	 * @param tocData - The table of content data.
	 * @param level - The level.
	 * @returns string[]
	 */
	private createTocArray(
		tocData: FileHeading[],
		level: number = 0
	): string[] {
		const result: string[] = [];
		tocData.forEach((item) => {
			const indent = "\t".repeat(level);
			result.push(`${indent}- ${item.value}`);
			if (item.children && item.children.length > 0) {
				result.push(...this.createTocArray(item.children, level + 1));
			}
		});
		return result;
	}

	/**
	 * This method is used to find the code block post.
	 * It will return the line start and line end.
	 *
	 * @param contentArray - The content array.
	 * @param blockName - The block name.
	 * @returns { lineStart: number, lineEnd: number }
	 */
	private findCodeBlockPost(
		contentArray: string[],
		blockName: string
	): {
		lineStart: number;
		lineEnd: number;
	} {
		let lineStart = -1;
		let lineEnd = -1;

		const startPattern = new RegExp(`^\\\`\\\`\\\`${blockName}`);
		const endPattern = /^```$/;

		for (let i = 0; i < contentArray.length; i++) {
			if (startPattern.test(contentArray[i])) {
				lineStart = i;
				break;
			}
		}

		for (let i = lineStart + 1; i < contentArray.length; i++) {
			if (endPattern.test(contentArray[i])) {
				lineEnd = i;
				break;
			}
		}

		return { lineStart, lineEnd };
	}
}
