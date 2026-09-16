import type { Category, Product } from '../types';

/**
 * Checks whether a given category is an equipment / device / accessory category.
 */
export function isEquipmentCategory(
  category?: Category | { id?: string; name?: string; description?: string } | null
): boolean {
  if (!category) return false;
  const id = (category.id || '').toLowerCase();
  const name = (category.name || '').toLowerCase();
  const desc = (category.description || '').toLowerCase();

  return (
    id === 'cat-general' ||
    id.includes('equip') ||
    id.includes('device') ||
    id.includes('gear') ||
    id.includes('accessor') ||
    name.includes('อุปกรณ์') ||
    name.includes('ของทั่วไป') ||
    name.includes('บ้อง') ||
    name.includes('grinder') ||
    name.includes('เครื่องบด') ||
    name.includes('accessories') ||
    name.includes('equipment') ||
    desc.includes('อุปกรณ์') ||
    desc.includes('แอคเซสเซอรี่')
  );
}

/**
 * Checks whether a product is equipment / device / accessory, which does not have bodily symptoms/effects.
 */
export function isEquipmentProduct(
  product?: Partial<Product> | null,
  categories?: Category[]
): boolean {
  if (!product) return false;

  // 1. Check category_id
  if (product.category_id) {
    if (
      product.category_id === 'cat-general' ||
      product.category_id.includes('equip') ||
      product.category_id.includes('device') ||
      product.category_id.includes('gear')
    ) {
      return true;
    }
    if (categories && categories.length > 0) {
      const cat = categories.find(c => c.id === product.category_id);
      if (cat && isEquipmentCategory(cat)) return true;
    }
  }

  // 2. Check product name keywords
  const name = (product.product_name || '').toLowerCase();
  if (
    name.includes('grinder') ||
    name.includes('บ้อง') ||
    name.includes('เครื่องบด') ||
    name.includes('กระดาษโรล') ||
    name.includes('ไฟแช็ค') ||
    name.includes('rolling paper') ||
    name.includes('tray') ||
    name.includes('lighter') ||
    name.includes('pipe') ||
    name.includes('bong') ||
    name.includes('อุปกรณ์')
  ) {
    return true;
  }

  return false;
}

/**
 * Returns the appropriate pricing unit label for a product:
 * Equipment: '/ ชิ้น'
 * Flower/Strain: '/ 1G'
 */
export function getProductUnitLabel(
  product?: Partial<Product> | null,
  categories?: Category[]
): string {
  return isEquipmentProduct(product, categories) ? '/ ชิ้น' : '/ 1G';
}
