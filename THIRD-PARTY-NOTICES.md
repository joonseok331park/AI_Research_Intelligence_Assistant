# Third-party notices

최종 업데이트: 2026-07-24

ARIA는 여러 오픈소스 패키지와 외부 서비스를 사용합니다. 각 구성요소의
저작권과 라이선스는 각 권리자에게 있으며 루트의 프로젝트 권리 고지가 이를
대체하지 않습니다.

| 구성요소 | 용도 | 대표 라이선스 |
| --- | --- | --- |
| Next.js, React | 웹 애플리케이션 프레임워크와 UI 런타임 | MIT |
| TypeScript | 정적 타입 언어와 도구 | Apache-2.0 |
| Tailwind CSS | 스타일 시스템 | MIT |
| Lucide React | 인터페이스 아이콘 | ISC |
| Zustand | 클라이언트 상태 관리 | MIT |
| Dexie | IndexedDB 래퍼 | Apache-2.0 |
| Zod | 데이터 검증 | MIT |
| DOMPurify | HTML 정화 | MPL-2.0 또는 Apache-2.0 |
| PDF.js | PDF 읽기와 렌더링 | Apache-2.0 |
| Google Gen AI SDK | Gemini API 연결 | Apache-2.0 |
| Vitest | 테스트 | MIT |

정확한 고정 버전과 전이 의존성은 `pnpm-lock.yaml`을 기준으로 확인합니다.
릴리스 전에는 다음 명령으로 운영 의존성 라이선스 목록을 다시 생성하세요.

```bash
pnpm licenses list --prod --json
```

Google Gemini API, GitHub Pages와 GitHub Actions 사용에는 각 서비스의
이용약관과 개인정보 정책이 적용됩니다. DGIST 명칭과 관련 기관 자산은
해당 권리자의 자산이며 ARIA가 재허가하지 않습니다.
