import { Command } from "obsidian";
import EfrosinePlugin from "main";
import { ButtonPosition, ButtonType } from "core/enums";
import { CommandManager } from "manager/commandManager";

export class ButtonField {
	name: string;
	type: ButtonType;
	position: ButtonPosition;
	command: Command;
	filePath?: string;

	constructor(
		name: string,
		type: ButtonType,
		position: ButtonPosition,
		command: Command,
		filePath?: string
	) {
		this.name = name;
		this.type = type;
		this.position = position;
		this.command = command;
		this.filePath = filePath;
	}

	static empty(): ButtonField {
		return new ButtonField("", ButtonType.Cta, ButtonPosition.Left, {
			name: "",
			id: "",
		});
	}

	static fromMap(
		plugin: EfrosinePlugin,
		map: { [key: string]: string }
	): ButtonField | undefined {
		const name = map["name"];
		const type = map["type"];
		const position = map["position"];
		const command = new CommandManager(plugin).findCommand(
			map["commandId"]
		)!;
		const filePath = map["filePath"];
		if (!name || !type || !position || !command) {
			return undefined;
		}
		return new ButtonField(
			name,
			type as ButtonType,
			position as ButtonPosition,
			command,
			filePath
		);
	}

	static toString(button: ButtonField): string {
		const { name, type, position, command, filePath } = button;
		const backtic = "```";
		const displayString = `${backtic}efrosine-but\nname= ${name}\ntype= ${type}\nposition= ${position}\ncommandId= ${
			command.id
		}\nfilePath= ${filePath ?? ""}\n${backtic}\n`;

		return displayString;
	}

	static fromString(
		plugin: EfrosinePlugin,
		str: string
	): ButtonField | undefined {
		const lines = str.split("\n").filter((row) => row.length > 0);
		const data: { [key: string]: string } = {};
		lines.forEach((row) => {
			const [key, val] = row.split("=").map((part) => part.trim());
			data[key] = val;
		});
		return ButtonField.fromMap(plugin, data);
	}
}
