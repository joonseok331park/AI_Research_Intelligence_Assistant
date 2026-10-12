import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/src/stores/useLabTraceStore", () => {
  const state = {
    activeProtocol: null,
    analysisStage: "idle",
    conflicts: [],
    demoMode: true,
    error: null,
    excerpts: [],
    hydrated: true,
    lab: null,
    missingFields: [],
    protocols: [],
    selectedSourceRef: null,
    sources: [],
    toast: null,
  };
  return {
    useLabTraceStore: Object.assign(() => state, {
      getState: () => state,
    }),
  };
});

import { AriaApp } from "@/src/components/AriaApp";

describe("ARIA initial screen", () => {
  it("opens the home page with both entry actions and a finished example", () => {
    const html = renderToStaticMarkup(<AriaApp />);

    expect(html).toContain("theme-home");
    expect(html).toContain("샘플로 체험하기");
    expect(html).toContain("내 자료로 초안 만들기");
    expect(html).toContain("완성된 프로토콜 예시");
    expect(html).toContain("Phospho-ERK Western blot");
    expect(html).toContain("자료 입력");
    expect(html).toContain("프로토콜 구성");
    expect(html).toContain("근거 확인");
    expect(html).toContain("화면 미리보기 · 인증 아님");
    expect(html).toContain("연구실 탐색");
    expect(html).not.toContain("프로토콜 관리");
  });
});
