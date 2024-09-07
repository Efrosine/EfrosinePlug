export enum FmFieldType {
	Text = "text",
	Number = "number",
	Select = "select",
	List = "list",
	Date = "date",
	DateTime = "datetime",
	Tags = "tags",
}
export enum MacroType {
	Capture = "capture",
	Sequence = "sequence",
}

export enum ButtonType {
	Nav = "efro-mod-nav",
	Warnig = "mod-warning",
	Cta = "mod-cta",
}

export enum ButtonPosition {
	Left = "efro-but-left",
	Right = "efro-but-right",
}
export enum CaptureInsertWhere {
	Cursor = "Cursor",
	Top = "Top (after fm)",
	Bottom = "Bottom File",
	Replace = "Replace",
	InsertAfter = "Insert After",
	InsertBefore = "Insert Before",
}

export enum CrudFrontmatter {
	ADD = "Add Frontmatter Field",
	UPDATE = "Update Frontmatter Field",
}

export enum DateOptions {
	Now = "now",
	CTime = "ctime",
	MTime = "mtime",
	Custom = "custom",
}

export enum DateFormat {
	Date = "YYYY-MM-DD",
	DateTime = "YYYY-MM-DDTHH:mm",
}
