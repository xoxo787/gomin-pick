import type { Concern, FunctionalCategory, Ingredient, Product, SkinType, UnitBasis } from './types.ts';
import type { ViewState } from './lib/url-state.ts';
import { ALTERNATIVE_NOTE, cheaperAlternatives } from './lib/alternatives.ts';
import { escapeHtml as e, externalLink } from './lib/html.ts';
import { matchExplanation } from './lib/matching.ts';
import { sensitiveLabel, sensitiveStatus } from './lib/sensitive.ts';
import { formatUnitPrice, productUnitPrice } from './lib/unit-price.ts';
import { sortProducts } from './lib/sorting.ts';

export const skinLabels: Record<SkinType, string> = { dry: '건성', oily: '지성', combination: '복합성', sensitive: '민감성', normal: '중성' };
export const shopLabels = { daiso: '다이소', oliveyoung: '올리브영' };
const functionalLabels: Record<FunctionalCategory, string> = { whitening: '미백', wrinkle: '주름 개선', uv: '자외선 차단', acne: '여드름성 피부 완화', other: '기타 기능성' };
const number = (value: number) => value.toLocaleString('ko-KR');

export function renderQuestionForm(concerns: Concern[], state: ViewState): string {
  return `<section id="question-section" aria-labelledby="question-heading">
    <div class="intro-head">
      <div><p class="eyebrow">01 / 나에게 필요한 정보부터</p><h1 id="question-heading">피부 고민이<br class="mobile-break" /> 뭔가요?</h1>
      <p class="lead">성분은 근거로, 가격은 같은 단위로.<br />두 구매처의 정보를 나란히 살펴보세요.</p></div>
      <div class="index-stamp" aria-label="비교 범위"><span>COMPARISON INDEX</span><strong>${String(concerns.length).padStart(2, '0')}<small>고민</small><b aria-hidden="true"> / </b>02<small>구매처</small></strong><span>다이소 · 올리브영</span></div>
    </div>
    <form id="concern-form">
      <fieldset class="concerns-fieldset"><legend class="sr-only">피부 고민 선택</legend><div class="concern-options">
        ${concerns.map((concern) => `<label class="concern-option"><input type="radio" name="concern" value="${e(concern.id)}" ${state.concern === concern.id ? 'checked' : ''} required /><span class="option-number" aria-hidden="true">${String(concern.order).padStart(2, '0')}</span><span class="option-copy"><strong>${e(concern.label)}</strong><span>${e(concern.hint)}</span></span><span class="option-mark" aria-hidden="true"></span></label>`).join('')}
      </div></fieldset>
      <div class="secondary-choices">
        <div class="skin-choice"><label for="skin">피부 타입 <span class="optional">선택 사항</span></label><select id="skin" name="skin"><option value="">고르지 않아도 괜찮아요</option>${Object.entries(skinLabels).map(([id, label]) => `<option value="${id}" ${state.skin === id ? 'selected' : ''}>${label}</option>`).join('')}</select><p class="field-help">공식 설명에 해당 피부 타입이 있을 때만 표시해요.</p></div>
        <fieldset class="shop-choice"><legend>예산 · 구매처</legend><div class="segmented-control">${[['all', '둘 다'], ['daiso', '다이소만']].map(([id, label]) => `<label><input type="radio" name="shop" value="${id}" ${state.shop === id ? 'checked' : ''} /><span>${label}</span></label>`).join('')}</div><p class="field-help">가격을 확인하지 못한 제품도 함께 표시해요.</p></fieldset>
      </div>
      <div class="form-bottom"><p>순위보다 중요한 건<br /><strong>내가 확인할 수 있는 근거.</strong></p><button class="primary-button" type="submit">비교 결과 보기 <span aria-hidden="true">→</span></button></div>
    </form>
  </section>
  <section id="results" hidden aria-labelledby="results-heading"></section>`;
}

export function renderIngredientGuide(concern: Concern, ingredients: Ingredient[]): string {
  return `<details class="ingredient-guide"><summary>이 고민의 근거 성분 ${concern.evidence_ingredient_ids.length}개 살펴보기</summary>
    <p class="note">제품의 핵심 성분과 이 목록의 겹침을 표시합니다. 함량·제형·개인차는 별도로 확인해야 합니다.</p>
    <ul class="ingredient-list">${concern.evidence_ingredient_ids.map((id) => {
      const ingredient = ingredients.find((item) => item.id === id);
      if (!ingredient) return `<li>${e(id)} · 근거 확인 필요</li>`;
      const status = { official: '공식 고시', reference: '참고 자료', unverified: '미확인' }[ingredient.evidence.status];
      return `<li><strong>${e(ingredient.name_ko)}</strong><span class="small-badge">${status}</span><p>${e(ingredient.evidence.note)}</p>${ingredient.evidence.source_url ? externalLink(ingredient.evidence.source_url, '성분 근거 출처') : '<span class="note">출처 확인 필요</span>'}</li>`;
    }).join('')}</ul></details>`;
}

export function renderChart(products: Product[]): string {
  const bases: UnitBasis[] = ['10ml', '10g', '1ea'];
  const groups = bases.map((basis) => {
    const items = sortProducts(products, 'unit').filter((product) => productUnitPrice(product)?.basis === basis);
    if (!items.length) return '';
    const max = Math.max(...items.map((product) => productUnitPrice(product)!.value), 1);
    return `<div class="chart-group" data-basis="${basis}"><h3>${basis} 기준 <span>낮은 가격부터</span></h3><ol class="chart-rows">${items.map((product) => {
      const value = productUnitPrice(product)!.value;
      return `<li><div class="chart-row-label"><a href="#${e(product.id)}">${e(product.name)}</a><span class="chart-shop">${shopLabels[product.shop]}</span></div><div class="bar-track" aria-hidden="true"><span class="bar ${product.shop}" style="width:${value / max * 100}%"></span></div><strong>${number(value)}<span>원</span></strong></li>`;
    }).join('')}</ol></div>`;
  }).filter(Boolean);
  return `<section class="comparison" aria-labelledby="chart-heading"><div class="section-label"><h2 id="chart-heading">같은 양, 얼마일까요?</h2><span class="micro-label">UNIT PRICE</span></div><p class="note">같은 단위 안에서만 비교하세요. ${products.filter((product) => productUnitPrice(product) === null).length}개 제품은 가격 또는 용량 확인이 필요해 그래프에서 제외했어요.</p>${groups.length ? groups.join('') : '<p class="empty-inline">단위가격을 계산할 수 있는 제품이 아직 없습니다.</p>'}</section>`;
}

export function renderProduct(product: Product, concern: Concern, ingredients: Ingredient[], candidates: Product[], state: ViewState): string {
  const unit = productUnitPrice(product);
  const alternatives = cheaperAlternatives(product, candidates, concern);
  const purchase = externalLink(product.purchase_url, `${shopLabels[product.shop]}${product.shop === 'daiso' ? '몰' : ''}에서 보기`, 'purchase-link');
  const volume = product.volume_value === null || product.volume_unit === null ? '용량 확인 필요' : `${number(product.volume_value)}${product.volume_unit === 'ea' ? '개' : product.volume_unit}`;
  const ingredientName = (id: string) => ingredients.find((ingredient) => ingredient.id === id)?.name_ko ?? id;
  return `<article id="${e(product.id)}" class="product-card" data-testid="product-card" data-shop="${product.shop}" data-price="${product.price_krw ?? ''}" data-unit="${unit?.value ?? ''}" data-basis="${unit?.basis ?? ''}" data-sensitive="${sensitiveStatus(product)}">
    <div class="product-top"><div class="product-title"><div class="product-kicker"><span class="shop-badge ${product.shop}">${shopLabels[product.shop]}</span><span class="rank-label">구매처 내 자료 순서 ${String(product.rank_in_group).padStart(2, '0')}</span></div><p class="brand">${e(product.brand)}</p><h3>${e(product.name)}</h3>${state.skin && product.skin_types?.includes(state.skin) ? `<p class="skin-mention">공식 설명에 ${skinLabels[state.skin]} 피부 언급</p>` : ''}</div>
      <div class="price-block">${product.price_krw === null ? '<p class="unknown-price">가격 확인 필요</p>' : `<p class="price"><span class="price-prefix">정가</span><strong>${number(product.price_krw)}</strong><span>원</span></p><p class="unit-price">${formatUnitPrice(unit)}</p>`}${purchase}${product.purchase_url_kind === 'search' ? '<span class="search-note">공식 검색 결과로 이동</span>' : ''}</div></div>
    <p class="match-line">${e(matchExplanation(concern, product, ingredients))}</p>
    <dl class="product-facts"><div><dt>용량</dt><dd>${volume}</dd></div><div><dt>기능성 정보</dt><dd>${product.functional_cosmetic ? `${product.functional_cosmetic.categories.map((category) => functionalLabels[category]).join(' · ')} ${externalLink(product.functional_cosmetic.source_url, '근거')}` : '기능성 근거 확인 필요'}</dd></div><div><dt>민감 정보${product.sensitive.source_url ? ` ${externalLink(product.sensitive.source_url, '출처')}` : ''}</dt><dd>향료: ${sensitiveLabel(product.sensitive.fragrance)}<br />에탄올: ${sensitiveLabel(product.sensitive.ethanol)}</dd></div></dl>
    <details class="product-details"><summary>왜 이 제품?</summary><p>${e(product.evidence)}</p><ul class="rank-sources">${product.rank_basis.map((basis) => `<li>${externalLink(basis.source_url, basis.title)}<span>${e(basis.award_category ?? '부문 미공개')} · ${e(basis.award_rank ?? '순위 미공개')}${basis.published_at ? ` · ${e(basis.published_at)}` : ''}</span></li>`).join('')}</ul></details>
    <details class="product-details alternatives"><summary>비슷한 핵심 성분의 더 저렴한 대안${alternatives.length ? ` · ${alternatives.length}개` : ''}</summary>${alternatives.length ? `<ul>${alternatives.map((alternative) => `<li><a href="#${e(alternative.product.id)}">${e(alternative.product.name)}</a><span>${shopLabels[alternative.product.shop]} · ${formatUnitPrice(productUnitPrice(alternative.product))}</span><span>${alternative.sharedIngredientIds.map((id) => e(ingredientName(id))).join(', ')} 공유 · ${unit!.basis}당 ${number(alternative.savingPerUnit)}원 낮음</span></li>`).join('')}</ul>` : '<p>현재 조건에서 확인된 대안이 없습니다.</p>'}<p class="note alternative-note">${ALTERNATIVE_NOTE}</p></details>
    <div class="product-provenance"><div class="source-links">${product.source_urls.map((url, index) => externalLink(url, `출처 ${index + 1}`)).join(' ')}<span>확인일 <time datetime="${e(product.checked_at)}">${e(product.checked_at)}</time></span></div><p>${e(product.price_note)}</p></div>
  </article>`;
}

export function renderResults(concern: Concern, products: Product[], ingredients: Ingredient[], state: ViewState, total: number): string {
  let lastGroup: string | null = null;
  const cards = products.map((product) => {
    const status = sensitiveStatus(product);
    const group = state.sensitive ? status : 'all';
    const heading = group !== lastGroup && state.sensitive ? `<div class="sensitive-group" data-testid="sensitive-group"><h3>${status === 'absent' ? '향료·에탄올 미포함 확인' : '정보 없음'}</h3><p>${status === 'absent' ? '확인된 전성분 기준입니다. 개인에 따라 반응이 다를 수 있습니다.' : '향료 또는 에탄올 정보가 확인되지 않았습니다. 구매처의 전성분을 확인하세요.'}</p></div>` : '';
    lastGroup = group;
    return heading + renderProduct(product, concern, ingredients, products, state);
  }).join('');
  return `<div class="result-heading"><div><p class="eyebrow">02 / 비교 기록</p><h1 id="results-heading" tabindex="-1">${e(concern.label)},<br class="mobile-break" /> 근거부터 비교해요.</h1><p class="lead">${state.shop === 'all' ? '다이소 · 올리브영' : '다이소'}${state.skin ? ` / ${skinLabels[state.skin]} 피부 언급 표시` : ''}</p></div><button type="button" id="edit-conditions" class="outline-button">조건 다시 고르기</button></div>
    ${renderIngredientGuide(concern, ingredients)}
    <div class="result-controls"><div class="select-controls"><label for="sort">정렬<select id="sort" name="sort"><option value="rank" ${state.sort === 'rank' ? 'selected' : ''}>상위 근거</option><option value="unit" ${state.sort === 'unit' ? 'selected' : ''}>단위가격</option><option value="price" ${state.sort === 'price' ? 'selected' : ''}>가격</option></select></label><label for="result-shop">구매처<select id="result-shop"><option value="all" ${state.shop === 'all' ? 'selected' : ''}>둘 다</option><option value="daiso" ${state.shop === 'daiso' ? 'selected' : ''}>다이소만</option></select></label></div><label class="sensitive-toggle" for="sensitive-filter"><input type="checkbox" id="sensitive-filter" ${state.sensitive ? 'checked' : ''} /><span><strong>향료·에탄올 포함 제품 숨기기</strong><small>정보 없음 제품은 뒤에 묶어서 표시</small></span></label></div>
    <p class="sort-note note">${state.sort === 'rank' ? '구매처별 자료 순서를 번갈아 표시합니다. 같은 순서에서는 다이소가 먼저이며, 두 구매처를 합친 인기 순위는 아닙니다.' : state.sort === 'unit' ? '10ml → 10g → 1ea 묶음 안에서 낮은 단위가격부터 표시합니다. 계산할 수 없는 제품은 뒤에 표시합니다.' : '확인된 정가가 낮은 순서입니다. 가격 미확인 제품은 뒤에 표시합니다.'}${state.sensitive ? ' 민감 필터를 켜면 미포함 확인 여부를 정렬보다 우선합니다.' : ''}</p>
    ${renderChart(products)}
    <div class="section-label products-label"><h2>제품별 기록 <span>${products.length}</span></h2><p id="result-status" role="status">${total}개 중 ${products.length}개 표시</p></div>
    <p class="note comparison-note">성분이 겹친다고 효과가 같다는 뜻은 아닙니다. 핵심 성분이 미확인인 경우 별도로 표시합니다.</p>
    <div id="product-list">${cards || '<div class="empty-state"><h3>현재 조건에 맞는 제품이 없습니다.</h3><p>구매처를 둘 다로 바꾸거나 향료·에탄올 필터를 꺼서 다른 기록을 살펴보세요.</p><button type="button" id="reset-filters" class="outline-button">필터 초기화</button></div>'}</div>`;
}
