import { App, Notice, TFile, FrontMatterCache, moment } from "obsidian";
import * as yaml from "js-yaml";
import { EfrosineSettings, FrontmatterField } from "core/coreConfig";
import { DateFormat, DateOptions, FmFieldType } from "core/enums";

interface FrontmatterManagerParams {
	app: App;
}

export class FrontmatterManager {
	private app: App;

	constructor({ app }: FrontmatterManagerParams) {
		this.app = app;
	}

	/**
	 * Replaces the front matter in the given content with the new front matter.
	 *
	 * @param content - The original content with front matter.
	 * @param newFrontmatter - The new front matter to replace the original front matter.
	 * @returns The content with the replaced front matter.
	 */
	swapFrontMatter(content: string, newFrontmatter: string): string {
		return content.replace(
			/^---\n([\s\S]*?)\n---\n/,
			`---\n${newFrontmatter}---\n`
		);
	}

	/**
	 * Inserts the front matter field to the given file.
	 *
	 * @param file - The file to insert the front matter field.
	 * @param field - The front matter field to insert.
	 */
	public async insertFrontmatter(file: TFile, field: FrontmatterField) {
		const { vault } = this.app;
		if (!file) {
			new Notice("No file is open");
			return;
		}

		let content = await vault.read(file);

		let newContent: string;
		let newFm: { [key: string]: any } = { [field.name]: null };

		if (field.dateOptions === DateOptions.CTime) {
			const rawCTime = file.stat.ctime;
			if (field.type === FmFieldType.Date) {
				const formatedCTime = moment(rawCTime).format(DateFormat.Date);
				newFm = { [field.name]: formatedCTime };
			} else if (field.type === FmFieldType.DateTime) {
				const formatedCTime = moment(rawCTime).format(
					DateFormat.DateTime
				);
				newFm = { [field.name]: formatedCTime };
			}
		}

		const fmMatch = content.match(/^---\n([\s\S]*?)\n---\n/);
		let newFmString;
		if (fmMatch) {
			const existingFm = yaml.load(
				fmMatch[0].replace(/---/g, "")
			) as FrontMatterCache;
			const mergedFm = { ...existingFm, ...newFm };
			newFmString = yaml.dump(mergedFm);
			newContent = this.swapFrontMatter(content, newFmString);
		} else {
			newFmString = yaml.dump(newFm);
			newContent = `---\n${newFmString}---\n${content}`;
		}
		await vault.modify(file, newContent);
		new Notice("Frontmatter Added");
	}

	/**
	 * Updates the front matter of the given file with the new front matter.
	 *
	 * @param file - The file to update the front matter.
	 * @param newField - The new front matter to update.
	 */
	public async updateFrontMatter(file: TFile, newField: Record<string, any>) {
		const { vault } = this.app;
		if (!file) {
			new Notice("No file is open");
			return;
		}

		let content = await vault.read(file);

		let curFm = this.getCurrentField(file);
		if (!curFm) {
			new Notice("No frontmatter found");
			return;
		}

		const mergedFm = { ...curFm, ...newField };
		const newFmsString = yaml.dump(mergedFm);
		const newContent = this.swapFrontMatter(content, newFmsString);
		await vault.modify(file, newContent);
	}

	/**
	 * Gets the current front matter of the given file.
	 *
	 * @param file - The file to get the front matter.
	 * @returns The front matter of the given file.
	 */
	public getCurrentField(file: TFile) {
		return this.app.metadataCache.getFileCache(file)?.frontmatter;
	}

	/**
	 * Retrieves the last line of the frontmatter in the specified file.
	 *
	 * @param file - The file to retrieve the last frontmatter line from.
	 * @returns The line number of the last line of the frontmatter, or 0 if not found.
	 */
	public getFmLastLine(file: TFile): number {
		const result =
			this.app.metadataCache.getFileCache(file)?.frontmatterPosition?.end
				.line;
		return result ? result : 0;
	}

	/**
	 * Updates the modification time (mtime) field in the front matter of the active file.
	 *
	 * @param settings - The EfrosineSettings object containing the front matter field settings.
	 * @returns A Promise that resolves after the mtime field is updated.
	 */
	public async updateMtime(settings: EfrosineSettings) {
		const { app } = this;

		await new Promise((resolve) => setTimeout(resolve, 1000));

		const file = app.workspace.getActiveFile();
		if (!file) return;
		const mtime = file.stat.mtime;

		const fmEngine = new FrontmatterManager({ app });
		const currentFm = fmEngine.getCurrentField(file);
		const fmFieldSetting = settings.fmFields;

		if (!currentFm) {
			return;
		}

		const filteredFm = fmFieldSetting.filter((field) => {
			return field.dateOptions === DateOptions.MTime;
		});

		Object.entries(currentFm).forEach(([k, v]) => {
			filteredFm.forEach((field) => {
				if (k === field.name) {
					const formattedTime = moment(mtime).format(
						field.type === "date"
							? DateFormat.Date
							: DateFormat.DateTime
					);
					fmEngine.updateFrontMatter(file, {
						[k]: formattedTime,
					});
				}
			});
		});
	}
}
