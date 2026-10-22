# 검사 전용 픽스처

이 폴더의 제품·출처는 형식 검사를 위한 가상 데이터다. 실제 서비스 데이터나 근거로 사용하지 않는다.

- `valid/`: 오류가 없는 기준 데이터. 비어 있는 고민 그룹은 경고로 남는다.
- `invalid-schema/`: `name` 필드가 빠져 CLI 종료 코드 1을 확인할 수 있는 완전한 데이터 폴더.
- `invalid-cases.json`: 기준 데이터에 적용할 수정 목록과 기대 오류 코드. `edits`는 경로별 대체/필드 누락을, `copies`는 그룹·총량 초과를 재현한다. 각 항목은 별도 실패 픽스처이며 테스트가 고유 임시 폴더에 JSON 세 파일로 구체화하고 실제 CLI 종료 코드까지 검사한다.

검증 기준일은 `2026-10-22`로 고정한다. 날짜 경계와 반올림·null 처리는 테스트에서 기준 데이터의 사본으로 검증한다. 임시 폴더는 자동 삭제하지 않는다.

```sh
node scripts/validate-data.ts --data-dir scripts/__tests__/fixtures/valid --now 2026-10-22
node scripts/validate-data.ts --data-dir scripts/__tests__/fixtures/invalid-schema --now 2026-10-22
npm test -- scripts/__tests__/validate-data.test.ts
```
