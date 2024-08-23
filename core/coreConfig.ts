import { Command } from "obsidian";
import {
	CaptureInsertWhere,
	DateOptions,
	FmFieldType,
	MacroType,
} from "core/enums";
import { ButtonField } from "entity/buttonField";
export interface EfrosineSettings {
	fmFields: FrontmatterField[];
	macroFields: MacroField[];
	buttonFields: ButtonField[];
}
export const DEFAULT_SETTINGS: EfrosineSettings = {
	fmFields: [],
	macroFields: [],
	buttonFields: [],
};
export interface FrontmatterField {
	name: string;
	type: FmFieldType;
	options?: string[];
	dateOptions?: DateOptions;
}

export interface MacroField {
	name: string;
	type: MacroType;
	addToCommand: boolean;
	funcions?: CaptureFunction | SequenceFunction;
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
