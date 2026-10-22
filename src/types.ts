export type ConcernId = 'moisture' | 'soothing' | 'trouble' | 'brightening' | 'wrinkle' | 'pore' | 'sun';
// moisture=보습, soothing=진정·민감, trouble=트러블, brightening=미백·잡티, wrinkle=주름·탄력, pore=모공·피지, sun=자외선 차단
export type ShopId = 'daiso' | 'oliveyoung';
export type FunctionalCategory = 'whitening' | 'wrinkle' | 'uv' | 'acne' | 'other';
export type VolumeUnit = 'ml' | 'g' | 'ea';
export type UnitBasis = '10ml' | '10g' | '1ea';
export type SkinType = 'dry' | 'oily' | 'combination' | 'sensitive' | 'normal';

export interface Concern {
  id: ConcernId;
  label: string;                       // 화면 표시명. 예: '보습', '진정·민감'
  hint: string;                        // 선택지 아래 한 줄 설명(과장 표현 금지)
  evidence_ingredient_ids: string[];   // ingredients.json의 id 목록(이 고민의 근거 성분)
  functional_category: FunctionalCategory | null; // 관련 식약처 기능성 유형. 없으면 null
  order: number;                       // 1..7 화면 순서
}

export interface Ingredient {
  id: string;                          // kebab-case 영문. 예: 'ceramide', 'niacinamide'
  name_ko: string;                     // 예: '세라마이드'
  name_inci: string | null;            // 예: 'Ceramide NP'. 모르면 null
  aliases: string[];                   // 전성분 표기 변형(한글/영문)
  concern_ids: ConcernId[];
  functional: {                        // 식약처 기능성화장품 고시 원료일 때만. 아니면 null
    category: FunctionalCategory;
    notice_name: string;               // 고시상의 원료명
    limit: string | null;              // 함량 기준. 예: '2~5%'. 모르면 null
    source_url: string;                // 공식 출처(식약처·법제처 등)
  } | null;
  evidence: {
    status: 'official' | 'reference' | 'unverified'; // official=공식 고시, reference=신뢰할 만한 참고 자료, unverified=미확인
    note: string;                      // 짧은 근거 문장(≤150자, 원문 대량 복제 금지)
    source_url: string | null;         // unverified면 null 가능
  };
}

export interface RankBasis {
  kind: 'award' | 'press' | 'official'; // award=어워즈, press=언론 보도, official=공식 발표/공식몰 랭킹 안내
  title: string;                        // 보도·발표 제목
  award_category: string | null;        // 어워즈 부문(없으면 null)
  award_rank: string | null;            // '1위' 등. 순위 미공개면 null
  published_at: string | null;          // YYYY-MM-DD
  source_url: string;                   // https
}

export interface Product {
  id: string;                    // `${shop}-${slug}` 형식, 전체에서 유일. 예: 'daiso-vt-reedle-shot-100'
  shop: ShopId;
  concern_id: ConcernId;         // 이 데이터셋에서 배정한 대표 고민 1개
  rank_in_group: number;         // 1..5. (concern_id, shop) 그룹 안에서 유일한 큐레이션 순서(상위 근거 순)
  brand: string;
  name: string;
  price_krw: number | null;      // 정가(원). 확인 못 하면 null
  price_source: 'shop_official' | 'brand_official' | 'press' | null; // 가격 출처 종류. price_krw가 null이면 null
  volume_value: number | null;   // 총 용량 숫자. 확인 못 하면 null
  volume_unit: VolumeUnit | null;
  unit_price: { value: number; basis: UnitBasis } | null; // 공통 단위가격 공식으로 계산. 계산 불가면 null
  key_ingredient_ids: string[];  // ingredients.json id. 확인 못 하면 []
  functional_cosmetic: { categories: FunctionalCategory[]; source_url: string } | null; // 기능성 근거가 없으면 null
  sensitive: { fragrance: boolean | null; ethanol: boolean | null; source_url: string | null }; // 확인된 전성분 기준. 모르면 null
  skin_types: SkinType[] | null; // 공식 설명에 명시된 피부 타입. 없으면 null
  rank_basis: RankBasis[];       // 최소 1개
  purchase_url: string;          // 공식 상품 페이지 또는 공식 검색 결과 페이지(https). 딥링크·제휴 링크 금지
  purchase_url_kind: 'product' | 'search';
  source_urls: string[];         // 최소 1개, https
  evidence: string;              // "왜 이 제품?" 짧은 근거(≤150자, 원문 대량 복제 금지)
  checked_at: string;            // 실제 확인일 YYYY-MM-DD
  price_note: string;            // 기본값 '변동 가능, 할인 미반영'
  unverified_fields: string[];   // 확인 못 한 Product 필드명. 예: ['price_krw','volume_value','sensitive']
}
