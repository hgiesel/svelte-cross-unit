
export function compileAsServer(input) {
    const code = input.replaceAll(
        svelteGlobalPattern,
        (_match, identifier, value) => `const ${identifier} = ${globalIdentifier}.${identifier} = ${value}`,
    )

    return `${globalIdentifier} = {};\n${code}`;
}

export function compileAsClient(input) {
    return input.replaceAll(
        svelteGlobalPattern,
        (_match, identifier) => `const ${identifier} = ${globalIdentifier}.${identifier}`,
    );
}

export function esbuildPlugin({ server = false } = {}) {
    return {
        name: "svelte-cross-unit",
        setup: (build) => {
            build.onLoad({ filter: /.*/ }, async (args) => {
                if (!args.path.endsWith("index.mjs")) {
                    return;
                }

                const source = await fs.promises.readFile(args.path, "utf8");
                const contents = server ? compileAsServer(source) : compileAsClient(source);

                return { contents };
            });
        },
    };
}

