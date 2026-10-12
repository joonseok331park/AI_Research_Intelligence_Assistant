"use client";

import { LockKeyhole, Menu, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { PRODUCT_CONFIG } from "@/src/config/product";
import type { WorkspaceViewMode } from "./LabDirectoryViews";

export type AppScreen =
  | "home"
  | "directory"
  | "department"
  | "lab-profile"
  | "overview"
  | "protocols"
  | "new"
  | "analysis"
  | "source-review"
  | "review"
  | "detail"
  | "assistant"
  | "sources"
  | "settings";

export type AppZone = "home" | "labs" | "workspace";

export function zoneForScreen(screen: AppScreen): AppZone {
  if (screen === "home") return "home";
  if (["directory", "department", "lab-profile"].includes(screen)) {
    return "labs";
  }
  return "workspace";
}

export interface AppShellContext {
  trail: string;
  title: string;
  subtitle?: string;
  activeLabTitle?: string;
}

const siteNav: Array<{ screen: AppScreen; label: string; zone: AppZone }> = [
  { screen: "home", label: "홈", zone: "home" },
  { screen: "directory", label: "연구실 탐색", zone: "labs" },
  { screen: "overview", label: "작업 공간", zone: "workspace" },
];

const workspaceNav: Array<{
  screen: AppScreen;
  label: string;
}> = [
  { screen: "overview", label: "Overview" },
  { screen: "protocols", label: "Protocols" },
  { screen: "new", label: "New protocol" },
  { screen: "sources", label: "Sources" },
  { screen: "assistant", label: "Protocol Q&A" },
];

export function AppShell({
  screen,
  onNavigate,
  unresolvedCount,
  demoMode,
  viewMode,
  onViewModeChange,
  context,
  children,
}: {
  screen: AppScreen;
  onNavigate: (screen: AppScreen) => void;
  unresolvedCount: number;
  demoMode: boolean;
  viewMode: WorkspaceViewMode;
  onViewModeChange: (mode: WorkspaceViewMode) => void;
  context: AppShellContext;
  children: ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const zone = zoneForScreen(screen);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const navigate = (next: AppScreen) => {
    setMenuOpen(false);
    onNavigate(next);
  };

  const visitorLockTitle =
    "연구원 화면 미리보기에서 내부 작업 공간을 확인할 수 있습니다. 실제 인증 기능은 아닙니다.";

  return (
    <div className={`app-shell theme-${zone}`} data-zone={zone}>
      <header className="site-header">
        <button
          aria-label={`${PRODUCT_CONFIG.name} 홈으로 이동`}
          className="brand"
          onClick={() => navigate("home")}
          type="button"
        >
          <span aria-hidden className="aria-brand-mark" />
          <span className="brand-copy">
            <span className="brand-title">{PRODUCT_CONFIG.name}</span>
            <span className="brand-subtitle">{PRODUCT_CONFIG.fullName}</span>
          </span>
        </button>

        <nav aria-label="사이트 메뉴" className="site-nav">
          {siteNav.map((item) => {
            const locked = viewMode === "visitor" && item.zone === "workspace";
            return (
              <button
                aria-current={zone === item.zone ? "page" : undefined}
                className="site-nav-link"
                disabled={locked}
                key={item.screen}
                onClick={() => navigate(item.screen)}
                title={locked ? visitorLockTitle : undefined}
                type="button"
              >
                {locked ? <LockKeyhole aria-hidden size={13} /> : null}
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="topbar-actions">
          <div
            aria-label="화면 미리보기 모드 전환"
            className="view-mode-toggle"
            role="group"
          >
            <span className="view-mode-note">화면 미리보기 · 인증 아님</span>
            <button
              aria-pressed={viewMode === "visitor"}
              onClick={() => onViewModeChange("visitor")}
              type="button"
            >
              방문자
            </button>
            <button
              aria-pressed={viewMode === "researcher"}
              onClick={() => onViewModeChange("researcher")}
              type="button"
            >
              연구원
            </button>
          </div>
          <span
            className="mode-badge"
            title={
              demoMode
                ? "Settings에서 본인의 Gemini API 키를 입력해 주세요."
                : "현재 탭에 Gemini API 키가 입력되어 있으며 실제 접근은 분석 요청 때 검증됩니다."
            }
          >
            <span className="mode-dot" />
            <span>{demoMode ? "내 API 키 입력 필요" : "Gemini 키 입력됨"}</span>
          </span>
          {zone === "workspace" ? (
            <button
              aria-label={menuOpen ? "메뉴 닫기" : "메뉴 열기"}
              className="icon-button mobile-menu-button"
              onClick={() => setMenuOpen((value) => !value)}
              type="button"
            >
              {menuOpen ? (
                <X aria-hidden size={18} />
              ) : (
                <Menu aria-hidden size={18} />
              )}
            </button>
          ) : null}
        </div>
      </header>

      {zone === "workspace" ? (
        <div className="workspace-frame">
          {menuOpen ? (
            <div
              aria-hidden
              className="source-panel-backdrop"
              onClick={() => setMenuOpen(false)}
            />
          ) : null}
          <aside
            aria-label="작업 공간 메뉴"
            className={`sidebar${menuOpen ? " is-open" : ""}`}
          >
            <div className="sidebar-context">
              <span>{context.trail}</span>
              <strong>{context.title}</strong>
              {context.subtitle ? <small>{context.subtitle}</small> : null}
            </div>
            <nav className="nav-section">
              {workspaceNav.map((item) => {
                const visitorLocked = viewMode === "visitor";
                const selected =
                  screen === item.screen ||
                  (item.screen === "new" &&
                    ["analysis", "source-review", "review"].includes(screen)) ||
                  (item.screen === "protocols" && screen === "detail");
                return (
                  <button
                    aria-current={selected ? "page" : undefined}
                    className="nav-button"
                    disabled={visitorLocked}
                    key={item.screen}
                    onClick={() => navigate(item.screen)}
                    title={visitorLocked ? visitorLockTitle : undefined}
                    type="button"
                  >
                    <span>{item.label}</span>
                    {item.screen === "protocols" && unresolvedCount > 0 ? (
                      <span
                        aria-label={`미해결 ${unresolvedCount}건`}
                        className="nav-count"
                      >
                        {unresolvedCount}
                      </span>
                    ) : null}
                  </button>
                );
              })}
              <button
                aria-current={screen === "settings" ? "page" : undefined}
                className="nav-button"
                onClick={() => navigate("settings")}
                type="button"
              >
                <span>Settings</span>
              </button>
            </nav>

            {context.activeLabTitle ? (
              <footer className="sidebar-footer">
                <div className="lab-mini">
                  <span>현재 연구실</span>
                  <strong>{context.activeLabTitle}</strong>
                </div>
              </footer>
            ) : null}
          </aside>
          <main className="app-main">{children}</main>
        </div>
      ) : (
        <main className="app-main">{children}</main>
      )}
    </div>
  );
}
