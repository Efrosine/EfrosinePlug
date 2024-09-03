import { Pos } from "obsidian";

export class FileHeading {
	value: string;
	pos?: Pos;
	level: number;
	children?: FileHeading[];

	constructor({
		value,
		pos,
		level,
		children,
	}: {
		value: string;
		pos?: Pos;
		level: number;
		children?: FileHeading[];
	}) {
		this.value = value;
		this.pos = pos;
		this.children = children;
		this.level = level;
	}
}
