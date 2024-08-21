import { Command } from "obsidian";
import {
	CaptureInsertWhere,
	DateOptions,
	FmFieldType,
	MacroType,
} from "./enums";
export interface EfrosineSettings {
	fmFields: FrontmatterField[];
	macros: MacroField[];
	buttons: ButtonField[];
}
export const DEFAULT_SETTINGS: EfrosineSettings = {
	fmFields: [],
	macros: [],
	buttons: [],
};
export interface FrontmatterField {
	name: string;
	type: FmFieldType;
	options?: string[];
	dateOptions?: DateOptions;
}

type CombineFunction = CaptureFunction | SequenceFunction;

export interface MacroField {
	name: string;
	type: MacroType;
	addToCommand: boolean;
	funcions?: CombineFunction;
}

export interface CaptureFunction {
	toActiveFile: boolean;
	filePath: string;
	inssertWhere: CaptureInsertWhere;
	insertAtEndSection?: boolean;
	insertRegEx?: string;
	value: string;
}

export interface SequenceFunction {
	value: Command[];
}

export interface ButtonField {
	name: string;
	position: string;
	command: Command;
}
