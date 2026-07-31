import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { SourcePanel } from "@/src/components/SourcePanel";
import type { SourceRef } from "@/src/types";

const baseRef: SourceRef = {
  artifactId: "source-audio",
  sourceLabel: "합성 인수인계 전사문",
  author: "합성 화자",
  quote: "Transfer 조건을 다시 확인한다.",
  confidence: 0.92,
};

function renderSourcePanel(sourceRef: SourceRef): string {
  return renderToStaticMarkup(
    <SourcePanel
      onClose={() => undefined}
      sourceRef={sourceRef}
    />,
  );
}

describe("SourcePanel audio timestamps", () => {
  it("renders a start-only timestamp without a dangling range separator", () => {
    const html = renderSourcePanel({
      ...baseRef,
      timestampStart: 12,
    });

    expect(html).toContain('<dd class="mono">00:12</dd>');
    expect(html).not.toContain("00:12–");
  });

  it("renders a complete start-end timestamp range", () => {
    const html = renderSourcePanel({
      ...baseRef,
      timestampStart: 12,
      timestampEnd: 18,
    });

    expect(html).toContain('<dd class="mono">00:12–00:18</dd>');
  });
});
