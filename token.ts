import { TokenType } from "./tokenType.ts";

export class Token {
	constructor(
		readonly type: TokenType,
		readonly lexeme: string,
		readonly literal: unknown,
		readonly line: number
	) {}

	toString(): string {
		return `${this.type} ${this.lexeme} ${this.literal}`;
	}
}
