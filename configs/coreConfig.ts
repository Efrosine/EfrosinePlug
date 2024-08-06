import { DateOptions, FmFieldType } from "./enums";

export interface FrontmatterField {
	name: string;
	type: FmFieldType;
	options?: string[];
	dateOptions?: DateOptions;
}

export interface EfrosineSettings {
	fmFields: FrontmatterField[];
}
export const DEFAULT_SETTINGS: EfrosineSettings = {
	fmFields: [],
};
