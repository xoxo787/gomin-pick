import sampleConcerns from '../../fixtures/sample-data/concerns.json';
import sampleIngredients from '../../fixtures/sample-data/ingredients.json';
import sampleProducts from '../../fixtures/sample-data/products.json';
import type { Concern, Ingredient, Product } from '../types.ts';

export const moisture = (sampleConcerns as Concern[])[0];
export const ingredients = sampleIngredients as Ingredient[];
export function product(overrides: Partial<Product> = {}): Product {
  return { ...structuredClone((sampleProducts as Product[])[0]), ...overrides };
}
