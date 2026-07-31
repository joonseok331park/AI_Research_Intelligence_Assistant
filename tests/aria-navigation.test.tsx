import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  AppShell,
  type AppShellContext,
} from "@/src/components/AppShell";
import {
  DepartmentLabsView,
  LabProfileView,
} from "@/src/components/LabDirectoryViews";
import { DEMO_LAB_ID } from "@/src/lib/demo";
import { DEPT_BRAIN_SCIENCES } from "@/src/lib/lab-directory";
import { LAB_WORKSPACE_ENTRY_SCREEN } from "@/src/lib/lab-navigation";

const directoryContext: AppShellContext = {
  trail: "Labs",
  title: "연구실 디렉터리",
  subtitle: "Directory",
};

function renderShell(context: AppShellContext, screen: "directory" | "lab-profile") {
  return renderToStaticMarkup(
    <AppShell
      context={context}
      demoMode={false}
      onNavigate={() => undefined}
      onViewModeChange={() => undefined}
      screen={screen}
      unresolvedCount={0}
      viewMode="researcher"
    >
      <div>content</div>
    </AppShell>,
  );
}

describe("ARIA hierarchy navigation", () => {
  it("shows ARIA branding and only Labs in the top-level directory sidebar", () => {
    const html = renderShell(directoryContext, "directory");

    expect(html).toContain("aria-brand-mark");
    expect(html).toContain("AI Research Intelligence Assistant");
    expect(html).toContain("화면 미리보기 · 인증 아님");
    expect(html).toContain(">Labs<");
    expect(html).not.toContain(">Overview<");
    expect(html).not.toContain(">Settings<");
    expect(html).not.toContain("sidebar-footer");
  });

  it("shows only the active lab title in the lab-level sidebar footer", () => {
    const labTitle = "Center for Synapse Diversity and Specificity";
    const html = renderShell(
      {
        trail: "Labs / 뇌과학과",
        title: labTitle,
        subtitle: "Synapse Diversity Center",
        activeLabTitle: labTitle,
      },
      "lab-profile",
    );

    expect(html).toContain("Labs / 뇌과학과");
    expect(html).toContain("sidebar-footer");
    expect(html).toContain(`<strong>${labTitle}</strong>`);
  });
});

describe("researcher protocol access", () => {
  const renderDepartment = (viewMode: "visitor" | "researcher") =>
    renderToStaticMarkup(
      <DepartmentLabsView
        currentLabId="lab-neural-systems"
        departmentId={DEPT_BRAIN_SCIENCES}
        onBack={() => undefined}
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
