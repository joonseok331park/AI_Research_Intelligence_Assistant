import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  AppShell,
  type AppShellContext,
} from "@/src/components/AppShell";
import {
  LabExplorerView,
  LabProfileView,
} from "@/src/components/LabDirectoryViews";
import { DEMO_LAB_ID } from "@/src/lib/demo";
import { DEPT_BRAIN_SCIENCES } from "@/src/lib/lab-directory";
import { LAB_WORKSPACE_ENTRY_SCREEN } from "@/src/lib/lab-navigation";

const directoryContext: AppShellContext = {
  trail: "Labs",
  title: "연구실 탐색",
  subtitle: "Directory",
};

function renderShell(
  context: AppShellContext,
  screen: "home" | "directory" | "overview",
  viewMode: "visitor" | "researcher" = "researcher",
) {
  return renderToStaticMarkup(
    <AppShell
      context={context}
      demoMode={false}
      onNavigate={() => undefined}
      onViewModeChange={() => undefined}
      screen={screen}
      unresolvedCount={0}
      viewMode={viewMode}
    >
      <div>content</div>
    </AppShell>,
  );
}

describe("ARIA hierarchy navigation", () => {
  it("keeps the site menu in the header and no workspace sidebar outside the workspace", () => {
    const html = renderShell(directoryContext, "directory");

    expect(html).toContain("aria-brand-mark");
    expect(html).toContain("AI Research Intelligence Assistant");
    expect(html).toContain("화면 미리보기 · 인증 아님");
    expect(html).toContain("theme-labs");
    expect(html).toContain(">연구실 탐색<");
    expect(html).toContain(">작업 공간<");
    expect(html).not.toContain(">Overview<");
    expect(html).not.toContain("sidebar-footer");
  });

  it("uses the home zone for the home screen", () => {
    expect(renderShell(directoryContext, "home")).toContain("theme-home");
  });

  it("shows the workspace menu and the active lab inside the workspace", () => {
    const labTitle = "Center for Synapse Diversity and Specificity";
    const html = renderShell(
      {
        trail: "Lab workspace",
        title: labTitle,
        subtitle: "Synapse Diversity Center",
        activeLabTitle: labTitle,
      },
      "overview",
    );

    expect(html).toContain("theme-workspace");
    expect(html).toContain(">Overview<");
    expect(html).toContain(">Settings<");
    expect(html).toContain("sidebar-footer");
    expect(html).toContain(`<strong>${labTitle}</strong>`);
  });

  it("locks the workspace menu in visitor view", () => {
    const html = renderShell(directoryContext, "directory", "visitor");
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>[^<]*<svg[\s\S]*?작업 공간/);
  });
});

describe("researcher protocol access", () => {
  const renderDepartment = (viewMode: "visitor" | "researcher") =>
    renderToStaticMarkup(
      <LabExplorerView
        currentLabId="lab-neural-systems"
        initialDepartmentId={DEPT_BRAIN_SCIENCES}
        onOpenProfile={() => undefined}
        onOpenWorkspace={() => undefined}
        protocols={[]}
        unresolvedCount={0}
        viewMode={viewMode}
      />,
    );

  it("enables every lab protocol button for researchers", () => {
    const html = renderDepartment("researcher");

    expect(html).not.toContain('disabled=""');
    expect(html).toContain("합성 데모");
    expect(html).toContain("합성 예시");
    expect(LAB_WORKSPACE_ENTRY_SCREEN).toBe("protocols");
    expect(html).toContain('data-workspace-destination="protocols"');
  });

  it("keeps protocol buttons unavailable in visitor view", () => {
    expect(renderDepartment("visitor")).toContain('disabled=""');
  });

  it("starts the explorer filtered to the requested department", () => {
    const html = renderDepartment("researcher");

    expect(html).toContain("연구실 탐색");
    expect(html).toMatch(/aria-checked="true"[^>]*>[\s\S]*?뇌과학과/);
    expect(html).toContain("Circuit Imaging Lab");
    expect(html).not.toContain("Surface Dynamics Lab");
  });

  it("labels lab profiles and papers as synthetic examples", () => {
    const html = renderToStaticMarkup(
      <LabProfileView
        labId={DEMO_LAB_ID}
        onBack={() => undefined}
        onOpenProfile={() => undefined}
        onOpenWorkspace={() => undefined}
        onSwitchToResearcher={() => undefined}
        viewMode="visitor"
      />,
    );

    expect(html).toContain("SYNTHETIC LAB PROFILE");
    expect(html).toContain("합성 데모");
    expect(html).toContain("주요 논문 (합성 예시)");
    expect(html).toContain("실제 인증이나 권한 통제가 아닙니다");
  });
});
