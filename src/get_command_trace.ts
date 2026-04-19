import { runRg } from './utils/run-rg.js';

export const getCommandTraceTool = {
  name: "get_command_trace",
  description: "Trace a Command class in the undo/redo system: find its definition, execute/undo logic summary, where it's called via History.execute(), and what events it emits.",
  inputSchema: {
    type: "object",
    properties: {
      commandName: {
        type: "string",
        description: "Command class name (e.g., 'UpdateCheckpointPropertyCommand', 'SetColorCommand'). 'Command' suffix is optional."
      }
    },
    required: ["commandName"]
  },
  handler: async (args: { commandName: string }) => {
    let { commandName } = args;
    if (!commandName.endsWith('Command')) commandName += 'Command';

    try {
      const lines: string[] = [];
      lines.push(`\n⚡ Command Trace: ${commandName}`);
      lines.push('='.repeat(60));

      // 1. Find command definition file
      const defFiles = await runRg([
        `class ${commandName}`,
        'src',
        '--files-with-matches',
        '-g', '*.ts',
      ]);

      if (!defFiles) {
        lines.push(`\n❌ "${commandName}" not found`);
        lines.push('Commands live in: src/utils/commanders/');
        lines.push('Try: get_module_map with target="systems" or search src/utils/commanders/');
        return { content: [{ type: "text", text: lines.join('\n') }] };
      }

      const defFile = defFiles.split('\n')[0];
      lines.push(`\n📁 Definition: ${defFile}`);

      // 2. Grab execute() snippet (context lines after match)
      const executeSnippet = await runRg([
        'execute\\(\\)',
        '--vimgrep',
        '-A', '8',
        defFile,
      ]);
      if (executeSnippet) {
        lines.push('\n▶️  execute():');
        executeSnippet.split('\n').slice(0, 10).forEach(l => lines.push(`   ${l}`));
      }

      // 3. Grab undo() snippet
      const undoSnippet = await runRg([
        'undo\\(\\)',
        '--vimgrep',
        '-A', '8',
        defFile,
      ]);
      if (undoSnippet) {
        lines.push('\n↩️  undo():');
        undoSnippet.split('\n').slice(0, 10).forEach(l => lines.push(`   ${l}`));
      }

      // 4. Events emitted inside the command
      const eventsEmitted = await runRg([
        '\\.Emit\\(',
        '--vimgrep',
        defFile,
      ]);
      if (eventsEmitted) {
        lines.push('\n📤 Events emitted:');
        eventsEmitted.split('\n').filter(Boolean).forEach(l => lines.push(`   ${l}`));
      }

      // 5. Where History.execute(new CommandName is called across the codebase
      const callers = await runRg([
        `new ${commandName}`,
        'src',
        '--vimgrep',
        '-g', '*.ts',
        '-g', '*.tsx',
      ]);

      if (callers) {
        const callerLines = callers.split('\n').filter(Boolean);
        lines.push(`\n📍 Called from (${callerLines.length} location${callerLines.length !== 1 ? 's' : ''}):`);
        callerLines.slice(0, 12).forEach(l => lines.push(`   ${l}`));
        if (callerLines.length > 12) lines.push(`   ... and ${callerLines.length - 12} more`);
      } else {
        lines.push('\n📍 Called from: (not found — may be instantiated dynamically)');
      }

      lines.push('\n💡 All commands run via: SceneManagementSystem.History.execute(new Cmd(...))');

      return { content: [{ type: "text", text: lines.join('\n') }] };
    } catch (error: any) {
      return {
        content: [{ type: "text", text: `Error tracing command: ${error.message}` }],
        isError: true,
      };
    }
  }
};
