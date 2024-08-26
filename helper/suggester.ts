import { Command, TFile } from "obsidian";
import { inputSuggester } from "core/abstracClass/inputSuggester";
import { CommandManager } from "manager/commandManager";

/**
 * This class is used to suggest the file.
 *
 * @extends inputSuggester
 */
export class FileSuggester extends inputSuggester<TFile> {
	protected getItems(): TFile[] {
		return this.app.vault.getFiles();
	}

	protected filterItems(item: TFile, query: string): boolean {
		return item.path.includes(query);
	}

	renderSuggestion(value: TFile, el: HTMLElement): void {
		el.setText(value.path);
	}
}

/**
 * This class is used to suggest the command.
 *
 * @extends inputSuggester
 */
export class CommandSugest extends inputSuggester<Command> {
	protected getItems(): Command[] {
		return new CommandManager(this.plugin).listCommand();
	}

	protected filterItems(item: Command, query: string): boolean {
		return item.name.toLowerCase().includes(query.toLowerCase());
	}

	renderSuggestion(value: Command, el: HTMLElement): void {
		el.setText(value.name);
	}
}
