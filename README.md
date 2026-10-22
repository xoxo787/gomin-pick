# 고민픽 · gomin-pick

피부 고민별 화장품의 가격·용량·단위가격·구매처와 선택 근거를 함께 비교하는 한국어 정적 사이트입니다.

데모: **https://xoxo787.github.io/gomin-pick/** — 2026-10-22 공개. 배포된 버전은 `version.json`의 `commit`으로 확인할 수 있습니다.

## 기능과 화면 사용법

1. 보습, 진정·민감, 트러블, 미백·잡티, 주름·탄력, 모공·피지, 자외선 차단 중 고민을 선택합니다.
2. 구매처와 피부 타입 표시 조건을 고른 뒤 제품 기록을 확인합니다. 피부 타입 표시는 공식 설명에 명시된 정보에 한합니다.
3. 상위 근거, 가격, 단위가격 순으로 정렬합니다. `10ml`, `10g`, `1ea`는 서로 다른 묶음으로 비교하며, 계산할 수 없는 값은 확인 필요로 남습니다.
4. 향료·에탄올 포함 제품 숨기기를 켜면 확인된 성분 정보를 기준으로 표시가 바뀝니다. 정보가 없는 제품은 미포함으로 간주하지 않고 별도로 표시합니다.
5. 카드의 **왜 이 제품?**에서 근거와 출처를 확인합니다. 비슷한 핵심 성분의 저렴한 대안은 같은 단위가격 기준으로만 비교합니다. 성분이 겹친다고 효과가 같지는 않습니다.
6. 확인일과 가격 출처를 읽고 구매처 링크로 이동합니다. 공식 검색 결과 링크인 경우 실제 상품을 다시 찾아야 합니다.

Vite + TypeScript로 구성하며 서버, 외부 API, LLM 호출 없이 JSON을 정적 빌드에 포함합니다. 제품 이미지나 브랜드 로고는 사용하지 않습니다. 확정되지 않은 차별화 방향은 [제안 문서](docs/DIFFERENTIATION.md)에 따로 기록합니다.

## 데이터 수집 방식과 한계

`data/concerns.json`, `data/ingredients.json`, `data/products.json`은 사람이 출처를 확인해 정리하는 큐레이션 데이터셋입니다. 제품별 어워즈·보도·공식 발표 근거를 기록하고, `rank_in_group`은 해당 자료에 근거한 **큐레이션 순서**로 사용합니다. 서로 다른 구매처를 합친 실시간 인기 순위나 판매량 순위는 아닙니다.

가격·용량·성분을 확인하지 못하면 `null` 또는 빈 성분 목록을 유지하고 `unverified_fields`에 표시합니다. 브랜드 공식몰 정가는 구매처의 실제 판매가와 다를 수 있으며 할인·재고·배송비를 보장하지 않습니다. 제품 수, 고민별·구매처별 분포, 필드별 결측 비율은 수동으로 적어 두지 않고 **`npm run validate-data`의 현재 출력**을 기준으로 확인합니다. 출처별 조사 범위와 한계는 [DATA_SOURCES.md](docs/DATA_SOURCES.md)에 기록합니다.

자동 크롤러를 만들지 않은 이유는 다음과 같습니다.

- **올리브영:** 조사 과정의 봇 차단과 프로젝트 접근 제한을 존중합니다. 이 프로젝트는 올리브영 사이트에 자동 접근하지 않으며 차단을 우회하지 않습니다. 공식 검색 URL은 접속 없이 문자열로 구성할 수 있습니다.
- **다이소몰:** 사전 조사에서 [robots.txt](https://www.daisomall.co.kr/robots.txt)의 `Crawl-delay: 30`이 확인되었습니다. robots 지시는 수집·재사용에 관한 포괄적 허가가 아니므로 사이트 약관과 콘텐츠 이용 범위도 확인해야 합니다. 현재 구현은 자동 수집을 하지 않습니다. 이 문서 작성 시 robots 원문의 웹 도구 재열람은 실패했으며 사전 조사 사실과 구분해 기록합니다.
- **네이버 쇼핑 API:** 신규 신청 제한과 데이터 저장·가공 이용 제한 때문에 의존하지 않습니다. 2026-10-22에 재확인한 [공식 약관](https://developers.naver.com/products/intro/terms/terms.md)은 개발자센터 대상 API의 신규 신청 중단 및 허용 범위를 넘는 저장·가공 제한을 명시합니다. 또한 [공식 종료 공지](https://developers.naver.com/notice/article/32564)에 쇼핑 검색 API의 2026-07-31 종료가 안내되어 있습니다.

이 방식은 최신성을 자동 보장하지 않습니다. 확인 후 30일이 지난 기록은 재검토 대상으로 표시하며, 주간 자동 검사는 오래된 목록을 알릴 뿐 데이터를 갱신하지 않습니다.

## 로컬 실행

Node.js **24**와 npm을 사용합니다. 잠금 파일을 유지하고 아래 명령을 프로젝트 루트에서 실행합니다.

```sh
npm ci
npm run dev
npm test -- --maxWorkers=1
npm run validate-data
npm run build
npx playwright install --with-deps chromium
npm run test:e2e
```

추가 검사: `npm run lint`, `npm run typecheck`. 개발 서버의 경로는 `/gomin-pick/`입니다. Playwright는 Chromium만 사용합니다. 브라우저 테스트와 개발 서버는 실행 완료 후 종료합니다.

검사기는 의존성 설치 없이 Node 24의 타입 제거 기능으로 실행할 수 있습니다.

```sh
node scripts/validate-data.ts
node scripts/validate-data.ts --data-dir fixtures/sample-data --now 2026-10-22
node scripts/validate-data.ts --json
```

데이터 폴더 우선순위는 `--data-dir` → `GOMIN_DATA_DIR` → `data`입니다. 기본 기준일은 UTC의 오늘이며 `--now YYYY-MM-DD`로 고정할 수 있습니다. 앱 빌드 데이터는 `GOMIN_DATA_DIR`로 바꿉니다. PowerShell에서는 `$env:GOMIN_DATA_DIR = 'fixtures/sample-data'`를 설정한 터미널에서 실행합니다.

오류가 있으면 종료 코드 **1**, 경고만 있으면 **0**입니다. JSON 출력은 `now`, `summary`, `errors`, `warnings`, `stale`을 포함합니다. `summary`는 전체 수, 고민/구매처/그룹별 분포, Product 필드와 민감 정보 하위 필드의 null 수·비율, 미확인 필드가 있는 레코드 비율을 담습니다. 비율의 분모는 전체 제품 수이며 누락 필드를 null로 합산하지 않습니다.

검사는 스키마·ID·참조·그룹 순서·총량·단위가격·미확인 표시·URL·확인일·근거 길이·제한 표현을 확인합니다. 제한 표현의 정확한 목록과 공백 정규화 방식은 [forbidden.ts](scripts/lib/forbidden.ts)에 있습니다. 오래된 확인일, 다이소의 통상 가격 목록 밖 가격, 데이터가 없는 그룹을 포함한 소규모 그룹은 경고합니다. 자동 검사는 출처의 진실성이나 내용의 적법성을 대신 판정하지 않습니다.

단위가격은 `Math.round(price_krw * (volume_unit === 'ea' ? 1 : 10) / volume_value)`로 계산하며 양의 용량과 가격·단위가 확인되었을 때만 저장합니다. 단위가 다르면 단위가격을 직접 비교하지 않습니다.

## 데이터 갱신 절차

1. 사람이 허용된 공개 자료와 공식 설명을 확인합니다. 전성분·기능성 정보·가격 출처의 확인 범위를 구분합니다.
2. 관련 JSON을 수정하고 실제 확인일 `checked_at`, 짧은 근거, https 출처를 기록합니다. 가격·용량 미확인은 `null`과 해당 `unverified_fields`를 함께 기록합니다.
3. `npm run validate-data`로 오류와 경고를 검토한 뒤 `npm test -- --maxWorkers=1`, `npm run lint`, `npm run build`를 실행합니다.
4. 변경 내용과 출처를 PR에서 검토합니다. PR 작성·push 등 외부 전송은 사용자 승인 범위에서 진행합니다.

## CI/CD

- **CI:** main push·PR에서 lint → Vitest → 데이터 검사 → 빌드 → Chromium Playwright를 실행합니다. 실패 시 Playwright 리포트를 보관합니다.
- **Deploy Pages:** main push 또는 수동 실행으로 lint·테스트·데이터 검사·빌드 후 Pages 아티팩트를 배포합니다. `version.json`의 `commit`이 실행한 Git SHA와 같아질 때까지 제한 횟수로 재시도합니다. 수동 실행도 main 브랜치에서만 배포합니다.
- **Data freshness:** 매주 월요일 00:17 UTC(한국 09:17) 또는 수동 실행으로 검사 결과와 stale 목록을 로그·Step Summary에 출력합니다. 수집, 데이터 변경, 커밋, 이슈 생성은 하지 않습니다.

워크플로는 Node 24, `npm ci`, 전체 커밋 SHA로 고정한 액션, 최소 권한과 동시 실행 제한을 사용합니다. 배포 job에만 `pages: write`, `id-token: write`를 부여합니다. 현재 구성의 로컬 검증과 실제 GitHub 실행·배포 성공은 구분합니다. 승인 후 공개 절차는 [PUBLISH.md](docs/PUBLISH.md)를 따릅니다.

## 고지와 라이선스

이 사이트는 의료 조언을 제공하지 않습니다. 화장품에 관한 출처와 가격 비교를 돕는 정보이며 개인별 사용 결과를 보장하지 않습니다. 질환이나 지속되는 불편은 의료 전문가와 상담하세요. 출처의 표현도 그대로 옮기지 않고 근거 범위 안에서 간결하게 정리합니다.

가격·용량·구성·재고는 바뀔 수 있으므로 구매 전 판매처에서 재확인하세요. 다이소, 올리브영, 해당 브랜드와 제휴 관계가 없으며 제휴 링크를 사용하지 않습니다.

코드는 [MIT License](LICENSE), 저작권자는 **TaeYong (xoxo787), 2026**입니다. **MIT는 코드에만 적용합니다. `data/`의 제품명·가격·보도 내용 등 정보의 권리는 각 출처에 있습니다.** 이 저장소의 라이선스가 제3자 콘텐츠의 재사용 허가를 부여하지 않습니다.
