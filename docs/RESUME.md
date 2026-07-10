# a4p-image 이어가기 문서

> 마지막 갱신: 2026-07-11 (세션 클리어 직전)

## 프로젝트 개요

옵시디언에 붙여넣은 이미지를 Cloudflare R2에 자동 업로드하고 노트에 공개 URL을 삽입하는 플러그인. share-note 웹 공유 시 이미지가 보이지 않는 문제 해결이 목적. 상세 아키텍처는 `CLAUDE.md`, 사용법·설정은 `README.md` 참고.

## 완료된 것 (기능 개발 완료 상태)

- 붙여넣기/드롭 → 압축(WebP·EXIF 제거, 기본 켬) → 노트 제목 기반 이름(`제목_1.webp`) → 로컬 백업 + R2 업로드 → URL 삽입. dedup(해시), 오프라인 폴백 + 재시도 커맨드
- R2는 SigV4 직접 서명 (`src/r2/`), 매니페스트 `index.json`이 로컬↔클라우드 매핑 관리
- 일괄 변환(dry-run 승인, `|300` 크기 보존), 이미지 주소 일괄 변경(도메인 전환), 미사용 리포트 + 승인 후 `.trash/` 이동
- 갤러리(`src/gallery-view.ts`): 검색·상태/날짜 필터·실사용처 기준 노트별 그룹·용량 통계, 카드 클릭 → 미리보기 모달(`src/preview-modal.ts`)
- 사이드 패널 삽입은 `src/insert.ts`의 lastMarkdownView 추적 사용 (readwise-search 패턴)
- vitest 53개 통과, dev vault(`~/obsidian_dev_vault`, 심볼릭 링크)에서 실동작 검증 완료
- R2 설정: 버킷 `obsidian-images`, 공개 URL `https://pub-f0b9258e10f0450eac718eeb63717c2e.r2.dev` (dev vault data.json에 입력됨)

## 다음 작업 (이번 세션에서 이어서)

**갤러리·미리보기 모달 디자인 고급화.** 사용자 피드백: "너무 촌스럽다, 고급적이지 않다" — readwise 스타일을 흉내냈지만 부족. 다음 방향 검토:
- 타이포그래피·여백·계층 정돈, 과한 테두리 줄이고 여백 중심의 미니멀 카드
- 썸네일 비율·hover 마이크로 인터랙션 세련되게, 모달 레이아웃(이미지/메타 배치) 재구성
- 사용자의 다른 플러그인(`a4p-readwise-search/styles.css`, `a4p-sermon-desk`)의 디자인 토큰 재검토 후 더 정제된 시안 제시 → **변경 전 시안/방향 승인받기**
- 대상 파일: `styles.css`, `src/gallery-view.ts`, `src/preview-modal.ts`

## 그 외 남은 절차 (개발 아님)

1. **실볼트 이관** (사용자 승인 후): `main.js`+`manifest.json`+`styles.css`를 `~/obsidian_remote/csh_remote/.obsidian/plugins/a4p-image/`에 **복사** (심볼릭 금지) → 설정 입력 → 미사용 리포트로 현황 파악 → 노트 1개 변환 시험 → share-note 확인 → 볼트 전체 변환
2. **Eagle 검증**: 사용자가 Eagle 설치 후 함께 테스트 (코드는 완성)
3. 모바일 실기기 확인
4. OCR 기능은 **하지 않기로 결정됨** (2026-07-11)

## 빌드·테스트

```bash
npm run build   # tsc + esbuild production
npm test        # vitest 53개
```
빌드 후 dev vault에서 플러그인 토글로 리로드.
