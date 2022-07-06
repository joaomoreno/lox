import { Scanner } from "./scanner.ts";

let hadError = false;

function report(line: number, where: string, message: string) {
	console.error(`[line ${line}] Error ${where}: ${message}`);
	hadError = true;
}

export function error(line: number, message: string) {
	report(line, "", message);
}

function run(source: string) {
	const scanner = new Scanner(source);
	const tokens = scanner.scanTokens();

	for (const token of tokens) {
		console.log(token);
	}
}

function runFile(file: string) {
	const decoder = new TextDecoder();
	const buf = Deno.readFileSync(file);
	run(decoder.decode(buf));

	if (hadError) {
		Deno.exit(65);
	}
}

function runPrompt() {
	while (true) {
		const input = prompt("lox>");

		if (input === null) {
			break;
		}

		run(input);
		hadError = false;
	}
}

function main(args: string[]) {
	if (args.length > 1) {
		console.error("Usage: deno run lox [script]");
		Deno.exit(64);
	} else if (args.length == 1) {
		runFile(args[0]);
	} else {
		runPrompt();
	}
}

main(Deno.args);
