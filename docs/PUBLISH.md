# 승인 후 공개 절차 · 실행하지 않은 명령서

2026-10-22 사용자 승인(DECISIONS U-5)으로 첫 공개를 마쳤다. 결과는 맨 아래 "7. 공개 기록"에 있다. 다시 공개하거나 되돌릴 때도 **사용자가 해당 범위를 승인한 후에만** 아래 외부 공개 명령을 실행한다. GitHub CLI의 공식 로그인 절차를 사용하고 인증 정보를 파일이나 명령 출력으로 추출하지 않는다.

## 1. 사전 점검 — 공개하지 않음

프로젝트 루트에서 실행한다. Node 24를 사용하며 `npm ci`는 잠금 파일에 따른 패키지 다운로드이고 공개 게시 동작은 아니다. 브라우저 테스트는 한 번에 하나만 실행한다.

```sh
git status --short
git branch --show-current
npm ci
npm run lint
npm test -- --maxWorkers=1
npm run validate-data
npm run build
npx playwright install --with-deps chromium
npm run test:e2e
git status --short
```

`main` 브랜치이며 게시할 변경이 검토·커밋된 상태인지 확인한다. 오류와 비밀정보가 없는지 확인하고 경고는 사유를 검토한다. 커밋은 코디네이터가 담당한다. 아직 커밋되지 않은 변경이나 의도하지 않은 기존 원격이 있으면 아래 명령을 시작하지 않는다. README의 배포 전 표시는 실제 사이트 확인 후 별도 변경으로 갱신한다.

## 2. 공개 저장소 생성 — 외부 공개 행동

아래 명령은 GitHub에 공개 저장소를 만들고 로컬 `origin`을 추가한다. 아직 커밋을 전송하지는 않는다. 동일 저장소가 이미 존재하면 재생성하거나 삭제하지 말고 소유자·공개 범위와 원격을 확인한 뒤 기존 저장소 사용 여부를 결정한다.

```sh
gh repo create xoxo787/gomin-pick --public --source . --remote origin
```

## 3. main 전송 — 코드·데이터·문서 외부 공개 행동

아래 명령으로 커밋된 내용이 공개되고 CI와 Deploy Pages 워크플로가 시작된다.

```sh
git push -u origin main
```

## 4. Pages 소스 설정 — 외부 설정 변경·사이트 공개 행동

Pages 사이트가 아직 없을 때:

```sh
gh api -X POST repos/xoxo787/gomin-pick/pages -f build_type=workflow
```

이미 Pages 사이트가 존재하는 경우에만 위 POST 대신 다음 PUT을 사용한다. 다른 오류를 단순히 덮어쓰는 용도로 실행하지 않는다.

```sh
gh api -X PUT repos/xoxo787/gomin-pick/pages -f build_type=workflow
```

설정 전에 시작한 첫 배포가 실패할 수 있으므로, 설정 완료 후 다음 명령으로 main을 다시 배포한다. **이 명령도 외부 배포 행동**이다.

```sh
gh workflow run deploy.yml --ref main --repo xoxo787/gomin-pick
```

## 5. 실행·공개 버전 확인 — 외부 읽기만 수행

아래 명령으로 실행 목록에서 방금 요청한 main 배포를 선택해 끝까지 확인한다. CI 실행 결과도 함께 확인한다. `gh run watch` 자체는 새 배포를 시작하지 않는다.

```sh
gh run list --repo xoxo787/gomin-pick --branch main --limit 10
gh run watch --repo xoxo787/gomin-pick --exit-status
curl -fsS https://xoxo787.github.io/gomin-pick/version.json
git rev-parse HEAD
```

PowerShell에서 `curl`이 별칭이면 같은 조회를 `curl.exe -fsS https://xoxo787.github.io/gomin-pick/version.json`으로 실행한다. 응답의 `commit`과 `git rev-parse HEAD`가 일치해야 한다. 로컬 빌드의 `commit: "local"`은 공개 성공 증거가 아니다. 워크플로 자체도 동일 URL에서 실행 SHA 일치를 제한 횟수로 재시도하며 확인한다.

사이트 화면과 구매 링크 종류를 사람이 확인하고 실제 공개일·실행 URL·확인한 SHA를 기록한다. CI 성공, 배포 성공, 공개 응답 일치는 각각 확인해야 한다.

## 6. 문제 발생 시 되돌리기

게시 전 실패하면 원인을 수정하고 1단계부터 재검증한다. 원격·히스토리·사용자 파일을 삭제하거나 강제 push하지 않는다.

문제가 **마지막 커밋 하나**이며 이전 커밋이 정상 배포본일 때, 작업 트리가 깨끗한지 확인한 뒤 `git revert HEAD`로 되돌림 커밋을 만든다. 아래 `git push`는 **외부 코드 변경·재배포 행동이므로 해당 복구 범위의 승인을 받은 후** 실행한다.

```sh
git status --short
git log -5 --oneline
git revert HEAD
npm run lint
npm test -- --maxWorkers=1
npm run validate-data
npm run build
npm run test:e2e
git push origin main
gh run watch --repo xoxo787/gomin-pick --exit-status
curl -fsS https://xoxo787.github.io/gomin-pick/version.json
git rev-parse HEAD
```

되돌림 커밋의 SHA와 공개 응답을 비교한다. 여러 커밋이 원인이면 임의로 `HEAD`만 되돌리지 말고 대상 범위를 검토한다. 첫 공개라 이전 정상 배포본이 없는 경우 사이트 비공개 전환이나 Pages 제거는 별도 승인 대상이다. 공개 취소가 이미 복제된 자료의 회수를 보장하지 않는다.

## 7. 공개 기록

| 항목 | 내용 |
| --- | --- |
| 공개일 | 2026-10-22 (사용자 승인 U-5) |
| 저장소 | https://github.com/xoxo787/gomin-pick (public) |
| 사이트 | https://xoxo787.github.io/gomin-pick/ |
| 첫 공개 SHA | `cfcc2d1bd4fe9711f8c649de09af3bffcbaef374` |
| CI | 성공 — https://github.com/xoxo787/gomin-pick/actions/runs/39785961233 |
| Deploy Pages | 성공(build·deploy) — https://github.com/xoxo787/gomin-pick/actions/runs/39785961250 |
| 공개 응답 | `version.json`의 `commit`이 위 SHA와 일치, `products: 27` |
| 화면 확인 | 1280px·375px에서 콘솔 메시지 0, 외부 리소스 요청 0, 가로 넘침 0 |

Pages 설정(POST)이 push로 시작된 첫 배포의 배포 단계보다 먼저 끝나 첫 배포가 성공했다. 그래서 4단계의 `gh workflow run deploy.yml` 재실행은 하지 않았다.
