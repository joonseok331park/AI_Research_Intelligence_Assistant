"use client";

import {
  ArrowLeft,
  BookOpen,
  FlaskConical,
  LockKeyhole,
  MessageCircleQuestion,
  Search,
  Send,
  Users,
  X,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";

import {
  PRODUCT_CONFIG,
  publicAssetPath,
} from "@/src/config/product";
import { answerGuideQuestion } from "@/src/lib/guide";
import {
  DIRECTORY_DEPARTMENTS,
  DIRECTORY_LABS,
  getDepartment,
  getDirectoryLab,
} from "@/src/lib/lab-directory";
import { LAB_WORKSPACE_ENTRY_SCREEN } from "@/src/lib/lab-navigation";
import type { Lab, Protocol } from "@/src/types";
import { Panel } from "./common";

export type WorkspaceViewMode = "visitor" | "researcher";

function SyntheticDemoNotice() {
  return (
    <div className="synthetic-demo-notice" role="note">
      <strong>합성 데모</strong>
      <span>
        이 화면의 연구실·연구자·논문 정보는 기능 설명을 위한 가상
        자료이며 실제 기관 정보를 나타내지 않습니다.
      </span>
    </div>
  );
}

interface DirectoryNavigationProps {
  currentLabId?: string;
  onOpenProfile: (labId: string) => void;
  onOpenWorkspace: (labId: string) => void;
  viewMode: WorkspaceViewMode;
}

const ALL_DEPARTMENTS = "all";

function normalize(value: string) {
  return value.trim().toLocaleLowerCase("ko-KR");
}

function labAreas(lab: Lab): string[] {
  return lab.researchAreas?.length ? lab.researchAreas : [lab.field];
}

export function LabExplorerView({
  currentLabId,
  initialDepartmentId,
  onOpenProfile,
  onOpenWorkspace,
  protocols,
  unresolvedCount,
  viewMode,
}: DirectoryNavigationProps & {
  initialDepartmentId?: string;
  protocols: Protocol[];
  unresolvedCount: number;
}) {
  const [query, setQuery] = useState("");
  const [departmentId, setDepartmentId] = useState(
    initialDepartmentId && getDepartment(initialDepartmentId)
      ? initialDepartmentId
      : ALL_DEPARTMENTS,
  );
  const [connectedOnly, setConnectedOnly] = useState(false);
  const [sort, setSort] = useState<"name" | "department">("department");

  const departmentCounts = useMemo(() => {
    const result = new Map<string, number>();
    DIRECTORY_LABS.forEach((lab) => {
      if (!lab.departmentId) return;
      result.set(lab.departmentId, (result.get(lab.departmentId) ?? 0) + 1);
    });
    return result;
  }, []);

  const suggestedAreas = useMemo(() => {
    const counts = new Map<string, number>();
    DIRECTORY_LABS.forEach((lab) =>
      labAreas(lab).forEach((area) =>
        counts.set(area, (counts.get(area) ?? 0) + 1),
      ),
    );
    return [...counts.entries()]
      .sort((left, right) =>
        right[1] - left[1] || left[0].localeCompare(right[0], "ko"),
      )
      .slice(0, 8)
      .map(([area]) => area);
  }, []);

  const labs = useMemo(() => {
    const normalized = normalize(query);
    const departmentOrder = new Map(
      DIRECTORY_DEPARTMENTS.map((department) => [
        department.id,
        department.order,
      ]),
    );
    return DIRECTORY_LABS.filter((lab) => {
      if (departmentId !== ALL_DEPARTMENTS && lab.departmentId !== departmentId) {
        return false;
      }
      if (connectedOnly && lab.id !== currentLabId) return false;
      if (!normalized) return true;
      const department = lab.departmentId
        ? getDepartment(lab.departmentId)
        : undefined;
      return [
        lab.name,
        lab.shortName,
        lab.pi,
        lab.field,
        department?.name,
        department?.nameEn,
        ...labAreas(lab),
      ].some((value) => normalize(value ?? "").includes(normalized));
    }).sort((left, right) => {
      if (left.id === currentLabId) return -1;
      if (right.id === currentLabId) return 1;
      if (sort === "department") {
        const byDepartment =
          (departmentOrder.get(left.departmentId ?? "") ?? 99) -
          (departmentOrder.get(right.departmentId ?? "") ?? 99);
        if (byDepartment) return byDepartment;
      }
      return left.name.localeCompare(right.name, "ko");
    });
  }, [connectedOnly, currentLabId, departmentId, query, sort]);

  const activeDepartment =
    departmentId === ALL_DEPARTMENTS ? undefined : getDepartment(departmentId);
  const hasFilters =
    Boolean(query.trim()) || Boolean(activeDepartment) || connectedOnly;
  const resetFilters = () => {
    setQuery("");
    setDepartmentId(ALL_DEPARTMENTS);
    setConnectedOnly(false);
  };

  return (
    <div className="page directory-page lab-explorer">
      <header className="explorer-hero">
        <p className="page-kicker">SYNTHETIC LAB DIRECTORY</p>
        <h1 className="page-title">연구실 탐색</h1>
        <p className="page-description">
          연구실 이름, 지도교수, 연구 분야로 바로 찾고 학과별로 좁혀 보세요.
        </p>
        <form
          className="explorer-search"
          onSubmit={(event) => event.preventDefault()}
          role="search"
        >
          <label className="directory-search">
            <Search aria-hidden size={18} />
            <span className="sr-only">연구실 검색</span>
            <input
              onChange={(event) => setQuery(event.target.value)}
              placeholder="연구실명, 지도교수 또는 연구 분야 검색"
              type="search"
              value={query}
            />
            {query ? (
              <button
                aria-label="검색어 지우기"
                className="explorer-clear"
                onClick={() => setQuery("")}
                type="button"
              >
                <X aria-hidden size={15} />
              </button>
            ) : null}
          </label>
        </form>
        <div aria-label="추천 검색어" className="explorer-suggestions">
          <span>추천 검색어</span>
          {suggestedAreas.map((area) => (
            <button
              aria-pressed={normalize(query) === normalize(area)}
              key={area}
              onClick={() => setQuery(area)}
              type="button"
            >
              {area}
            </button>
          ))}
        </div>
      </header>

      <SyntheticDemoNotice />

      <div className="explorer-layout">
        <aside aria-label="연구실 필터" className="explorer-filters">
          <section>
            <h2>학과</h2>
            <div className="explorer-filter-list" role="radiogroup">
              <button
                aria-checked={departmentId === ALL_DEPARTMENTS}
                className="explorer-filter"
                onClick={() => setDepartmentId(ALL_DEPARTMENTS)}
                role="radio"
                type="button"
              >
                <span>전체 학과</span>
                <small>{DIRECTORY_LABS.length}</small>
              </button>
              {DIRECTORY_DEPARTMENTS.map((department) => (
                <button
                  aria-checked={departmentId === department.id}
                  className="explorer-filter"
                  key={department.id}
                  onClick={() => setDepartmentId(department.id)}
                  role="radio"
                  title={department.description}
                  type="button"
                >
                  <span>
                    {department.name}
                    <em>{department.nameEn}</em>
                  </span>
                  <small>{departmentCounts.get(department.id) ?? 0}</small>
                </button>
              ))}
            </div>
          </section>
          <section>
            <h2>작업 공간</h2>
            <label className="explorer-check">
              <input
                checked={connectedOnly}
                onChange={(event) => setConnectedOnly(event.target.checked)}
                type="checkbox"
              />
              <span>연결된 연구실만 보기</span>
            </label>
          </section>
        </aside>

        <section aria-live="polite" className="explorer-results">
          <header className="explorer-results-header">
            <p>
              <strong>{labs.length}</strong>개 연구실
              {activeDepartment ? ` · ${activeDepartment.name}` : ""}
              {query.trim() ? ` · “${query.trim()}”` : ""}
            </p>
            <div className="explorer-results-tools">
              {hasFilters ? (
                <button
                  className="text-link"
                  onClick={resetFilters}
                  type="button"
                >
                  필터 초기화
                </button>
              ) : null}
              <label className="explorer-sort">
                <span>정렬</span>
                <select
                  onChange={(event) =>
                    setSort(event.target.value as "name" | "department")
                  }
                  value={sort}
                >
                  <option value="department">학과순</option>
                  <option value="name">이름순</option>
                </select>
              </label>
            </div>
          </header>

          {activeDepartment ? (
            <p className="explorer-department-note">
              {activeDepartment.description}
            </p>
          ) : null}

          <div className="lab-directory-list">
            {labs.map((lab) => {
              const workspaceConnected = lab.id === currentLabId;
              const protocolCount = workspaceConnected ? protocols.length : 0;
              const department = lab.departmentId
                ? getDepartment(lab.departmentId)
                : undefined;
              return (
                <article className="lab-directory-row" key={lab.id}>
                  <div className="lab-directory-labels">
                    <span className="lab-directory-department">
                      {department?.name ?? "학과 미지정"}
                    </span>
                    <small>합성 예시</small>
                    {workspaceConnected ? (
                      <small className="is-connected">작업 공간 연결됨</small>
                    ) : null}
                  </div>
                  <button
                    className="lab-directory-main"
                    onClick={() => onOpenProfile(lab.id)}
                    type="button"
                  >
                    <span className="lab-directory-title">
                      <strong>{lab.name}</strong>
                      <span>{lab.shortName}</span>
                    </span>
                    <span className="lab-directory-meta">
                      {lab.pi || "지도교수 정보 미등록"}
                    </span>
                  </button>
                  <ul
                    aria-label={`${lab.name} 연구 분야`}
                    className="lab-directory-areas"
                  >
                    {labAreas(lab).map((area) => (
                      <li key={area}>
                        <button onClick={() => setQuery(area)} type="button">
                          {area}
                        </button>
                      </li>
                    ))}
                  </ul>
                  <footer className="lab-directory-footer">
                    <span className="lab-directory-stats">
                      프로토콜 {protocolCount}건
                      {workspaceConnected
                        ? ` · 확인 필요 ${unresolvedCount}건`
                        : ""}
                    </span>
                    <div className="lab-directory-actions">
                      <button
                        className="button button-small"
                        onClick={() => onOpenProfile(lab.id)}
                        type="button"
                      >
                        소개
                      </button>
                      <button
                        className="button button-small button-primary"
                        data-workspace-destination={LAB_WORKSPACE_ENTRY_SCREEN}
                        disabled={viewMode === "visitor"}
                        onClick={() => onOpenWorkspace(lab.id)}
                        title={
                          viewMode === "visitor"
                            ? "연구원 화면 미리보기로 전환하면 프로토콜 화면을 확인할 수 있습니다. 실제 인증 기능은 아닙니다."
                            : `${lab.name} 프로토콜 작업 공간 열기`
                        }
                        type="button"
                      >
                        {viewMode === "visitor" ? (
                          <LockKeyhole aria-hidden size={13} />
                        ) : (
                          <FlaskConical aria-hidden size={13} />
                        )}
                        프로토콜
                      </button>
                    </div>
                  </footer>
                </article>
              );
            })}
          </div>
          {labs.length === 0 ? (
            <div className="empty-state directory-empty">
              <div>
                <Search aria-hidden size={24} />
                <h3>검색 결과가 없습니다</h3>
                <p>
                  다른 연구실명이나 연구 분야로 검색하거나 필터를 초기화해
                  보세요.
                </p>
                <button className="button" onClick={resetFilters} type="button">
                  필터 초기화
                </button>
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}

export function LabProfileView({
  labId,
  currentLabId,
  onBack,
  onOpenWorkspace,
  onSwitchToResearcher,
  viewMode,
}: DirectoryNavigationProps & {
  labId: string;
  onBack: () => void;
  onSwitchToResearcher: () => void;
}) {
  const lab = getDirectoryLab(labId);
  const department = lab?.departmentId
    ? getDepartment(lab.departmentId)
    : undefined;
  const workspaceConnected = lab?.id === currentLabId;
  const papers =
    lab?.keyPapers ??
    (workspaceConnected ? PRODUCT_CONFIG.defaultLab.keyPapers : []);

  if (!lab) {
    return (
      <div className="page">
        <div className="empty-state">
          <div>
            <h3>연구실 정보를 찾을 수 없습니다</h3>
            <button className="button" onClick={onBack} type="button">
              연구실 목록으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page lab-profile-page">
      <header className="page-header lab-profile-header">
        <div>
          <button className="text-link" onClick={onBack} type="button">
            <ArrowLeft aria-hidden size={14} />
            연구실 탐색
          </button>
          <p className="page-kicker">SYNTHETIC LAB PROFILE</p>
          <h1 className="page-title">{lab.name}</h1>
          <p className="page-description">
            {lab.pi || "지도교수 정보 미등록"}
            {department ? ` · ${department.name}` : ""}
          </p>
        </div>
        <div className="page-actions">
          {viewMode === "visitor" ? (
            <button
              className="button button-primary"
              onClick={onSwitchToResearcher}
              type="button"
            >
              <Users aria-hidden size={14} />
              연구원 화면 미리보기
            </button>
          ) : (
            <button
              className="button button-primary"
              data-workspace-destination={LAB_WORKSPACE_ENTRY_SCREEN}
              onClick={() => onOpenWorkspace(lab.id)}
              type="button"
            >
              <FlaskConical aria-hidden size={14} />
              {workspaceConnected
                ? "프로토콜 관리"
                : "프로토콜 작업 공간 열기"}
            </button>
          )}
        </div>
      </header>

      <SyntheticDemoNotice />

      <div className="lab-profile-layout">
        <main>
          <Panel title="연구실 소개">
            <div className="lab-profile-intro">
              <p>{lab.intro || lab.description}</p>
              {lab.profileBody ? (
                <div className="lab-profile-body">{lab.profileBody}</div>
              ) : null}
            </div>
          </Panel>

          <Panel title="주요 연구 분야">
            <div className="research-area-list">
              {(lab.researchAreas?.length
                ? lab.researchAreas
                : [lab.field]
              ).map((area) => (
                <span key={area}>{area}</span>
              ))}
            </div>
          </Panel>

          <Panel title="주요 논문 (합성 예시)">
            {papers.length ? (
              <div className="profile-paper-list">
                {papers.slice(0, 3).map((paper) => (
                  <article key={`${paper.title}-${paper.year}`}>
                    <BookOpen aria-hidden size={15} />
                    <div>
                      <strong>{paper.title}</strong>
                      <span>
                        {paper.journal} · {paper.year}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="muted-copy">
                공개 프로필에 등록된 주요 논문이 없습니다.
              </p>
            )}
          </Panel>
        </main>

        <aside className="lab-profile-aside">
          <div>
            <span>공개 범위</span>
            <strong>연구실 소개</strong>
          </div>
          <p>
            방문자·연구원 전환은 기능 설명을 위한 화면 미리보기이며 실제
            인증이나 권한 통제가 아닙니다. 연구원 화면에서는 합성
            프로토콜과 원본 자료 흐름을 확인할 수 있습니다.
          </p>
          {workspaceConnected ? (
            <span className="workspace-connection">
              <span aria-hidden />
              ARIA 작업 공간 연결됨
            </span>
          ) : (
            <span className="workspace-connection is-muted">
              연구원 화면 미리보기에서 작업 공간 확인 가능
            </span>
          )}
        </aside>
      </div>
    </div>
  );
}

interface GuideMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
}

const GUIDE_QUESTIONS = [
  "새 프로토콜은 어떻게 만들어?",
  "충돌과 누락은 어떻게 해결해?",
  "원본 출처는 어디서 확인해?",
  "사용자 API 키는 어디서 바꿔?",
];

export function GuideAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<GuideMessage[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const send = (question: string) => {
    const trimmed = question.trim();
    if (!trimmed) return;
    setMessages((current) => {
      const nextId = (current.at(-1)?.id ?? 0) + 1;
      return [
        ...current,
        { id: nextId, role: "user", content: trimmed },
        {
          id: nextId + 1,
          role: "assistant",
          content: answerGuideQuestion(trimmed),
        },
      ];
    });
    setInput("");
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    send(input);
  };

  return (
    <div className={`guide-assistant${open ? " is-open" : ""}`}>
      {open ? (
        <section
          aria-label="ARIA 사용법 도움말"
          className="guide-panel"
        >
          <header>
            {/* Static local ARIA mark; a plain image avoids framework image
                optimization work in the offline desktop launcher. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt="ARIA"
              height={34}
              src={publicAssetPath("/aria-logo.png")}
              width={34}
            />
            <div>
              <strong>ARIA 사용 안내</strong>
              <span>ARIA 화면과 작업 흐름을 안내합니다</span>
            </div>
            <button
              aria-label="사용법 도움말 닫기"
              className="icon-button"
              onClick={() => setOpen(false)}
              type="button"
            >
              <X aria-hidden size={15} />
            </button>
          </header>

          <div aria-live="polite" className="guide-messages">
            <div className="guide-message assistant">
              안녕하세요. ARIA에서 하려는 작업을 알려 주세요. 실험
              조건은 Protocol Q&amp;A에서 근거와 함께 확인할 수 있어요.
            </div>
            {messages.map((message) => (
              <div
                className={`guide-message ${message.role}`}
                key={message.id}
              >
                {message.content}
              </div>
            ))}
            {messages.length === 0 ? (
              <div className="guide-questions">
                {GUIDE_QUESTIONS.map((question) => (
                  <button
                    key={question}
                    onClick={() => send(question)}
                    type="button"
                  >
                    {question}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <form className="guide-form" onSubmit={submit}>
            <input
              aria-label="사용법 질문"
              onChange={(event) => setInput(event.target.value)}
              placeholder="화면 사용법을 물어보세요"
              ref={inputRef}
              value={input}
            />
            <button
              aria-label="질문 보내기"
              disabled={!input.trim()}
              type="submit"
            >
              <Send aria-hidden size={15} />
            </button>
          </form>
        </section>
      ) : null}

      <button
        aria-expanded={open}
        aria-label={open ? "사용법 도움말 닫기" : "사용법 도움말 열기"}
        className="guide-launcher"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt=""
            height={40}
            src={publicAssetPath("/aria-logo.png")}
            width={40}
          />
        <span>
          <MessageCircleQuestion aria-hidden size={14} />
          도움말
        </span>
      </button>
    </div>
  );
}
