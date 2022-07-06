import { error } from "./lox.ts";
import { Token } from "./token.ts";
import { TokenType } from "./tokenType.ts";

export class Scanner {
	private static readonly keywords = new Map<string, TokenType>([
		["and", TokenType.AND],
		["class", TokenType.CLASS],
		["else", TokenType.ELSE],
		["false", TokenType.FALSE],
		["for", TokenType.FOR],
		["fun", TokenType.FUN],
		["if", TokenType.IF],
		["nil", TokenType.NIL],
		["or", TokenType.OR],
		["print", TokenType.PRINT],
		["return", TokenType.RETURN],
		["super", TokenType.SUPER],
		["this", TokenType.THIS],
		["true", TokenType.TRUE],
		["var", TokenType.VAR],
		["while", TokenType.WHILE],
	]);

	private readonly tokens: Token[] = [];
	private start = 0;
	private current = 0;
	private line = 0;

	constructor(private readonly source: string) {}

	scanTokens(): Token[] {
		while (!this.isAtEnd()) {
			this.start = this.current;
			this.scanToken();
		}

		this.tokens.push(new Token(TokenType.EOF, "", null, this.line));
		return this.tokens;
	}

	private isAtEnd() {
		return this.current >= this.source.length;
	}

	private scanToken() {
		const c = this.advance();

		switch (c) {
			case "(":
				this.addToken(TokenType.LEFT_PAREN);
				break;
			case ")":
				this.addToken(TokenType.RIGHT_PAREN);
				break;
			case "{":
				this.addToken(TokenType.LEFT_BRACE);
				break;
			case "}":
				this.addToken(TokenType.RIGHT_BRACE);
				break;
			case ",":
				this.addToken(TokenType.COMMA);
				break;
			case ".":
				this.addToken(TokenType.DOT);
				break;
			case "-":
				this.addToken(TokenType.MINUS);
				break;
			case "+":
				this.addToken(TokenType.PLUS);
				break;
			case ";":
				this.addToken(TokenType.SEMICOLON);
				break;
			case "*":
				this.addToken(TokenType.STAR);
				break;
			case "!":
				this.addToken(this.match("=") ? TokenType.BANG_EQUAL : TokenType.BANG);
				break;
			case "=":
				this.addToken(
					this.match("=") ? TokenType.EQUAL_EQUAL : TokenType.EQUAL
				);
				break;
			case "<":
				this.addToken(this.match("=") ? TokenType.LESS_EQUAL : TokenType.LESS);
				break;
			case ">":
				this.addToken(
					this.match("=") ? TokenType.GREATER_EQUAL : TokenType.GREATER
				);
				break;
			case "/":
				if (this.match("/")) {
					// A comment goes until the end of the line.
					while (this.peek() != "\n" && !this.isAtEnd()) {
						this.advance();
					}
				} else {
					this.addToken(TokenType.SLASH);
				}
				break;
			case " ":
			case "\r":
			case "\t":
				// Ignore whitespace.
				break;

			case '"':
				this.string();
				break;

			case "\n":
				this.line++;
				break;

			default:
				if (this.isDigit(c)) {
					this.number();
				} else if (this.isAlpha(c)) {
					this.identifier();
				} else {
					error(this.line, "Unexpected character.");
				}

				break;
		}
	}

	private advance() {
		return this.source[this.current++];
	}

	private match(expected: string) {
		if (this.isAtEnd()) {
			return false;
		}

		if (this.source[this.current] !== expected) {
			return false;
		}

		this.current++;
		return true;
	}

	private peek(): string {
		if (this.isAtEnd()) {
			return "\0";
		}

		return this.source[this.current];
	}

	private peekNext(): string {
		if (this.current + 1 >= this.source.length) {
			return "\0";
		}

		return this.source[this.current + 1];
	}

	private addToken(type: TokenType, literal: unknown = null) {
		const lexeme = this.source.substring(this.start, this.current);
		this.tokens.push(new Token(type, lexeme, literal, this.line));
	}

	private string() {
		while (this.peek() != '"' && !this.isAtEnd()) {
			if (this.peek() == "\n") this.line++;
			this.advance();
		}

		if (this.isAtEnd()) {
			error(this.line, "Unterminated string.");
		}

		// The closing ".
		this.advance();

		// Trim the surrounding quotes.
		const value = this.source.substring(this.start + 1, this.current - 1);
		this.addToken(TokenType.STRING, value);
	}

	private number() {
		while (this.isDigit(this.peek())) {
			this.advance();
		}

		if (this.peek() == "." && this.isDigit(this.peekNext())) {
			// Consume the decimal part.
			this.advance();

			while (this.isDigit(this.peek())) {
				this.advance();
			}
		}

		const value = parseFloat(this.source.substring(this.start, this.current));
		this.addToken(TokenType.NUMBER, value);
	}

	private identifier() {
		while (this.isAlphaNumeric(this.peek())) {
			this.advance();
		}

		const text = this.source.substring(this.start, this.current);
		console.log(text);
		const type = Scanner.keywords.get(text) ?? TokenType.IDENTIFIER;
		this.addToken(type);
	}

	private isDigit(c: string) {
		return /^\d$/.test(c);
	}

	private isAlpha(c: string) {
		return /^[a-z_]$/i.test(c);
	}

	private isAlphaNumeric(c: string) {
		return this.isAlpha(c) || this.isDigit(c);
	}
}
