import { PRODUCT_CONFIG } from "@/src/config/product";
import { DEMO_LAB_ID } from "@/src/lib/demo";
import type { Lab } from "@/src/types";

export interface Department {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  color: string;
  order: number;
}

export const DEPT_CHEM_PHYSICS = "dept-chemistry-physics";
export const DEPT_EECS = "dept-eecs";
export const DEPT_ROBOTICS = "dept-robotics";
export const DEPT_ENERGY = "dept-energy";
export const DEPT_BRAIN_SCIENCES = "dept-brain-sciences";
export const DEPT_NEW_BIOLOGY = "dept-new-biology";

export function buildDepartments(): Department[] {
  return [
    {
      id: DEPT_CHEM_PHYSICS,
      name: "화학물리학과",
      nameEn: "Chemistry and Physics",
      description: "물질의 구조와 반응을 화학·물리 관점에서 연구합니다.",
      color: "#315CEB",
      order: 1,
    },
    {
      id: DEPT_EECS,
      name: "전기전자컴퓨터공학과",
      nameEn: "Electrical Engineering and Computer Science",
      description: "전자·통신·컴퓨터 시스템을 함께 다룹니다.",
      color: "#137A55",
      order: 2,
    },
    {
      id: DEPT_ROBOTICS,
      name: "로봇및기계전자공학과",
      nameEn: "Robotics and Mechatronics Engineering",
      description: "로봇과 기계·전자 융합 기술을 연구합니다.",
      color: "#B7791F",
      order: 3,
    },
    {
      id: DEPT_ENERGY,
      name: "에너지공학과",
      nameEn: "Energy Science and Engineering",
      description: "차세대 에너지 소재와 시스템을 연구합니다.",
      color: "#B42318",
      order: 4,
    },
    {
      id: DEPT_BRAIN_SCIENCES,
      name: "뇌과학과",
      nameEn: "Brain Sciences",
      description: "뇌와 신경계를 분자부터 시스템 수준까지 연구합니다.",
      color: "#0B1739",
      order: 5,
    },
    {
      id: DEPT_NEW_BIOLOGY,
      name: "뉴바이올로지학과",
      nameEn: "New Biology",
      description: "생명과학과 공학을 결합해 새로운 생물학적 문제를 다룹니다.",
      color: "#6941C6",
      order: 6,
    },
  ];
}

interface LabSeed {
  id: string;
  departmentId: string;
  name: string;
  shortName: string;
  field: string;
}

// 공개 저장소에는 기능 확인에 필요한 합성 연구실만 둔다.
// 실제 연구실 명부나 인사 정보는 포함하지 않는다.
const SYNTHETIC_LABS: LabSeed[] = [
  {
    id: "lab-chem-surface-dynamics",
    departmentId: DEPT_CHEM_PHYSICS,
    name: "Surface Dynamics Lab",
    shortName: "SDL",
    field: "표면 반응, 시간분해 분광학, 기능성 박막",
  },
  {
    id: "lab-chem-quantum-materials",
    departmentId: DEPT_CHEM_PHYSICS,
    name: "Quantum Materials Studio",
    shortName: "QMS",
    field: "저차원 물질, 양자수송, 계산재료과학",
  },
  {
    id: "lab-eecs-trustworthy-systems",
    departmentId: DEPT_EECS,
    name: "Trustworthy Systems Lab",
    shortName: "TSL",
    field: "소프트웨어 검증, AI 안전성, 분산시스템",
  },
  {
    id: "lab-eecs-interactive-intelligence",
    departmentId: DEPT_EECS,
    name: "Interactive Intelligence Lab",
    shortName: "IIL",
    field: "멀티모달 AI, HCI, 대화형 시스템",
  },
  {
    id: "lab-robotics-precision-motion",
    departmentId: DEPT_ROBOTICS,
    name: "Precision Motion Lab",
    shortName: "PML",
    field: "로봇 조작, 정밀 제어, 비전 기반 자동화",
  },
  {
    id: "lab-robotics-soft-interface",
    departmentId: DEPT_ROBOTICS,
    name: "Soft Interface Lab",
    shortName: "SIL",
    field: "소프트 로봇, 웨어러블 센서, 인간-로봇 상호작용",
  },
  {
    id: "lab-energy-storage-process",
    departmentId: DEPT_ENERGY,
    name: "Energy Storage Process Lab",
    shortName: "ESPL",
    field: "전지 소재, 고체전해질, 전극 공정",
  },
  {
    id: "lab-energy-circular-catalysis",
    departmentId: DEPT_ENERGY,
    name: "Circular Catalysis Lab",
    shortName: "CCL",
    field: "전기화학 촉매, 탄소 전환, 지속가능 공정",
  },
  {
    id: "lab-brain-circuit-imaging",
    departmentId: DEPT_BRAIN_SCIENCES,
    name: "Circuit Imaging Lab",
    shortName: "CIL",
    field: "신경회로, 칼슘 이미징, 행동 분석",
  },
  {
    id: "lab-brain-synaptic-signaling",
    departmentId: DEPT_BRAIN_SCIENCES,
    name: "Synaptic Signaling Lab",
    shortName: "SSL",
    field: "시냅스 전달, 단백질 신호, 신경가소성",
  },
  {
    id: "lab-newbio-cell-state",
    departmentId: DEPT_NEW_BIOLOGY,
    name: "Cell State Lab",
    shortName: "CSL",
    field: "단일세포 분석, 세포 상태 전이, 정밀생물학",
  },
  {
    id: "lab-newbio-protein-control",
    departmentId: DEPT_NEW_BIOLOGY,
    name: "Protein Control Lab",
    shortName: "PCL",
    field: "단백질 항상성, 표적 단백질 분해, 신약개발",
  },
];

function splitResearchAreas(field: string): string[] {
  return field
    .split(/[,、]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 6);
}

function buildSyntheticLabs(): Lab[] {
  const now = new Date().toISOString();

  return SYNTHETIC_LABS.map((seed) => ({
    id: seed.id,
    departmentId: seed.departmentId,
    name: seed.name,
    shortName: seed.shortName,
    field: seed.field,
    pi: "연구실 관리자",
    description: "등록된 프로토콜을 확인하고 새 자료를 추가할 수 있습니다.",
    isDemo: false,
    createdAt: now,
    updatedAt: now,
    intro: `${seed.field}를 연구하는 합성 예시 연구실입니다.`,
    researchAreas: splitResearchAreas(seed.field),
    profileBody:
      "ARIA의 연구실 디렉터리와 프로토콜 관리 흐름을 확인하기 위한 합성 프로필입니다.",
    isProfilePublic: true,
  }));
}

export function buildDirectoryLabs(): Lab[] {
  const now = new Date().toISOString();

  return [
    {
      id: DEMO_LAB_ID,
      departmentId: DEPT_BRAIN_SCIENCES,
      name: PRODUCT_CONFIG.defaultLab.name,
      shortName: PRODUCT_CONFIG.defaultLab.shortName,
      field: "신경과학 및 분자생물학",
      pi: "연구실 관리자",
      description: PRODUCT_CONFIG.defaultLab.description,
      keyPapers: PRODUCT_CONFIG.defaultLab.keyPapers.map((paper) => ({
        ...paper,
      })),
      isDemo: false,
      createdAt: now,
      updatedAt: now,
      intro: PRODUCT_CONFIG.defaultLab.description,
      researchAreas: [
        "시냅스 가소성",
        "신경회로",
        "이미징",
        "분자신경생물학",
      ],
      profileBody:
        "Western blot 자료를 모아 프로토콜로 정리하는 공개용 합성 연구실입니다.",
      isProfilePublic: true,
    },
    ...buildSyntheticLabs(),
  ];
}

export const DIRECTORY_DEPARTMENTS = buildDepartments();
export const DIRECTORY_LABS = buildDirectoryLabs();

export function getDepartment(
  departmentId: string,
): Department | undefined {
  return DIRECTORY_DEPARTMENTS.find(
    (department) => department.id === departmentId,
  );
}

export function getDirectoryLab(labId: string): Lab | undefined {
  return DIRECTORY_LABS.find((lab) => lab.id === labId);
}
