/**
 * Enter Interrupts
 *
 * Makes Enter mid-stream behave like Esc+Enter: aborts the current turn
 * immediately and submits the message right away, instead of queueing
 * it as a steering message that waits for the turn to finish.
 *
 * - Agent idle  → Enter behaves normally.
 * - Agent busy  → Enter aborts current work and sends the message now.
 * - Alt+Enter   → unchanged (queues a follow-up, waits for all work).
 *
 * Texting style: rapid-fire messages each take effect immediately.
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

export default function (pi: ExtensionAPI) {
	pi.on("input", async (event, ctx) => {
		// Only reroute messages that would queue as steering
		// (Enter pressed while the agent is busy, typed by the user).
		if (event.streamingBehavior !== "steer") return;
		if (event.source !== "interactive") return;

		const { text, images } = event;

		// Defer so this handler can return "handled" first, then
		// abort and resubmit once pi settles back to idle.
		(async () => {
			ctx.abort();
			while (!ctx.isIdle()) {
				await new Promise((r) => setTimeout(r, 25));
			}
			if (images?.length) {
				pi.sendUserMessage([{ type: "text", text }, ...images]);
			} else {
				pi.sendUserMessage(text);
			}
		})();

		return { action: "handled" };
	});
}
