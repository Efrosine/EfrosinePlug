import { App, Notice, TFile, FrontMatterCache, moment } from "obsidian";
import * as yaml from "js-yaml";
import { FrontmatterField } from "configs/coreConfig";
import { DateFormat, DateOptions, FmFieldType } from "configs/enums";

interface FrontmatterManagerParams {
	app: App;
}

export class FrontmatterManager {
	private app: App;

	constructor({ app }: FrontmatterManagerParams) {
		this.app = app;
	}

	replaceFm(content: string, newFm: string): string {
		return content.replace(/^---\n([\s\S]*?)\n---\n/, `---\n${newFm}---\n`);
	}

	public async addFm(file: TFile, field: FrontmatterField) {
		if (!file) {
			new Notice("No file is open");
			return;
		}

		let content = await this.app.vault.read(file);

		let newContent: string;
		let newFm: { [key: string]: any } = { [field.name]: null };
		let newFmString;

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
		if (fmMatch) {
			const existingFm = yaml.load(
				fmMatch[0].replace(/---/g, "")
			) as FrontMatterCache;
			const mergedFm = { ...existingFm, ...newFm };
			newFmString = yaml.dump(mergedFm);
			newContent = this.replaceFm(content, newFmString);
		} else {
			newFmString = yaml.dump(newFm);
			newContent = `---\n${newFmString}---\n${content}`;
		}
		await this.app.vault.modify(file, newContent);
		new Notice("Frontmatter Added");
	}

	public async updateFm(file: TFile, newFm: Record<string, any>) {
		if (!file) {
			new Notice("No file is open");
			return;
		}

		let content = await this.app.vault.read(file);

		let curFm = this.getCurFm(file);
		if (!curFm) {
			new Notice("No frontmatter found");
			return;
		}

		const mergedFm = { ...curFm, ...newFm };
		const newFmsString = yaml.dump(mergedFm);
		const newContent = this.replaceFm(content, newFmsString);
		await this.app.vault.modify(file, newContent);
	}

	public getCurFm(file: TFile) {
		return this.app.metadataCache.getFileCache(file)?.frontmatter;
	}
}
