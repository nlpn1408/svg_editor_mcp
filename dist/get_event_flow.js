import { runRg } from './utils/run-rg.js';
export const getEventFlowTool = {
    name: "get_event_flow",
    description: "Trace EventManager event flow: find all Emit() and Subscribe() usages for a given event name. Essential for debugging event-driven features in the editor.",
    inputSchema: {
        type: "object",
        properties: {
            eventName: {
                type: "string",
                description: "Event name or partial match (e.g., 'CHECKPOINT:PROPERTY_UPDATED', 'CANVAS_OBJECT_UPDATED', 'CHECKPOINT' to match all checkpoint events)"
            }
        },
        required: ["eventName"]
    },
    handler: async (args) => {
        const { eventName } = args;
        // Escape regex special chars, keep colon unescaped for event name patterns like DOMAIN:ACTION
        const escaped = eventName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        try {
            const [emitters, subscribers] = await Promise.all([
                runRg([`\\.Emit\\(['"]${escaped}['"]`, 'src', '--vimgrep', '-g', '*.ts', '-g', '*.tsx']),
                runRg([`\\.Subscribe\\(['"]${escaped}['"]`, 'src', '--vimgrep', '-g', '*.ts', '-g', '*.tsx']),
            ]);
            const lines = [];
            lines.push(`\n⚡ Event Flow: "${eventName}"`);
            lines.push('='.repeat(60));
            if (!emitters && !subscribers) {
                lines.push(`\n❌ No usages found for event "${eventName}"`);
                lines.push('Tip: Try a partial name, e.g. "CHECKPOINT" to match all checkpoint events');
                return { content: [{ type: "text", text: lines.join('\n') }] };
            }
            const emitterLines = emitters ? emitters.split('\n').filter(Boolean) : [];
            const subscriberLines = subscribers ? subscribers.split('\n').filter(Boolean) : [];
            if (emitterLines.length > 0) {
                lines.push(`\n📤 Emitters (${emitterLines.length}) — who fires this event:`);
                emitterLines.slice(0, 15).forEach(line => lines.push(`   ${line}`));
                if (emitterLines.length > 15)
                    lines.push(`   ... and ${emitterLines.length - 15} more`);
            }
            else {
                lines.push('\n📤 Emitters: (none found — event may only be subscribed to, or name differs)');
            }
            if (subscriberLines.length > 0) {
                lines.push(`\n📥 Subscribers (${subscriberLines.length}) — who listens:`);
                subscriberLines.slice(0, 15).forEach(line => lines.push(`   ${line}`));
                if (subscriberLines.length > 15)
                    lines.push(`   ... and ${subscriberLines.length - 15} more`);
            }
            else {
                lines.push('\n📥 Subscribers: (none found — event may only be emitted, or name differs)');
            }
            lines.push('\n💡 Flow Summary:');
            lines.push(`   ${emitterLines.length} emitter(s) → "${eventName}" → ${subscriberLines.length} subscriber(s)`);
            if (emitterLines.length > 0 && subscriberLines.length === 0) {
                lines.push('   ⚠️  Event is emitted but never subscribed to — possible dead event');
            }
            if (emitterLines.length === 0 && subscriberLines.length > 0) {
                lines.push('   ⚠️  Event is subscribed to but never emitted — subscription may be stale');
            }
            return { content: [{ type: "text", text: lines.join('\n') }] };
        }
        catch (error) {
            return {
                content: [{ type: "text", text: `Error tracing event: ${error.message}` }],
                isError: true,
            };
        }
    }
};
//# sourceMappingURL=get_event_flow.js.map