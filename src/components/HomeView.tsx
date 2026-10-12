"use client";

import {
  ArrowRight,
  FileAudio,
  FileImage,
  FileText,
  FlaskConical,
  Link2,
  Search,
  Upload,
} from "lucide-react";
import { useMemo } from "react";

import { PRODUCT_CONFIG, publicAssetPath } from "@/src/config/product";
import { createExampleProtocolBundle } from "@/src/lib/example-protocol";
import type { SourceRef } from "@/src/types";

function citeLabel(ref: SourceRef) {
  if (ref.pageNumber) return `${ref.sourceLabel} · p.${ref.pageNumber}`;
  return `${ref.sourceLabel} · ${ref.author}`;
}

const FLOW_STEPS = [
  {
    id: "input",
    number: "01",
    title: "자료 입력",
    body: "인수인계 녹음, 손글씨 실험 노트, 기준 PDF, 최근 메모를 한 번에 올립니다. 파일마다 작성자와 날짜를 붙여 둡니다.",
    image: "/home/flow-01-input.png",
    alt: "New protocol 화면에서 녹음, 이미지, PDF, 메모 파일을 올린 모습",
  },
  {
    id: "compose",
    number: "02",
    title: "프로토콜 구성",
    body: "자료를 읽어 단계, 조건, 체크포인트로 정리합니다. 자료끼리 다른 값이나 빠진 항목은 임의로 합치지 않고 확인 목록에 남깁니다.",
    image: "/home/flow-02-compose.png",
    alt: "충돌과 누락 항목을 검토하는 화면",
  },
  {
    id: "evidence",
    number: "03",
    title: "근거 확인",
    body: "프로토콜의 문장을 누르면 오른쪽에 원본 위치와 인용이 열립니다. 왼쪽 자료 목록, 가운데 프로토콜, 오른쪽 근거를 한 화면에서 봅니다.",
    image: "/home/flow-03-evidence.png",
    alt: "자료 목록, 프로토콜, 근거가 세 칸으로 놓인 프로토콜 화면",
  },
] as const;

export function HomeView({
  busy,
  onStartSample,
  onStartOwn,
  onOpenDirectory,
}: {
  busy: boolean;
  onStartSample: () => void;
  onStartOwn: () => void;
  onOpenDirectory: () => void;
}) {
  const example = useMemo(() => createExampleProtocolBundle("preview"), []);
  const { snapshot } = example;
  const previewSteps = snapshot.steps.slice(1, 4);
  const highlighted = previewSteps[1];
  const highlightedRef = highlighted?.sourceRefs[0];

  return (
    <div className="home-page">
      <section className="home-hero" aria-labelledby="home-title">
        <div className="home-hero-copy">
          <p className="home-kicker">
            {PRODUCT_CONFIG.name} · {PRODUCT_CONFIG.fullName}
          </p>
          <h1 id="home-title">
            흩어진 실험 자료를 출처와 함께 정리하세요.
          </h1>
          <p className="home-lead">
            녹음, 손글씨 노트, PDF와 메모를 올리면 아리아가 단계와 조건을
            정리하고 문장마다 원본 위치를 붙여 둡니다.
          </p>
          <div className="home-actions">
            <button
              className="home-button home-button-primary"
              disabled={busy}
              onClick={onStartSample}
              type="button"
            >
              <FlaskConical aria-hidden size={16} />
              샘플로 체험하기
            </button>
            <button
              className="home-button"
              disabled={busy}
              onClick={onStartOwn}
              type="button"
            >
              <Upload aria-hidden size={16} />
              내 자료로 초안 만들기
            </button>
          </div>
          <p className="home-footnote">
            샘플은 합성 자료로 만든 Western blot 프로토콜입니다. 내 자료를
            분석하려면 Settings에서 본인의 Gemini API 키를 입력하세요.
          </p>
        </div>

        <figure className="home-preview" aria-label="완성된 프로토콜 예시">
          <figcaption className="home-preview-label">
            <span>완성된 프로토콜 예시</span>
          </figcaption>
          <div className="home-preview-card">
            <header>
              <h2>{snapshot.experiment.title}</h2>
              <p>{snapshot.experiment.objective}</p>
              <dl className="home-preview-stats">
                <div>
                  <dt>단계</dt>
                  <dd>{snapshot.steps.length}</dd>
                </div>
                <div>
                  <dt>원본 자료</dt>
                  <dd>{snapshot.sources.length}</dd>
                </div>
                <div>
                  <dt>출처 연결 조건</dt>
                  <dd>
                    {
                      snapshot.steps
                        .flatMap((step) => step.parameters)
                        .filter((parameter) => parameter.sourceRefs.length)
                        .length
                    }
                  </dd>
                </div>
              </dl>
            </header>
            <ol className="home-preview-steps">
              {previewSteps.map((step) => {
                const isHighlighted = step.id === highlighted?.id;
                return (
                  <li
                    className={isHighlighted ? "is-highlighted" : undefined}
                    key={step.id}
                  >
                    <span className="home-preview-step-no">
                      {String(step.order).padStart(2, "0")}
                    </span>
                    <div>
                      <strong>{step.title}</strong>
                      <p>{step.action}</p>
                      <ul>
                        {step.parameters.slice(0, 3).map((parameter) => (
                          <li key={parameter.name}>
                            {parameter.name} {parameter.value} {parameter.unit}
                          </li>
                        ))}
                      </ul>
                      {step.sourceRefs[0] ? (
                        <span className="home-cite">
                          <Link2 aria-hidden size={12} />
                          {citeLabel(step.sourceRefs[0])}
                        </span>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ol>
            {highlightedRef ? (
              <aside className="home-preview-evidence">
                <span>선택한 문장의 근거</span>
                <blockquote>“{highlightedRef.quote}”</blockquote>
                <small>
                  {highlightedRef.sourceLabel} · {highlightedRef.author}
                </small>
              </aside>
            ) : null}
          </div>
        </figure>
      </section>

      <section className="home-sources" aria-label="다루는 자료">
        <span>
          <FileAudio aria-hidden size={16} /> 음성 녹음
        </span>
        <span>
          <FileImage aria-hidden size={16} /> 손글씨 사진
        </span>
        <span>
          <FileText aria-hidden size={16} /> PDF 문서
        </span>
        <span>
          <FileText aria-hidden size={16} /> 텍스트 메모
        </span>
      </section>

      <section className="home-flow" aria-labelledby="home-flow-title">
        <header className="home-section-header">
          <p className="home-kicker">How it works</p>
          <h2 id="home-flow-title">자료를 올리고, 정리하고, 근거를 확인합니다.</h2>
        </header>
        <ol className="home-flow-list">
          {FLOW_STEPS.map((step) => (
            <li className="home-flow-item" key={step.id}>
              <div className="home-flow-copy">
                <span className="home-flow-number">{step.number}</span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </div>
              <div className="home-flow-shot">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt={step.alt}
                  height={900}
                  loading="lazy"
                  src={publicAssetPath(step.image)}
                  width={1440}
                />
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="home-directory" aria-labelledby="home-directory-title">
        <div>
          <h2 id="home-directory-title">연구실을 찾고 있나요?</h2>
          <p>
            연구실 탐색에서 연구실 이름, 지도교수, 연구 분야로 바로 찾고
            학과별로 좁혀 볼 수 있습니다.
          </p>
        </div>
        <button className="home-button" onClick={onOpenDirectory} type="button">
          <Search aria-hidden size={16} />
          연구실 탐색 열기
          <ArrowRight aria-hidden size={16} />
        </button>
      </section>

      <footer className="home-footer">
        <span>
          화면의 연구실, 연구자, 논문 정보는 기능 설명을 위한 합성 자료입니다.
        </span>
      </footer>
    </div>
  );
}
