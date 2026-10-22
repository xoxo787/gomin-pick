# 데이터 출처와 조사 기록

확인일: **2026-10-22 (한국시간)**. 데이터는 고민 7개, 성분 분류 13개, 제품 27개다. 가격·용량은 각 레코드의 `source_urls`를 통해 재확인할 수 있으며, 확인하지 못한 값은 `null` 또는 빈 배열과 `unverified_fields`로 남겼다.

## 선정 범위와 순서의 의미

올리브영은 2025 어워즈 근거를 우선하고, 부족한 고민은 CJ 공식 기업 사이트의 베스트셀러·판매 안내로 보완했다. 다이소는 공개 언론의 판매·재입고·품절 보도를 사용했다. 브랜드 전체 판매량만 확인된 미모의 일부 품목은 제품별 판매순위가 아님을 레코드에 명시했다.

`rank_in_group`은 이 사이트가 근거를 정리한 표시 순서다. 공식 전체 판매 순위나 피부 적합성 점수가 아니다. 어워즈 부문을 7개 고민으로 연결하는 판단도 자체 큐레이션이며, 각 제품의 `evidence`에 표시했다. 한 제품은 대표 고민 한 곳에만 배정했다.

| 고민 | 다이소 | 올리브영 |
| --- | ---: | ---: |
| 보습 | 3 | 3 |
| 진정·민감 | 1 | 3 |
| 트러블 | 2 | 1 |
| 미백·잡티 | 2 | 2 |
| 주름·탄력 | 2 | 1 |
| 모공·피지 | 3 | 1 |
| 자외선 차단 | 1 | 2 |
| 합계 | 14 | 13 |

14개 그룹 모두 1개 이상이며 최대 3개다. 그룹당 3개 이상은 4개 그룹에서 충족했다. 10개 그룹의 부족분은 근거가 약한 제품으로 채우지 않았다.

## 2026 어워즈 발표 확인

먼저 CJ 공식 뉴스룸과 공개 검색 결과에서 “2026 올리브영 어워즈” 발표를 확인했다. 이번 조사에서는 2026년 수상 결과 발표를 찾지 못했다. 이는 발표가 존재하지 않는다는 단정이 아니다. 최신으로 확인된 것은 2025-11-28 발표한 **2025 올리브영 어워즈**다.

CJ 공식 자료의 약 1.8억건은 2024-07-01~2025-06-30 구매 데이터이며, 40개 부문·166개 상품이라는 전체 선정 설명이다. 이 프로젝트가 수집한 제품 수나 현재 인기 순위가 아니다. 실제 부문별 1위 품목은 이를 다룬 언론 기사로 보완했다.

## 값의 해석과 계산

- 올리브영 제품의 알려진 가격은 브랜드 공식몰 **정가**다. 모든 해당 레코드에 “브랜드 공식몰 정가 기준, 올리브영 판매가와 다를 수 있음”을 표시했다. 할인·쿠폰·배송비는 반영하지 않는다.
- 다이소 가격은 1,000/2,000/3,000/5,000원 균일가 구조를 전제로 참고하되, 구조만으로 개별 가격을 만들어 넣지 않았다. 듀이트리 기사는 5천원대라고만 적어 가격을 `null`로 남겼다. 다른 다이소 가격은 보도 시점 값이므로 현재 판매가·재고를 보증하지 않는다.
- 액상은 `Math.round(가격 × 10 / 총 ml)`, 중량은 `Math.round(가격 × 10 / 총 g)`, 장수·개수는 `Math.round(가격 / 개수)`다. 필요한 값이 하나라도 없으면 단위가격도 `null`이다.
- VT 2ml×6은 12ml, 메디필 4ml×4는 16ml, 구달 50ml×2는 100ml로 합산했다. 토리든 시트 마스크와 메디힐 패드는 각각 10매·100매로 기록하고 매당 가격을 계산했다. 본셉 혼합 키트는 고형·액상을 임의 환산하지 않았다.
- 토리든 가격·용량은 현행 NEW 대표 옵션이다. 2025 수상 제품과 현재 제품의 처방·기획 구성 동일성은 미확인이다. 구달 단품·브랜드 기획도 어워즈 증정 구성과 구분했다.
- `functional`은 원료가 식약처 고시에 수재됐다는 뜻이며, 그 원료가 들어간 모든 제품의 기능성 확인을 뜻하지 않는다. `functional_cosmetic`은 해당 완제품 공식 상품정보에서 확인했을 때만 채웠다. 성분 존재만으로 기능성이나 피부 타입을 추정하지 않았다.
- 식약처 고시 제2025-89호 전문 PDF의 별표 2에서 나이아신아마이드, 별표 3에서 레티놀·아데노신, 별표 4에서 징크옥사이드·티타늄디옥사이드, 별표 8에서 살리실릭애씨드를 확인했다. 원료 시험의 순도 수치를 완제품 배합 함량으로 옮기지 않아 `functional.limit`는 모두 `null`이다.
- 히알루론산계는 검색 편의를 위한 성분군이다. 염·가수분해형 등을 묶으므로 `name_inci=null`이며 단일 화학물질의 동의어 목록으로 해석하면 안 된다.
- `sensitive`는 공식 전성분 표시를 직접 읽은 제품만 판단했다. 에탄올에는 에탄올·변성알코올 표기를 포함하고, 글리콜·지방알코올은 동일시하지 않는다. 메디필은 향료 표기를 확인했고, 에스트라는 해당 전성분 목록에 향료·에탄올 표기가 없었다. 메디힐 패드는 방향성 식물 오일이 있어 향료 판단을 보류했다. `false`는 해당 목록에서 표기를 찾지 못했다는 뜻이며 피부 반응을 예측하지 않는다.

## 출처 목록

모든 행의 확인일은 **2026-10-22**다. 본문 접근 실패와 검색 발췌 사용은 별도로 표시했다.

| 출처명 | URL | 무엇을 확인했는지 |
| --- | --- | --- |
| CJ 뉴스룸 — 2025 올리브영 어워즈 발표 | [원문](https://cjnews.cj.net/%EB%AA%A8%EB%91%90%EA%B0%80-%EC%82%AC%EB%9E%91%ED%95%9C-%EC%A0%9C%ED%92%88%EC%9D%84-%EB%AA%A8%EB%91%90%EA%B0%80-%EC%82%AC%EB%9E%91%ED%95%A0-%ED%98%9C%ED%83%9D%EC%9C%BC%EB%A1%9C-cj/) | 2025-11-28 발표, 구매 데이터 약 1.8억건·40개 부문·166개 상품, 집계 기간 |
| 인사이트 — 2025 어워즈 부문별 1위 | [원문](https://www.insight.co.kr/news/535111) | 직접 본문 확인: 토리든 세럼·에스트라 크림·메디힐 패드·라운드랩 선크림·독도 토너의 해당 부문 1위; 2025-12-24 |
| 하이뉴스 — 토리든 산리오 에디션 | [원문](https://www.hinews.co.kr/view.php?ud=2026083114392933949aeda69934_48) | 직접 본문 확인: 다이브인 마스크 자체의 2025 마스크팩 부문 1위; 2026-08-31 |
| 식약처 — 기능성화장품 기준 및 시험방법 전문 PDF | [원문](https://www.mfds.go.kr/brd/m_211/down.do?brd_id=data0005&seq=14959&data_tp=A&file_seq=2) | 고시 제2025-89호(2025-12-16), 별표 2·3·4·8 원료명 |
| 머니투데이/다음 — 다이소 뷰티 인기 보도 | [원문](https://v.daum.net/v/GWn9SZDxvy) | 2025년 상반기 매출·재입고 요청 순위와 VT·메디필·본셉·닥터오라클·마데카21의 보도 가격 |
| 매경헬스 — 다이소 화장품 가격 구조 | [원문](https://www.mkhealth.co.kr/news/articleView.html?idxno=72330) | 미모 5종의 개별 가격·용량, 본셉 레티놀 품절 사례 |
| 시사저널e/다음 — 다이소와 넥스트 K뷰티 | [원문](https://v.daum.net/v/20260424105404065) | 미모 브랜드 판매량, 리퀴드 마스크의 2ml×6·3,000원 및 품절 사례 |
| 아모레퍼시픽 공식 스토리 — 미모 신제품 | [원문](https://stories.amorepacific.com/%EC%95%84%EB%AA%A8%EB%A0%88%ED%8D%BC%EC%8B%9C%ED%94%BD-%EB%AF%B8%EB%AA%A8-%EB%B0%94%EC%9D%B4-%EB%A7%88%EB%AA%BD%EB%93%9C-%EC%88%98%EB%B6%84-%EB%B0%8F-%ED%81%B4%EB%A0%8C%EC%A7%95-%EC%8B%A0%EC%A0%9C/) | 신제품 라인 설명만 확인; 기존 등록 3개 제품의 개별 성분 근거로 쓸 수 없어 해당 source_urls에서 제거 |
| 이투데이 — CNP 바이 오디-티디 판매 | [원문](https://www.etoday.co.kr/news/view/2475415) | 브랜드 100만개 및 스팟 카밍 젤 개별 품절 보도 |
| 그린포스트코리아 — CNP 스팟 카밍 젤 | [원문](https://www.greenpostkorea.co.kr/news/articleView.html?idxno=222294) | 검색 도구의 기사 본문 발췌에서 10ml·5,000원 확인; 페이지 재열기는 도구 오류 |
| 데일리안 — 토니모리 유통망 다각화 | [원문](https://www.dailian.co.kr/news/view/1361825) | 본셉 레티놀 2500IU 제품의 5,000원·품절 보도; 정확한 용량은 미확인 |
| 키즈맘/다음 — VT 2차 라인 출시 | [원문](https://v.daum.net/v/20240722150401545) | 기존 리들샷 100·300 각각 2ml×6·3,000원; 일반몰 50ml와 구분 |
| 한국섬유신문 — 뷰티 유통 경쟁 | [원문](https://www.ktnews.com/news/articleView.html?idxno=142500) | 마데카21 테카 솔루션 크림·토너 인기 제품명 교차 확인 |
| 로이슈 — 듀이트리 다이소 품절 | [원문](https://www.lawissue.co.kr/view.php?ud=202504180916196533204ead0791_12) | 핑크 톤업 선 인기와 다이소 유통 확인; 가격은 ‘5천원대’여서 정확한 정가로 채택하지 않음 |
| 메디필 공식몰 — 다이소 전용 랩핑 마스크 | [원문](https://medipeel.co.kr/product/%EB%8B%A4%EC%9D%B4%EC%86%8C-%EC%A0%84%EC%9A%A9-%EC%97%91%EC%8A%A4%ED%8A%B8%EB%9D%BC-%EC%8A%88%ED%8D%BC-9-%ED%94%8C%EB%9F%AC%EC%8A%A4-%EB%AC%BC%EA%B4%91-%EB%A6%AC%ED%94%84%ED%8C%85-%EB%9E%A9%ED%95%91-%EB%A7%88%EC%8A%A4%ED%81%AC4ml4ea/3299/) | 4ml×4, 미백·주름 2중 기능성 및 전성분; 2,500원 배송비를 제품 가격으로 사용하지 않음 |
| 토리든 공식몰 — 세럼 | [원문](https://www.torriden.com/goods/goods_view.php?goodsNo=2268) | 현행 NEW 50ml 단품 정가 22,000원; 할인가 제외 |
| 토리든 공식몰 — 마스크 | [원문](https://www.torriden.com/goods/goods_view.php?goodsNo=2270) | 현행 NEW 27ml 10매 정가 30,000원; 개당 단위가격 사용 |
| 에스트라 공식몰 — 아토베리어365 | [원문](https://www.aestura.com/m/product/view.do?prdSeq=1021&searchText=365) | 80ml·전성분·건조하고 민감한 피부 설명; 정가 미확인 |
| 메디힐 공식몰 — 마데카소사이드 패드 | [원문](https://www.medihealshop.com/product/%EB%A7%88%EB%8D%B0%EC%B9%B4%EC%86%8C%EC%82%AC%EC%9D%B4%EB%93%9C-%ED%9D%94%EC%A0%81-%ED%86%A0%EB%84%88%ED%8C%A8%EB%93%9C-100%EB%A7%A4/1710/category/1/display/3/?icid=MAIN.product_listmain_2) | 100매 정가 26,000원, 미백 기능성, 전성분 |
| 메디힐 공식몰 첫 화면 | [원문](https://www.medihealshop.com/) | 100ml 세럼 정가 45,000원과 2026-03-20 10시 올리브영 판매 1위 안내; 연간 순위 아님 |
| CJ 공식 기업 사이트 — 바이오힐 보 | [원문](https://corp.oliveyoung.com/ko/business/brand/boh) | 베스트셀러·미스트 누적 판매·민감 피부 안내·판테놀; 크림 매출은 기존/3D 제품 합산 |
| CJ 공식 기업 사이트 — 브링그린 | [원문](https://corp.oliveyoung.com/ko/business/brand/bringgreen) | 25ml 세럼 누적 판매 기준·한정 범위 매출 1위·토너 누적 판매·민감 피부 안내 |
| 클럽클리오 공식몰 — 구달 세럼 | [원문](https://clubclio.co.kr/shop/goodsView/0000003511) | 30ml 단품 정가 28,000원; 기획·증정 구성과 구분 |
| 한국섬유신문 — 구달 어워즈 7년 연속 수상 | [원문](https://www.ktnews.com/news/articleView.html?idxno=142597) | 검색 발췌: 2025 세럼·선크림 수상 명시, 순위 미공개; 2025-11-28, 원문 열기 403 |
| 클럽클리오 공식몰 — 구달 선크림 | [원문](https://clubclio.co.kr/shop/goodsView/0000007115) | 50ml 1+1 기획 정가 22,000원, 총 100ml |
| 라운드랩 공식몰 — 자작나무 선크림 | [원문](https://roundlab.co.kr/product/%EC%9E%90%EC%9E%91%EB%82%98%EB%AC%B4-%EC%88%98%EB%B6%84-%EC%84%A0%ED%81%AC%EB%A6%BC-50ml/138/) | 50ml 정가 25,000원; 할인 판매가 제외 |
| 라운드랩 공식몰 — 1025 독도 토너 | [원문](https://roundlab.co.kr/product/1025-%EB%8F%85%EB%8F%84-%ED%86%A0%EB%84%88-200ml/22/) | 직접 본문 확인: 200ml 정가 15,000원; 할인가·배송비 제외 |
| 다이소몰 robots.txt | [원문](https://www.daisomall.co.kr/robots.txt) | 일반 봇 허용 경로와 Crawl-delay 30 |
| 다이소몰 공개 첫 화면 | [원문](https://www.daisomall.co.kr/ds) | 공식 검색 URL 템플릿과 이용약관 버튼 확인; 약관 본문은 HTML에 없음 |

식약처 고시의 [게시물](https://www.mfds.go.kr/brd/m_211/view.do?seq=14959)은 공식 목록의 링크로 식별했고, 원료 확인에는 실제 내려받은 PDF를 사용했다. PDF 텍스트 변환에서 객체 참조 경고가 있었으나 해당 별표의 원료명과 제목은 추출된 본문에서 확인했다.

## 토리든 마스크 수상 근거 재확인

메인의 최초 표본 검수는 10개 중 9개 일치였고, 마스크 1개는 수상 근거를 재확인하도록 요청됐다. CJ 전체 발표와 인사이트의 세럼 수상 내용을 마스크에 적용하지 않았다. 하이뉴스 2026-08-31 원문에서 다음 구절을 직접 확인해 마스크 레코드를 유지하고 `rank_basis`를 이 기사로 교체했다.

> ‘2025 올리브영 어워즈’ 마스크팩 부문 1위에 오른 ‘다이브인 저분자 히알루론산 마스크’

출처: [하이뉴스 — 토리든 산리오캐릭터즈 에디션](https://www.hinews.co.kr/view.php?ud=2026083114392933949aeda69934_48). 인용은 51자다. 해당 기사의 한정판 10+1 구성은 저장된 공식몰 NEW 27ml 10매 옵션의 가격·구성 근거로 사용하지 않았다. 수상 시점과 현행 옵션의 처방 동일성은 미확인이다.

패션비즈 2025-11-28 [3개 부문 수상 기사](https://fashionbiz.co.kr/article/221827)도 검색 발췌에서 마스크 1위를 언급하지만 원문 열기는 403이었다. 이 보조 단서는 제품의 `source_urls`에 넣지 않았다.

## 레코드별 주장과 근거

확인일은 모든 행 **2026-10-22**다. “직접 확인”은 원문 본문을 읽었다는 뜻이며 검색 도구의 캐시가 포함될 수 있다. “1차 보관 본문”은 같은 날 최초 조사에서 읽고 보관한 내용, “재작업”은 이번 후속 검토에서 읽은 내용이다. “검색 발췌”는 검색 결과에 제공된 텍스트만 확인했으며 원문 전체를 직접 읽었다고 주장하지 않는다. 표의 보조 출처는 해당 제품의 가격·용량·개별 순위 근거가 아니다.

제품 27개 모두 아래 표에 있다. `source_urls`의 각 URL을 주장 또는 보조 역할에 연결했다. 미확인 필드는 근거가 없으므로 비워 두었다. 고민 배정·그룹 내 표시 순서는 모든 레코드에서 자체 큐레이션이고, 단위가격은 확인된 가격·대표 용량으로 계산한 값이므로 별도의 외부 주장으로 취급하지 않는다. 핵심 성분이 공식 제품명에서만 확인된 경우 전성분 확인과 구분했다.

| 레코드 id | 주장·확인한 값 | 근거 URL | 확인 방식·범위 |
| --- | --- | --- | --- |
| `daiso-mimo-rosy-hyalon-liquid-mask` | 3,000원 / 12ml (2ml×6) | [근거](https://www.mkhealth.co.kr/news/articleView.html?idxno=72330) | 직접 확인(1차 보관 본문); 개별 가격·구성 확인; 재열기 403으로 1차 저장 HTML 대조 |
| `daiso-mimo-rosy-hyalon-liquid-mask` | 리퀴드 마스크 품절·3,000원·2ml×6 | [근거](https://v.daum.net/v/20260424105404065) | 직접 확인(재작업); 브랜드 전체 실적을 개별 상품 순위로 사용하지 않음 |
| `daiso-mimo-rosy-hyalon-liquid-mask` | 핵심 성분·완제품 기능성·향료·에탄올·피부 타입 미확인 | — | 미확인; null 또는 빈 배열 유지; 존재·부재를 주장하지 않음 |
| `daiso-mimo-rosy-hyalon-moisture-ampoule` | 5,000원 / 50ml | [근거](https://www.mkhealth.co.kr/news/articleView.html?idxno=72330) | 직접 확인(1차 보관 본문); 개별 가격·구성 확인; 재열기 403으로 1차 저장 HTML 대조 |
| `daiso-mimo-rosy-hyalon-moisture-ampoule` | 브랜드 누적 100만개 보도; 이 품목의 개별 판매순위 미공개 | [근거](https://v.daum.net/v/20260424105404065) | 직접 확인(재작업); 브랜드 전체 실적을 개별 상품 순위로 사용하지 않음 |
| `daiso-mimo-rosy-hyalon-moisture-ampoule` | 핵심 성분·완제품 기능성·향료·에탄올·피부 타입 미확인 | — | 미확인; null 또는 빈 배열 유지; 존재·부재를 주장하지 않음 |
| `daiso-mimo-rosy-hyalon-moisture-cream` | 5,000원 / 60ml | [근거](https://www.mkhealth.co.kr/news/articleView.html?idxno=72330) | 직접 확인(1차 보관 본문); 개별 가격·구성 확인; 재열기 403으로 1차 저장 HTML 대조 |
| `daiso-mimo-rosy-hyalon-moisture-cream` | 브랜드 누적 100만개 보도; 이 품목의 개별 판매순위 미공개 | [근거](https://v.daum.net/v/20260424105404065) | 직접 확인(재작업); 브랜드 전체 실적을 개별 상품 순위로 사용하지 않음 |
| `daiso-mimo-rosy-hyalon-moisture-cream` | 핵심 성분·완제품 기능성·향료·에탄올·피부 타입 미확인 | — | 미확인; null 또는 빈 배열 유지; 존재·부재를 주장하지 않음 |
| `daiso-madeca21-teca-soothing-mist-toner` | 5,000원 / 200ml / 2025년 상반기 재입고 요청 3위 | [근거](https://v.daum.net/v/GWn9SZDxvy) | 직접 확인(재작업); 기사의 제품명 오기는 아래 교차 자료로 대조 |
| `daiso-madeca21-teca-soothing-mist-toner` | 테카 솔루션 제품명·라인 확인 | [근거](https://www.ktnews.com/news/articleView.html?idxno=142500) | 검색 발췌; 보조 출처; 이 기사의 가격·용량은 채택하지 않음 |
| `daiso-madeca21-teca-soothing-mist-toner` | 핵심 성분·완제품 기능성·향료·에탄올·피부 타입 미확인 | — | 미확인; null 또는 빈 배열 유지; 존재·부재를 주장하지 않음 |
| `daiso-cnp-od-td-spot-calming-gel` | 5,000원 / 10ml | [근거](https://www.greenpostkorea.co.kr/news/articleView.html?idxno=222294) | 검색 발췌; 기사 검색 발췌에서 확인; 본문 다시 열기는 도구 오류 |
| `daiso-cnp-od-td-spot-calming-gel` | 스팟 카밍 젤 품절 사례와 브랜드 100만개 판매 | [근거](https://www.etoday.co.kr/news/view/2475415) | 직접 확인(재작업); 브랜드 누적 판매량과 개별 젤 품절을 구분 |
| `daiso-cnp-od-td-spot-calming-gel` | 핵심 성분·완제품 기능성·향료·에탄올·피부 타입 미확인 | — | 미확인; null 또는 빈 배열 유지; 존재·부재를 주장하지 않음 |
| `daiso-mimo-peony-tinol-trouble-balm` | 3,000원 / 10ml | [근거](https://www.mkhealth.co.kr/news/articleView.html?idxno=72330) | 직접 확인(1차 보관 본문); 개별 가격·구성 확인; 재열기 403으로 1차 저장 HTML 대조 |
| `daiso-mimo-peony-tinol-trouble-balm` | 브랜드 누적 100만개 보도; 이 품목의 개별 판매순위 미공개 | [근거](https://v.daum.net/v/20260424105404065) | 직접 확인(재작업); 브랜드 전체 실적을 개별 상품 순위로 사용하지 않음 |
| `daiso-mimo-peony-tinol-trouble-balm` | 핵심 성분·완제품 기능성·향료·에탄올·피부 타입 미확인 | — | 미확인; null 또는 빈 배열 유지; 존재·부재를 주장하지 않음 |
| `daiso-boncept-vitac-double-shot-kit` | 5,000원 / 2025년 상반기 재입고 요청 1위 | [근거](https://v.daum.net/v/GWn9SZDxvy) | 직접 확인(재작업); 고형·액상 혼합 키트 총용량은 미확인 |
| `daiso-boncept-vitac-double-shot-kit` | 용량·핵심 성분·완제품 기능성·향료·에탄올·피부 타입 미확인 | — | 미확인; null 또는 빈 배열 유지; 존재·부재를 주장하지 않음 |
| `daiso-droracle-curesona-radiance-glow-ampoule` | 5,000원 / 40ml / 2025년 상반기 재입고 요청 2위 | [근거](https://v.daum.net/v/GWn9SZDxvy) | 직접 확인(재작업) |
| `daiso-droracle-curesona-radiance-glow-ampoule` | 핵심 성분·완제품 기능성·향료·에탄올·피부 타입 미확인 | — | 미확인; null 또는 빈 배열 유지; 존재·부재를 주장하지 않음 |
| `daiso-medipeel-extra-super9-wrapping-mask` | 3,000원 / 2025년 상반기 다이소몰 매출 6위 | [근거](https://v.daum.net/v/GWn9SZDxvy) | 직접 확인(재작업) |
| `daiso-medipeel-extra-super9-wrapping-mask` | 4ml×4=16ml; 나이아신아마이드·아데노신·판테놀·소듐하이알루로네이트·병풀·알란토인; 미백·주름 2중 기능성; 향료 표기, 에탄올 표기 없음 | [근거](https://medipeel.co.kr/product/%EB%8B%A4%EC%9D%B4%EC%86%8C-%EC%A0%84%EC%9A%A9-%EC%97%91%EC%8A%A4%ED%8A%B8%EB%9D%BC-%EC%8A%88%ED%8D%BC-9-%ED%94%8C%EB%9F%AC%EC%8A%A4-%EB%AC%BC%EA%B4%91-%EB%A6%AC%ED%94%84%ED%8C%85-%EB%9E%A9%ED%95%91-%EB%A7%88%EC%8A%A4%ED%81%AC4ml4ea/3299/) | 직접 확인(재작업); 다이소 전용 상품정보·전성분; 70ml 일반몰 제품과 구분 |
| `daiso-medipeel-extra-super9-wrapping-mask` | 피부 타입 미확인 | — | 미확인; null 또는 빈 배열 유지; 존재·부재를 주장하지 않음 |
| `daiso-boncept-retinol-2500-wrinkle-shot` | 5,000원 / 레티놀 2500IU 제품의 품절 / 레티놀 명시 | [근거](https://www.dailian.co.kr/news/view/1361825) | 직접 확인(1차 보관 본문); 기사의 기능성 언급은 있으나 완제품 공식 확인이 없어 functional_cosmetic=null 유지 |
| `daiso-boncept-retinol-2500-wrinkle-shot` | 용량·완제품 기능성·향료·에탄올·피부 타입 미확인 | — | 미확인; null 또는 빈 배열 유지; 존재·부재를 주장하지 않음 |
| `daiso-vt-reedle-shot-100` | 3,000원 / 2025년 상반기 다이소몰 매출 1위 | [근거](https://v.daum.net/v/GWn9SZDxvy) | 직접 확인(재작업) |
| `daiso-vt-reedle-shot-100` | 2ml×6=12ml | [근거](https://v.daum.net/v/20240722150401545) | 직접 확인(1차 보관 본문); 다이소 100·300 각각의 구성; 일반몰 대용량 제외 |
| `daiso-vt-reedle-shot-100` | 핵심 성분·완제품 기능성·향료·에탄올·피부 타입 미확인 | — | 미확인; null 또는 빈 배열 유지; 존재·부재를 주장하지 않음 |
| `daiso-vt-reedle-shot-300` | 3,000원 / 2025년 상반기 다이소몰 매출 3위 | [근거](https://v.daum.net/v/GWn9SZDxvy) | 직접 확인(재작업) |
| `daiso-vt-reedle-shot-300` | 2ml×6=12ml | [근거](https://v.daum.net/v/20240722150401545) | 직접 확인(1차 보관 본문); 다이소 100·300 각각의 구성; 일반몰 대용량 제외 |
| `daiso-vt-reedle-shot-300` | 핵심 성분·완제품 기능성·향료·에탄올·피부 타입 미확인 | — | 미확인; null 또는 빈 배열 유지; 존재·부재를 주장하지 않음 |
| `daiso-mimo-peony-tinol-pore-ampoule` | 5,000원 / 50ml | [근거](https://www.mkhealth.co.kr/news/articleView.html?idxno=72330) | 직접 확인(1차 보관 본문); 개별 가격·구성 확인; 재열기 403으로 1차 저장 HTML 대조 |
| `daiso-mimo-peony-tinol-pore-ampoule` | 브랜드 누적 100만개 보도; 이 품목의 개별 판매순위 미공개 | [근거](https://v.daum.net/v/20260424105404065) | 직접 확인(재작업); 브랜드 전체 실적을 개별 상품 순위로 사용하지 않음 |
| `daiso-mimo-peony-tinol-pore-ampoule` | 핵심 성분·완제품 기능성·향료·에탄올·피부 타입 미확인 | — | 미확인; null 또는 빈 배열 유지; 존재·부재를 주장하지 않음 |
| `daiso-dewytree-tone-up-shade-pink-sun` | 다이소 핑크 톤업 선 인기·품절 | [근거](https://www.lawissue.co.kr/view.php?ud=202504180916196533204ead0791_12) | 직접 확인(1차 보관 본문); 5천원대 표기는 정확한 가격으로 채택하지 않음; 용량 미확인 |
| `daiso-dewytree-tone-up-shade-pink-sun` | 가격·용량·핵심 성분·완제품 기능성·향료·에탄올·피부 타입 미확인 | — | 미확인; null 또는 빈 배열 유지; 존재·부재를 주장하지 않음 |
| `oliveyoung-torriden-dive-in-serum-50` | 정가 22,000원 / NEW 50ml 단품 / 공식 제품명에 히알루론산 | [근거](https://www.torriden.com/goods/goods_view.php?goodsNo=2268) | 직접 확인(1차 보관 본문); 본문은 검색 도구 캐시; 전체 전성분은 미확인 |
| `oliveyoung-torriden-dive-in-serum-50` | 2025 어워즈 세럼 부문 1위 | [근거](https://www.insight.co.kr/news/535111) | 직접 확인(재작업) |
| `oliveyoung-torriden-dive-in-serum-50` | 보조 출처: 어워즈 전체 집계 방식·규모 | [근거](https://cjnews.cj.net/%EB%AA%A8%EB%91%90%EA%B0%80-%EC%82%AC%EB%9E%91%ED%95%9C-%EC%A0%9C%ED%92%88%EC%9D%84-%EB%AA%A8%EB%91%90%EA%B0%80-%EC%82%AC%EB%9E%91%ED%95%A0-%ED%98%9C%ED%83%9D%EC%9C%BC%EB%A1%9C-cj/) | 직접 확인(1차 보관 본문); 개별 수상·가격·용량 증거 아님 |
| `oliveyoung-torriden-dive-in-serum-50` | 완제품 기능성·향료·에탄올·피부 타입 미확인 | — | 미확인; null 또는 빈 배열 유지; 존재·부재를 주장하지 않음 |
| `oliveyoung-aestura-atobarrier365-cream-80` | 80ml; 세라마이드NP·글리세린·나이아신아마이드·알란토인; 전성분에 향료·에탄올 표기 없음; 건조·민감 피부 설명 | [근거](https://www.aestura.com/m/product/view.do?prdSeq=1021&searchText=365) | 직접 확인(재작업); 정가 미확인 |
| `oliveyoung-aestura-atobarrier365-cream-80` | 2025 어워즈 크림 부문 1위 | [근거](https://www.insight.co.kr/news/535111) | 직접 확인(재작업) |
| `oliveyoung-aestura-atobarrier365-cream-80` | 보조 출처: 어워즈 전체 집계 방식·규모 | [근거](https://cjnews.cj.net/%EB%AA%A8%EB%91%90%EA%B0%80-%EC%82%AC%EB%9E%91%ED%95%9C-%EC%A0%9C%ED%92%88%EC%9D%84-%EB%AA%A8%EB%91%90%EA%B0%80-%EC%82%AC%EB%9E%91%ED%95%A0-%ED%98%9C%ED%83%9D%EC%9C%BC%EB%A1%9C-cj/) | 직접 확인(1차 보관 본문); 개별 수상·가격·용량 증거 아님 |
| `oliveyoung-aestura-atobarrier365-cream-80` | 가격·완제품 기능성 미확인 | — | 미확인; null 또는 빈 배열 유지; 존재·부재를 주장하지 않음 |
| `oliveyoung-torriden-dive-in-mask-10` | 정가 30,000원 / NEW 27ml 10매 / 공식 제품명에 히알루론산 | [근거](https://www.torriden.com/goods/goods_view.php?goodsNo=2270) | 직접 확인(1차 보관 본문); 10매 단위; 보도 속 증정 구성과 구분; 본문은 검색 도구 캐시 |
| `oliveyoung-torriden-dive-in-mask-10` | 다이브인 저분자 히알루론산 마스크 자체의 2025 어워즈 마스크팩 부문 1위 | [근거](https://www.hinews.co.kr/view.php?ud=2026083114392933949aeda69934_48) | 직접 확인(재작업); 세럼 수상을 전용하지 않음; 기사 발표일 2026-08-31 |
| `oliveyoung-torriden-dive-in-mask-10` | 보조 출처: 어워즈 전체 집계 방식·규모 | [근거](https://cjnews.cj.net/%EB%AA%A8%EB%91%90%EA%B0%80-%EC%82%AC%EB%9E%91%ED%95%9C-%EC%A0%9C%ED%92%88%EC%9D%84-%EB%AA%A8%EB%91%90%EA%B0%80-%EC%82%AC%EB%9E%91%ED%95%A0-%ED%98%9C%ED%83%9D%EC%9C%BC%EB%A1%9C-cj/) | 직접 확인(1차 보관 본문); 개별 수상·가격·용량 증거 아님 |
| `oliveyoung-torriden-dive-in-mask-10` | 완제품 기능성·향료·에탄올·피부 타입 미확인 | — | 미확인; null 또는 빈 배열 유지; 존재·부재를 주장하지 않음 |
| `oliveyoung-mediheal-madecassoside-pad-100` | 정가 26,000원 / 100매; 마데카소사이드·병풀·나이아신아마이드·글리세린·알란토인; 미백 기능성; 전성분에 에탄올 표기 없음 | [근거](https://www.medihealshop.com/product/%EB%A7%88%EB%8D%B0%EC%B9%B4%EC%86%8C%EC%82%AC%EC%9D%B4%EB%93%9C-%ED%9D%94%EC%A0%81-%ED%86%A0%EB%84%88%ED%8C%A8%EB%93%9C-100%EB%A7%A4/1710/category/1/display/3/?icid=MAIN.product_listmain_2) | 직접 확인(1차 보관 본문); 100매/170ml 중 장수를 대표 단위로 채택; 방향성 오일로 fragrance=null 유지 |
| `oliveyoung-mediheal-madecassoside-pad-100` | 2025 어워즈 패드 부문 1위 | [근거](https://www.insight.co.kr/news/535111) | 직접 확인(재작업) |
| `oliveyoung-mediheal-madecassoside-pad-100` | 보조 출처: 어워즈 전체 집계 방식·규모 | [근거](https://cjnews.cj.net/%EB%AA%A8%EB%91%90%EA%B0%80-%EC%82%AC%EB%9E%91%ED%95%9C-%EC%A0%9C%ED%92%88%EC%9D%84-%EB%AA%A8%EB%91%90%EA%B0%80-%EC%82%AC%EB%9E%91%ED%95%A0-%ED%98%9C%ED%83%9D%EC%9C%BC%EB%A1%9C-cj/) | 직접 확인(1차 보관 본문); 개별 수상·가격·용량 증거 아님 |
| `oliveyoung-mediheal-madecassoside-pad-100` | 향료·피부 타입 미확인 | — | 미확인; null 또는 빈 배열 유지; 존재·부재를 주장하지 않음 |
| `oliveyoung-biohealboh-panthecell-cream-mist` | 공식 베스트셀러·2023년 8월~2025년 9월 누적 150만개; 판테놀; 민감 피부 설명 | [근거](https://corp.oliveyoung.com/ko/business/brand/boh) | 직접 확인(재작업); 가격·용량·전성분 미확인 |
| `oliveyoung-biohealboh-panthecell-cream-mist` | 가격·용량·완제품 기능성·향료·에탄올 미확인 | — | 미확인; null 또는 빈 배열 유지; 존재·부재를 주장하지 않음 |
| `oliveyoung-bringgreen-zinc-teca-trouble-serum-25` | 누적 판매 집계의 25ml 단품; 2025년 1~11월 스킨케어 내 제품명에 트러블을 포함한 상품 매출 1위; 민감 피부 설명 | [근거](https://corp.oliveyoung.com/ko/business/brand/bringgreen) | 직접 확인(1차 보관 본문); 집계 범위를 벗어난 전체 세럼 1위로 해석하지 않음 |
| `oliveyoung-bringgreen-zinc-teca-trouble-serum-25` | 가격·핵심 성분·완제품 기능성·향료·에탄올 미확인 | — | 미확인; null 또는 빈 배열 유지; 존재·부재를 주장하지 않음 |
| `oliveyoung-goodal-green-tangerine-vitac-serum-alpha-30` | 정가 28,000원 / 알파 30ml 단품 | [근거](https://clubclio.co.kr/shop/goodsView/0000003511) | 직접 확인(재작업); 할인가 22,400원과 구분; 전성분 이미지 미수집 |
| `oliveyoung-goodal-green-tangerine-vitac-serum-alpha-30` | 2025 어워즈 에센스·세럼 수상; 7년 연속 수상 안내 | [근거](https://www.ktnews.com/news/articleView.html?idxno=142597) | 검색 발췌; 세부 순위 미공개; 원문 열기 403 |
| `oliveyoung-goodal-green-tangerine-vitac-serum-alpha-30` | 보조 출처: 어워즈 전체 집계 방식·규모 | [근거](https://cjnews.cj.net/%EB%AA%A8%EB%91%90%EA%B0%80-%EC%82%AC%EB%9E%91%ED%95%9C-%EC%A0%9C%ED%92%88%EC%9D%84-%EB%AA%A8%EB%91%90%EA%B0%80-%EC%82%AC%EB%9E%91%ED%95%A0-%ED%98%9C%ED%83%9D%EC%9C%BC%EB%A1%9C-cj/) | 직접 확인(1차 보관 본문); 개별 수상·가격·용량 증거 아님 |
| `oliveyoung-goodal-green-tangerine-vitac-serum-alpha-30` | 핵심 성분·완제품 기능성·향료·에탄올·피부 타입 미확인 | — | 미확인; null 또는 빈 배열 유지; 존재·부재를 주장하지 않음 |
| `oliveyoung-mediheal-madecassoside-repair-serum-100` | 정가 45,000원 / 대용량 100ml / 공식 제품명에 마데카소사이드; 2026-03-20 10시 올리브영 온라인 전체 판매 1위 안내 | [근거](https://www.medihealshop.com/) | 직접 확인(1차 보관 본문); 첫 화면의 해당 상품 블록; 특정 시각 근거이며 연간 순위 아님 |
| `oliveyoung-mediheal-madecassoside-repair-serum-100` | 완제품 기능성·향료·에탄올·피부 타입 미확인 | — | 미확인; null 또는 빈 배열 유지; 존재·부재를 주장하지 않음 |
| `oliveyoung-biohealboh-probioderm-3d-lifting-cream` | 공식 베스트셀러; 2024년 1월~2025년 10월 리프팅 크림 카테고리 매출 안내 | [근거](https://corp.oliveyoung.com/ko/business/brand/boh) | 직접 확인(재작업); 기존·3D 크림 합산으로 단일 SKU 순위 아님 |
| `oliveyoung-biohealboh-probioderm-3d-lifting-cream` | 가격·용량·핵심 성분·완제품 기능성·향료·에탄올·피부 타입 미확인 | — | 미확인; null 또는 빈 배열 유지; 존재·부재를 주장하지 않음 |
| `oliveyoung-bringgreen-tea-tree-cica-soothing-toner` | 2021~2025년 기획·단품 합산 누적 200만병; 민감 피부·피지 관련 설명 | [근거](https://corp.oliveyoung.com/ko/business/brand/bringgreen) | 직접 확인(재작업); 현재 단품 용량·정가 미확인 |
| `oliveyoung-bringgreen-tea-tree-cica-soothing-toner` | 가격·용량·핵심 성분·완제품 기능성·향료·에탄올 미확인 | — | 미확인; null 또는 빈 배열 유지; 존재·부재를 주장하지 않음 |
| `oliveyoung-roundlab-birch-moisturizing-sunscreen-50` | 정가 25,000원 / 50ml | [근거](https://roundlab.co.kr/product/%EC%9E%90%EC%9E%91%EB%82%98%EB%AC%B4-%EC%88%98%EB%B6%84-%EC%84%A0%ED%81%AC%EB%A6%BC-50ml/138/) | 직접 확인(1차 보관 본문); 브랜드 소비자가; 할인 제외 |
| `oliveyoung-roundlab-birch-moisturizing-sunscreen-50` | 2025 어워즈 선케어 부문 1위 | [근거](https://www.insight.co.kr/news/535111) | 직접 확인(재작업) |
| `oliveyoung-roundlab-birch-moisturizing-sunscreen-50` | 보조 출처: 어워즈 전체 집계 방식·규모 | [근거](https://cjnews.cj.net/%EB%AA%A8%EB%91%90%EA%B0%80-%EC%82%AC%EB%9E%91%ED%95%9C-%EC%A0%9C%ED%92%88%EC%9D%84-%EB%AA%A8%EB%91%90%EA%B0%80-%EC%82%AC%EB%9E%91%ED%95%A0-%ED%98%9C%ED%83%9D%EC%9C%BC%EB%A1%9C-cj/) | 직접 확인(1차 보관 본문); 개별 수상·가격·용량 증거 아님 |
| `oliveyoung-roundlab-birch-moisturizing-sunscreen-50` | 핵심 성분·완제품 기능성·향료·에탄올·피부 타입 미확인 | — | 미확인; null 또는 빈 배열 유지; 존재·부재를 주장하지 않음 |
| `oliveyoung-goodal-heartleaf-moisture-sunscreen-duo` | 정가 22,000원 / 50ml 1+1 총 100ml | [근거](https://clubclio.co.kr/shop/goodsView/0000007115) | 직접 확인(1차 보관 본문); 브랜드 기획 구성; 어워즈 증정 구성과 구분 |
| `oliveyoung-goodal-heartleaf-moisture-sunscreen-duo` | 맑은 어성초 진정 수분 선크림의 2025 어워즈 선케어 수상 | [근거](https://www.ktnews.com/news/articleView.html?idxno=142597) | 검색 발췌; 세부 순위 미공개; 원문 열기 403; 기존 영상 대신 기사 발췌 채택 |
| `oliveyoung-goodal-heartleaf-moisture-sunscreen-duo` | 보조 출처: 어워즈 전체 집계 방식·규모 | [근거](https://cjnews.cj.net/%EB%AA%A8%EB%91%90%EA%B0%80-%EC%82%AC%EB%9E%91%ED%95%9C-%EC%A0%9C%ED%92%88%EC%9D%84-%EB%AA%A8%EB%91%90%EA%B0%80-%EC%82%AC%EB%9E%91%ED%95%A0-%ED%98%9C%ED%83%9D%EC%9C%BC%EB%A1%9C-cj/) | 직접 확인(1차 보관 본문); 개별 수상·가격·용량 증거 아님 |
| `oliveyoung-goodal-heartleaf-moisture-sunscreen-duo` | 핵심 성분·완제품 기능성·향료·에탄올·피부 타입 미확인 | — | 미확인; null 또는 빈 배열 유지; 존재·부재를 주장하지 않음 |
| `oliveyoung-roundlab-1025-dokdo-toner-200` | 정가 15,000원 / 200ml 단품 | [근거](https://roundlab.co.kr/product/1025-%EB%8F%85%EB%8F%84-%ED%86%A0%EB%84%88-200ml/22/) | 직접 확인(재작업); 소비자가 표시; 판매가 11,900원·배송비 2,500원 제외 |
| `oliveyoung-roundlab-1025-dokdo-toner-200` | 2025 어워즈 토너 부문 1위 | [근거](https://www.insight.co.kr/news/535111) | 직접 확인(재작업) |
| `oliveyoung-roundlab-1025-dokdo-toner-200` | 핵심 성분·완제품 기능성·향료·에탄올·피부 타입 미확인 | — | 미확인; null 또는 빈 배열 유지; 존재·부재를 주장하지 않음 |

## 접근 방식과 요청 기록

자동 크롤러·로그인·브라우저·헤드리스 실행 없이, 검색 도구에서 선택한 공개 결과와 페이지를 사람이 검토하는 빈도로 읽었다. 최초 조사의 검색 포함 도구 호출은 23회였고, 후속 재작업에서는 검색 포함 호출 3회(질의 9개)를 추가했다. 검색 결과를 일괄 순회하거나 상품 목록을 대량 수집하지 않았다. 원문 다운로드는 순차적으로 처리했고 페이지 스크립트를 실행하지 않았다. 제품 이미지·로고를 저장하지 않았다.

아래 “조회”는 검색 도구의 본문 열기·본문 찾기·링크 열기와 직접 HTTP 요청을 합친 대략치다. 검색 결과의 후보 노출은 원서버 요청 횟수로 계산하지 않는다. 검색 도구의 캐시·재시도·내부 원서버 요청 횟수와 간격은 노출되지 않으므로 이를 실제 네트워크 요청 기록이라고 주장하지 않는다. 같은 호스트의 직접 HTTP 요청은 10초 이상 간격이었다. 다이소는 검색 도구에서 본문을 열지 않고 아래 직접 요청 3회만 수행했다.

아래 표는 최초 조사 누계이며 후속 추가 요청은 다음 표에 별도로 적었다.

| 사이트 호스트 | 방식·대략 조회 수 | robots 확인 결과 |
| --- | --- | --- |
| www.daisomall.co.kr | 직접 HTTP 3회, 최소 41.93초 | 일반 봇 Allow /ds/, /pd/pdr/ 등; Crawl-delay 30 |
| oliveyoung.co.kr 및 www.oliveyoung.co.kr | **자동 접근 0회**, robots 조회도 0회 | 지시에 따라 접근하지 않음 |
| cjnews.cj.net | 검색 발췌·본문·robots, 약 3회 | 공개 기사 허용, wp-admin·검색 경로 제외 |
| www.asiatime.co.kr | 검색/캐시 본문·robots, 약 4회 | 일반 봇은 print 제외; GPTBot·ClaudeBot 별도 전면 제한 확인 |
| www.mfds.go.kr | 검색·목록 HTML·PDF·robots, 약 7회 | 일반 봇 Allow / |
| www.cmn.co.kr | 검색 및 robots, 약 2회 | 관리·업로드 등 제외, 공개 기사 경로 제한 없음 |
| v.daum.net | 기사 검색 발췌·선택 열기·robots, 약 4회 | robots 404; 접근 허용의 증거로 해석하지 않음 |
| www.mkhealth.co.kr | 검색 발췌·열기 실패·직접 HTML·robots, 약 4회 | admin·member 등 제외, 기사 경로 제한 없음 |
| www.etoday.co.kr | 기사 본문·robots, 약 2회 | 일반 봇 Allow / |
| www.greenpostkorea.co.kr | 검색 발췌·본문 오류·robots, 약 2회 | 일반 봇 admin 제외; GPTBot 별도 전면 제한 확인 후 추가 본문 요청 없음 |
| www.dailian.co.kr | 기사 본문·찾기·robots, 약 3회 | SemrushBot 제한, 일부 봇 지연·계정 경로 제한; 원문 파일 참조 |
| www.ktnews.com | 기사 검색 발췌·찾기·robots, 약 3회 | 일반 봇 admin 제외 |
| www.lawissue.co.kr | 기사 본문·찾기·robots, 약 3회 | 기사 경로 허용, 관리·검색 경로 제외 |
| stories.amorepacific.com | 공식 기사 본문·robots, 약 2회 | wp-admin·검색 등 제외 |
| medipeel.co.kr | 공식 상품 본문·robots, 약 2회 | admin·api·회원·게시물 작성 등 제외; 공개 product 경로 |
| www.torriden.com, torriden.com | 검색/캐시 상품·찾기·카테고리·robots, 약 10회 | 일반 봇 admin·api 제외; GPTBot·ClaudeBot 별도 전면 제한 확인 후 추가 본문 요청 없음 |
| www.aestura.com | 상품 본문·찾기·robots, 약 4회 | 일반 봇 Allow /, corp 경로 제외 |
| www.medihealshop.com | 공식 상품·첫 화면·찾기·링크 오류·robots, 약 8회 | admin·api·회원·작성 등 제외; 공개 product 경로 |
| corp.oliveyoung.com | 공식 기업 소개·본문 찾기·robots, 약 6회 | 공개 브랜드 경로, search·api·admin 등 제외 |
| clubclio.co.kr | 공식 상품·이벤트·찾기·robots, 약 6회 | 일반 봇 Allow / |
| roundlab.co.kr | 공식 상품 본문·robots, 약 2회 | admin·api·회원·작성 등 제외 |
| www.youtube.com | 공식 구달 검색 결과의 텍스트 설명만 1건 채택 | 원문·robots·영상 요청 없음 |
| www.g-enews.com | 보조 기사 본문·robots, 약 2회 | 공개 기사 경로, 관리·검색 등 제외 |
| manyo.co.kr | 후보 상품·첫 화면·robots, 약 3회 | 응답에 유효한 robots 지시문 확인 못함; 제품 미채택 |
| www.bosa.co.kr | 보조 기사 열기 오류·robots, 약 2회 | 일반 봇 admin 제외; Bingbot 지연 30초 |
| www.enuri.com | 보조 기사 열기 오류·robots, 약 3회 | 일반 봇 Allow /, 계정 관련 경로 제외 |
| www.dkpharm.co.kr | 공식 보도 목록·찾기·상세 오류·robots, 약 4회 | robots 확인 실패; 제품 데이터의 직접 근거로 미채택 |
| assets.kpmg.com | 보조 PDF 404·robots, 약 2회 | 일반 봇 Allow /; PDF 미채택 |

그 외 검색 결과에 노출된 리뷰 사이트·블로그·마켓의 가격은 제품 데이터에 채택하지 않았다. 검색 도구는 기존 색인/캐시도 반환한다. 특히 robots에 특정 AI 봇 제한이 있는 사이트는 해당 제한을 확인한 뒤 직접 상품 HTML을 추가 요청하지 않았다. 공식 쇼핑 도메인과 다른 **corp.oliveyoung.com**은 CJ 기업 소개이며, 그 페이지에 있는 oliveyoung.co.kr 링크를 열지 않았다.

### 후속 재작업의 추가 접근

검색 도구의 본문 열기·찾기 총 19건, 직접 HTTP는 robots 3건이었다. 같은 호스트 본문을 한 호출에서 여러 개 열거나 찾은 경우는 0건이다. 호스트별 반복 호출은 기록상 최소 32초 간격이었으나, 도구 내부 원서버 요청 간격은 노출되지 않는다. 이 내부 간격의 입증 여부는 메인 결정 M-18에 따라 **n/a(도구 한계, 메인 수용)**로 기록한다.

| 호스트 | 추가 조회 수 | 방식·robots 결과 |
| --- | ---: | --- |
| www.insight.co.kr | 3 | robots 직접 1회(200, 일반 봇 Allow /), 본문 열기·찾기 2회 |
| roundlab.co.kr | 1 | 독도 토너 본문; 최초 확인한 robots의 공개 product 경로 |
| fashionbiz.co.kr | 2 | robots 직접 1회(200, 공개 기사 허용), 본문 1회 403; 검색 발췌만 보조 확인 |
| www.ktnews.com | 1 | 구달 기사 본문 403; 검색 발췌 채택, 최초 robots 기사 경로 |
| www.mkhealth.co.kr | 1 | 재열기 403; 최초 보관 HTML을 대조, 추가 직접 다운로드 없음 |
| www.etoday.co.kr | 1 | CNP 기사 본문 재확인; 최초 robots 공개 기사 허용 |
| www.hinews.co.kr | 2 | robots 직접 1회(200, 공개 기사 및 검색 봇 허용), 37초 뒤 원문 본문 1회 |
| v.daum.net | 2 | 다이소 순위·미모 기사 각각 별도 호출; 최초 robots 404의 한계 유지 |
| www.aestura.com | 1 | 80ml·전성분·피부 타입 본문 |
| medipeel.co.kr | 2 | 다이소 전용 본문·전성분 찾기 |
| www.medihealshop.com | 2 | 패드 본문·텍스트 찾기 |
| corp.oliveyoung.com | 2 | 바이오힐 보·브링그린을 서로 다른 호출에서 열람; 쇼핑 링크 미접속 |
| clubclio.co.kr | 2 | 구달 30ml 본문·가격 찾기 |
| www.daisomall.co.kr | 0 | 추가 요청 없음, 최초 3회 요청 간격 유지 |
| oliveyoung.co.kr 및 www.oliveyoung.co.kr | 0 | robots·쇼핑몰·구매 링크 모두 미접속 |

직접 HTTP의 새 요청 시각(UTC): 인사이트 robots 11:38:28.845, 패션비즈 robots 11:41:03.163, 하이뉴스 robots 11:42:09.431. 서로 다른 호스트에 한 번씩만 요청했으며 순차 수행했다. 각 사이트 본문 호출 전에도 10초 이상 간격을 뒀다.

### 다이소 요청 시각

직접 요청 로그의 UTC 시각이며 한국시간은 +9시간이다.

| 시각 (UTC) | 대상 | 결과 | 직전 요청부터 간격 |
| --- | --- | --- | ---: |
| 11:00:09.569 | /robots.txt | 200 | 첫 요청 |
| 11:00:57.527 | /ds/dsc/store | 404 | 47.96초 |
| 11:01:39.455 | /ds | 200 | 41.93초 |

robots를 먼저 확인했고, 이후 두 경로 모두 일반 봇의 /ds/ 허용 범위에 있다. 상품 API, 장바구니, 회원, 결제, 앱 어댑터 경로는 요청하지 않았다. 상품 상세 페이지에 대한 네트워크 요청은 없다.

### 구매 링크와 다이소 이용약관 확인

다이소 공개 /ds HTML의 SearchAction에 `https://www.daisomall.co.kr/ds/dst/SCR_DST_0015?searchTerm={search_term_string}`이 있어 이 템플릿을 사용했다. 검색 URL은 문자열로만 구성했고 접속하지 않았다. 올리브영도 지정된 `/store/search/getSearchMain.do?query=` 형식을 문자열로만 구성했다. 검증된 개별 상품 상세 URL이 없으므로 **27개 모두 purchase_url_kind=search**다. 검색 결과의 판매 여부·재고·옵션 일치는 별도 확인이 필요하다.

다이소 /ds HTML에서 이용약관 버튼과 약관용 팝업 틀을 확인했지만 **약관 본문은 포함돼 있지 않았다**. 연결된 숨은 API나 JavaScript 실행으로 본문을 가져오지 않았다. 따라서 약관 내용, 자동 열람 허용, 재사용 허용 여부는 **미확인**이다. robots의 경로 허용은 약관상 허가나 콘텐츠 재사용 허가를 뜻하지 않는다.

## 미확인 비율과 한계

| 항목 | 미확인 수 / 전체 | 비율 |
| --- | ---: | ---: |
| price_krw=null | 6 / 27 | 22.22% |
| volume_value=null | 6 / 27 | 22.22% |
| key_ingredient_ids 빈 배열 | 19 / 27 | 70.37% |
| sensitive 중 하나 이상 null | 25 / 27 | 92.59% |
| sensitive.fragrance=null | 25 / 27 | 92.59% |
| sensitive.ethanol=null | 24 / 27 | 88.89% |
| unverified_fields가 비지 않은 레코드 | 27 / 27 | 100.00% |

확인일은 자료를 읽은 날짜이며 가격 측정일·재고 확인일·기사 발표일과 다르다. 과거 보도 가격, 현재 브랜드 정가, 제한된 시점 판매 근거가 함께 있으므로 구매 직전 실제 옵션과 가격 확인이 필요하다. 피부 타입이나 성분·기능성이 비어 있는 것은 부적합하거나 해당 성분이 없다는 뜻이 아니다. 민감 성분의 전체 확인 비율이 낮으므로 이 데이터로 개인의 피부 반응을 예측하지 않는다.

검색 도구에서 일부 상세 페이지는 캐시 부재·시간 초과·내부 오류로 다시 열리지 않았다. 이미 읽은 공식 본문 또는 검색 발췌를 사용한 경우 위 표에 그 범위를 밝혔으며, 접근 실패를 현재 품절·폐업·삭제로 해석하지 않았다. 최초 조사에서는 동일 호스트의 캐시 본문 두 개를 한 호출에서 찾은 경우가 있었다. 후속 재작업에서는 이를 하지 않았다. 검색 도구 내부 원서버 간격은 확인할 수 없어 M-18에 따라 n/a로 기록하며, 직접 HTTP 기록과 구분한다.

## 로컬 검증 기록

`node scripts/validate-data.ts --json`에서 JSON 스키마·참조·단위가격·그룹 상한·그룹 순서 유일성 검사 에러 0건을 확인했다. 그룹당 3개 미만 경고는 10건이며 근거 부족을 숨기지 않기 위해 유지한다. URL 존재는 HTTPS 형식·호스트 확인과 실제 출처 열람을 구분했다. 구매 검색 URL을 검증 명목으로 자동 열지 않았다.

조사 원본·요청 로그·추가 검사 결과는 저장소 밖 고유 임시 폴더 `gomin-pick-research-ae2de6ac8b9f42c8a26816a170c184dc`에 보관했다. 저장소에는 원문 HTML·PDF·제품 이미지·로고를 넣지 않았다. 메인의 기존 무작위 10개 재확인 결과는 docs/DATA_VERIFICATION.md에 있고, 지적된 마스크 근거는 위와 같이 보완했다. 신규 1개(독도 토너)는 메인의 추가 표본 검수 대상으로 전달했다. 후속 조사·주장 매핑·검사 로그는 고유 임시 폴더 `gomin-pick-rework-32a5ae8f0b36415ca3711e87554f65ea`에 보관했다.

