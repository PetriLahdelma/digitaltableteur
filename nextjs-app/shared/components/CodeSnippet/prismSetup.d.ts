import Prism from "prismjs";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-python";
import "prismjs/components/prism-go";
import "prismjs/components/prism-rust";
import "prismjs/components/prism-json";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-markup";
/**
 * Prism with the supported language grammars registered. Kept in its own
 * module so the side-effect `prismjs/components/*` imports never appear in
 * CodeSnippet's emitted type declarations: prismjs is BUNDLED into the
 * published package (not a dependency), so a clean consumer has no prismjs
 * types and would fail typechecking (TS2882) on any leaked import. The value
 * import below is type-elided as long as Prism stays out of exported types.
 */
export default Prism;
//# sourceMappingURL=prismSetup.d.ts.map