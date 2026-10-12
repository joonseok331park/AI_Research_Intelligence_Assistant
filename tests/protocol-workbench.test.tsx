import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ProtocolDetailView } from "@/src/components/ProtocolViews";
import { SourcePanel } from "@/src/components/SourcePanel";
import { createExampleProtocolBundle } from "@/src/lib/example-protocol";

const example = createExampleProtocolBundle("lab-test");

function renderWorkbench(selected: boolean) {
  const ref = example.snapshot.steps[2].sourceRefs[0];
  return renderToStaticMarkup(
    <ProtocolDetailView
      conflicts={[]}
      evidence={
        <SourcePanel
          onClose={() => undefined}
          sourceRef={selected ? ref : null}
          variant="docked"
        />
      }
      missingFields={[]}
      onAcceptSuggestion={() => undefined}
      onAssistant={() => undefined}
      onBack={() => undefined}
      onReview={() => undefined}
      onSave={() => undefined}
      onSource={() => undefined}
      onStatus={() => undefined}
      onToast={() => undefined}
      protocol={{ ...example.protocol, snapshot: example.snapshot }}
      selectedSourceRef={selected ? ref : null}
      sources={example.snapshot.sources}
      suggestions={[]}
      versions={[]}
    />,
  );
}

describe("protocol workbench", () => {
  it("puts sources, the protocol and the evidence column side by side", () => {
    const html = renderWorkbench(false);

    expect(html).toContain("workbench-sources");
    expect(html).toContain("workbench-document");
    expect(html).toContain("workbench-evidence");
    expect(html).toContain("자료 목록");
    expect(html).toContain("Transfer 인수인계 녹음");
    expect(html).toContain("아직 선택한 문장이 없습니다");
    expect(html).toContain("step-action is-citable");
  });

  it("shows the quote of the selected sentence in the evidence column", () => {
    const html = renderWorkbench(true);

    expect(html).toContain("protocol-workbench has-selection");
    expect(html).toContain("선택한 문장의 근거");
    expect(html).toContain("45분에 ice pack을 교체합니다");
  });
});
