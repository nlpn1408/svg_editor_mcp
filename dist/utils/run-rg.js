import { execFile } from 'child_process';
import { promisify } from 'util';
const execFileAsync = promisify(execFile);
/**
 * Run ripgrep. Returns stdout. Exit code 1 (no matches) returns empty string.
 * Cross-platform: no shell, no grep dependency.
 */
export async function runRg(args) {
    try {
        const { stdout } = await execFileAsync('rg', args, { maxBuffer: 1024 * 1024 });
        return stdout.trim();
    }
    catch (e) {
        if (e.code === 1)
            return '';
        throw e;
    }
}
//# sourceMappingURL=run-rg.js.map