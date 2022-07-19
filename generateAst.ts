const typeRX = /^\s*([^:\s]+)\s*:\s*(.+)\s*$/;
const fieldRX = /(\w+) +(\w+)/g;

function defineAst(outputDir: string, baseName: string, types: string[]) {
	const content = `export abstract class ${baseName} {
	abstract accept<R>(visitor: Visitor<R>): R;
}
${defineVisitor(baseName, types)}
${types.map((t) => defineType(baseName, t)).join("\n")}
`;

	const encoder = new TextEncoder();
	Deno.writeFileSync(
		`${outputDir}/${baseName.toLowerCase()}.ts`,
		encoder.encode(content)
	);
}

function defineType(baseName: string, raw: string) {
	const [, className, fields] = typeRX.exec(raw)!;

	const ctorParams: string[] = [];
	for (const [, type, param] of fields.matchAll(fieldRX)) {
		ctorParams.push(`		readonly ${param}: ${type}`);
	}

	return `
export class ${className} extends ${baseName} {
	constructor(
${ctorParams.join(",\n")}
	) {
		super();
	}

	override accept<R>(visitor: Visitor<R>): R {
		return visitor.visit${className}${baseName}(this);
	}
}`;
}

function defineVisitor(baseName: string, types: string[]) {
	return `
interface Visitor<R> {
${types
	.map((t) => {
		const typeName = typeRX.exec(t)![1];
		return `	visit${typeName}${baseName}(${baseName.toLowerCase()}: ${typeName}): R;`;
	})
	.join("\n")}
}`;
}

function main(args: string[]) {
	if (args.length != 1) {
		console.error("Usage: deno run generate_ast <output_directory>");
		Deno.exit(64);
	}

	const outputDir = args[0];
	defineAst(outputDir, "Expr", [
		"Binary   : Expr left, Token operator, Expr right",
		"Grouping : Expr expression",
		"Literal  : Object value",
		"Unary    : Token operator, Expr right",
	]);
}

main(Deno.args);
