import type { Product, Category } from '../types';

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: { access_token?: string; error?: string }) => void;
            error_callback?: (err: any) => void;
          }) => {
            requestAccessToken: (overrideConfig?: { prompt?: string }) => void;
          };
        };
      };
    };
  }
}

export const GOOGLE_OAUTH_CLIENT_ID = '1007805491106-i8302f369u780jcqp4qm6f2tc7bm9tit.apps.googleusercontent.com';
export const GOOGLE_SHEETS_SCOPES = 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file';

const TOKEN_KEY = 'purplepuff_google_access_token';
const EXPIRY_KEY = 'purplepuff_google_token_expiry';
const USER_INFO_KEY = 'purplepuff_google_user_info';

export interface GoogleUserInfo {
  email?: string;
  name?: string;
  picture?: string;
}

export const DEFAULT_SHEET_COLUMNS = [
  'ID',
  'Product Name',
  'Category',
  'Strain Type',
  'Price (THB)',
  'Status',
  'Effect 1',
  'Effect 2',
  'Effect 3',
  'Featured',
  'Image URL',
  'Description'
];

export const POPULAR_CUSTOM_COLUMNS = [
  'THC %',
  'Stock Qty',
  'Cost (ต้นทุน ฿)',
  'Supplier (ฟาร์มผู้ผลิต)',
  'Terpenes Profile',
  'Notes (หมายเหตุ)'
];

// ---------------- Token & Auth Helpers ----------------

export function getCachedToken(): string | null {
  const token = localStorage.getItem(TOKEN_KEY);
  const expiry = localStorage.getItem(EXPIRY_KEY);
  if (!token || !expiry) return null;

  if (Date.now() > Number(expiry)) {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EXPIRY_KEY);
    return null;
  }
  return token;
}

export function isGoogleConnected(): boolean {
  return !!getCachedToken();
}

export function getCachedGoogleUser(): GoogleUserInfo | null {
  const info = localStorage.getItem(USER_INFO_KEY);
  if (!info) return null;
  try {
    return JSON.parse(info);
  } catch {
    return null;
  }
}

export function disconnectGoogle(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(EXPIRY_KEY);
  localStorage.removeItem(USER_INFO_KEY);
}

export function requestGoogleAccessToken(): Promise<string> {
  return new Promise((resolve, reject) => {
    // If cached and valid
    const cached = getCachedToken();
    if (cached) {
      resolve(cached);
      return;
    }

    if (!window.google?.accounts?.oauth2) {
      reject(new Error('Google Identity Services SDK ยังโหลดไม่เสร็จสิ้น กรุณารีเฟรชหน้าเว็บอีกครั้ง'));
      return;
    }

    try {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_OAUTH_CLIENT_ID,
        scope: GOOGLE_SHEETS_SCOPES,
        callback: async (response) => {
          if (response.error) {
            reject(new Error(`การยืนยันตัวตน Google ไม่สำเร็จ: ${response.error}`));
            return;
          }
          if (!response.access_token) {
            reject(new Error('ไม่ได้รับ Access Token จาก Google'));
            return;
          }

          const token = response.access_token;
          // Valid for 1 hour (3600 seconds) - save with 50 min expiry buffer
          const expiresAt = Date.now() + 50 * 60 * 1000;
          localStorage.setItem(TOKEN_KEY, token);
          localStorage.setItem(EXPIRY_KEY, expiresAt.toString());

          // Fetch basic user profile
          try {
            const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: `Bearer ${token}` }
            });
            if (userRes.ok) {
              const userData = await userRes.json();
              localStorage.setItem(USER_INFO_KEY, JSON.stringify({
                email: userData.email,
                name: userData.name,
                picture: userData.picture
              }));
            }
          } catch {
            // Ignore userInfo failure
          }

          resolve(token);
        },
        error_callback: (err) => {
          reject(new Error(err?.message || 'การเชื่อมต่อ Google OAuth ถูกยกเลิกหรือปิดหน้าต่าง'));
        }
      });

      client.requestAccessToken({ prompt: 'consent' });
    } catch (err: any) {
      reject(err);
    }
  });
}

// ---------------- Google Sheets API Operations ----------------

function buildRowFromProduct(product: Product, customColumns: string[] = []): any[] {
  const row = [
    product.id || '',
    product.product_name || '',
    product.category_id || '',
    product.type || 'Hybrid',
    Number(product.price || 0),
    product.status || 'AVAILABLE',
    product.effect_1 || '',
    product.effect_2 || '',
    product.effect_3 || '',
    product.featured ? 'YES' : 'NO',
    product.image_url || '',
    product.description || ''
  ];

  // Append custom columns
  customColumns.forEach(col => {
    const val = product.custom_fields?.[col] ?? '';
    row.push(val);
  });

  return row;
}

/**
 * Creates a brand new Google Spreadsheet in the user's Google Drive formatted with Purple Puff design
 */
export async function createPurplePuffSpreadsheet(
  storeName: string,
  products: Product[],
  customColumns: string[] = []
): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> {
  const token = await requestGoogleAccessToken();

  const title = `${storeName} - Product Catalog & Inventory (${new Date().toLocaleDateString('th-TH')})`;
  const allHeaders = [...DEFAULT_SHEET_COLUMNS, ...customColumns];
  const rows = products.map(p => buildRowFromProduct(p, customColumns));

  const createBody = {
    properties: {
      title,
      locale: 'th_TH'
    },
    sheets: [
      {
        properties: {
          title: 'Products',
          gridProperties: {
            frozenRowCount: 1,
            rowCount: Math.max(rows.length + 50, 100),
            columnCount: Math.max(allHeaders.length + 5, 20)
          }
        }
      }
    ]
  };

  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(createBody)
  });

  if (!createRes.ok) {
    const err = await createRes.json();
    throw new Error(err.error?.message || 'ไม่สามารถสร้าง Google Sheets ได้');
  }

  const createdData = await createRes.json();
  const spreadsheetId = createdData.spreadsheetId;
  const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  // Write headers and all products rows
  const valuesData = [allHeaders, ...rows];

  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Products!A1?valueInputOption=USER_ENTERED`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      range: 'Products!A1',
      majorDimension: 'ROWS',
      values: valuesData
    })
  });

  // Apply Purple Puff header styling via batchUpdate
  try {
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        requests: [
          // Format header row
          {
            repeatCell: {
              range: {
                sheetId: 0,
                startRowIndex: 0,
                endRowIndex: 1,
                startColumnIndex: 0,
                endColumnIndex: allHeaders.length
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.28, green: 0.11, blue: 0.52 }, // Cosmic Purple
                  textFormat: {
                    foregroundColor: { red: 1.0, green: 1.0, blue: 1.0 },
                    bold: true,
                    fontSize: 11
                  },
                  horizontalAlignment: 'CENTER'
                }
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)'
            }
          },
          // Auto-resize columns
          {
            autoResizeDimensions: {
              dimensions: {
                sheetId: 0,
                dimension: 'COLUMNS',
                startIndex: 0,
                endIndex: allHeaders.length
              }
            }
          }
        ]
      })
    });
  } catch {
    // Non-fatal if styling fails
  }

  return { spreadsheetId, spreadsheetUrl };
}

/**
 * Reads and parses all products from a Google Spreadsheet
 */
export async function readProductsFromSpreadsheet(
  spreadsheetId: string,
  categories: Category[]
): Promise<{
  products: Partial<Product>[];
  headers: string[];
  customColumns: string[];
  rawRowCount: number;
}> {
  const token = await requestGoogleAccessToken();

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/A1:Z500`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'ไม่สามารถอ่านข้อมูลจาก Google Sheets ได้ (กรุณาตรวจเช็ค Spreadsheet ID และสิทธิ์การเข้าถึง)');
  }

  const data = await res.json();
  const rows: any[][] = data.values || [];

  if (rows.length === 0) {
    return { products: [], headers: [], customColumns: [], rawRowCount: 0 };
  }

  const headers: string[] = rows[0].map((h: any) => String(h || '').trim());
  const dataRows = rows.slice(1);

  // Map header indexes
  const colIndexMap: Record<string, number> = {};
  headers.forEach((h, idx) => {
    colIndexMap[h.toLowerCase()] = idx;
  });

  const getVal = (row: any[], headerCandidates: string[]): string => {
    for (const cand of headerCandidates) {
      const idx = colIndexMap[cand.toLowerCase()];
      if (idx !== undefined && row[idx] !== undefined) {
        return String(row[idx]).trim();
      }
    }
    return '';
  };

  // Find custom columns (columns not in default list)
  const defaultHeaderNamesLower = DEFAULT_SHEET_COLUMNS.map(c => c.toLowerCase());
  const customColumns: string[] = headers.filter(h => {
    if (!h) return false;
    const lower = h.toLowerCase();
    return !defaultHeaderNamesLower.includes(lower) && !lower.startsWith('col_');
  });

  const parsedProducts: Partial<Product>[] = [];

  dataRows.forEach((row, rowIdx) => {
    const name = getVal(row, ['Product Name', 'name', 'ชื่อสินค้า', 'สินค้า']);
    if (!name) return; // Skip empty rows

    const rawId = getVal(row, ['ID', 'Product ID', 'id', 'รหัส']);
    const id = rawId || `prod-${Date.now()}-${rowIdx}`;

    const rawCategory = getVal(row, ['Category', 'category_id', 'หมวดหมู่', 'category']);
    let categoryId = categories[0]?.id || 'cat-pop';
    if (rawCategory) {
      // Find category by ID or name
      const matchedCat = categories.find(
        c => c.id === rawCategory || c.name.toLowerCase().includes(rawCategory.toLowerCase())
      );
      if (matchedCat) categoryId = matchedCat.id;
      else categoryId = rawCategory;
    }

    const rawType = getVal(row, ['Strain Type', 'type', 'สายพันธุ์']) || 'Hybrid';
    let type: Product['type'] = 'Hybrid';
    if (/indica/i.test(rawType)) type = 'Indica';
    else if (/sativa/i.test(rawType)) type = 'Sativa';

    const rawPrice = getVal(row, ['Price (THB)', 'price', 'ราคา', 'ราคา (บาท)']);
    const cleanPrice = Number(rawPrice.replace(/[^0-9.]/g, '')) || 350;

    const rawStatus = getVal(row, ['Status', 'status', 'สถานะ']);
    const status: Product['status'] = /หมด|sold/i.test(rawStatus) ? 'SOLD OUT' : 'AVAILABLE';

    const effect1 = getVal(row, ['Effect 1', 'effect_1', 'เอฟเฟกต์ 1']);
    const effect2 = getVal(row, ['Effect 2', 'effect_2', 'เอฟเฟกต์ 2']);
    const effect3 = getVal(row, ['Effect 3', 'effect_3', 'เอฟเฟกต์ 3']);

    const rawFeatured = getVal(row, ['Featured', 'featured', 'แนะนำ']);
    const featured = /yes|true|ใช่|แนะนำ/i.test(rawFeatured);

    const imageUrl = getVal(row, ['Image URL', 'image_url', 'รูปภาพ', 'รูป']);
    const description = getVal(row, ['Description', 'description', 'รายละเอียด']);

    // Extract custom fields
    const customFields: Record<string, any> = {};
    customColumns.forEach(col => {
      const idx = colIndexMap[col.toLowerCase()];
      if (idx !== undefined && row[idx] !== undefined) {
        customFields[col] = row[idx];
      }
    });

    parsedProducts.push({
      id,
      product_name: name,
      category_id: categoryId,
      type,
      price: cleanPrice,
      status,
      effect_1: effect1 || 'ผ่อนคลาย',
      effect_2: effect2,
      effect_3: effect3,
      featured,
      image_url: imageUrl || 'https://images.unsplash.com/photo-1568644396922-5c3bfae12521?auto=format&fit=crop&w=800&q=80',
      description,
      custom_fields: customFields
    });
  });

  return {
    products: parsedProducts,
    headers,
    customColumns,
    rawRowCount: dataRows.length
  };
}

/**
 * Pushes and updates all current store products to Google Sheets
 */
export async function syncStoreProductsToSpreadsheet(
  spreadsheetId: string,
  products: Product[],
  customColumns: string[] = []
): Promise<void> {
  const token = await requestGoogleAccessToken();

  const allHeaders = [...DEFAULT_SHEET_COLUMNS, ...customColumns];
  const rows = products.map(p => buildRowFromProduct(p, customColumns));
  const valuesData = [allHeaders, ...rows];

  // Overwrite entire sheet starting at A1
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/A1:Z${valuesData.length + 10}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        range: `A1:Z${valuesData.length + 10}`,
        majorDimension: 'ROWS',
        values: valuesData
      })
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'ไม่สามารถบันทึกข้อมูลลง Google Sheets ได้');
  }
}

/**
 * Appends a new product row to the bottom of the Google Sheet
 */
export async function appendProductToSpreadsheet(
  spreadsheetId: string,
  product: Product,
  customColumns: string[] = []
): Promise<void> {
  const token = await requestGoogleAccessToken();
  const row = buildRowFromProduct(product, customColumns);

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/A1:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        values: [row]
      })
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'ไม่สามารถเพิ่มแถวสินค้าลงใน Google Sheets ได้');
  }
}

/**
 * Adds a new column header to the Google Spreadsheet
 */
export async function addColumnToSpreadsheet(
  spreadsheetId: string,
  newColumnName: string,
  existingHeaders: string[]
): Promise<string[]> {
  const token = await requestGoogleAccessToken();
  const trimmed = newColumnName.trim();
  if (!trimmed) throw new Error('ชื่อ Column ต้องไม่ว่างเปล่า');

  const updatedHeaders = [...existingHeaders, trimmed];
  const colIndex = existingHeaders.length; // 0-based

  // Convert column index to letter (A, B, ... Z, AA)
  const colLetter = getColumnLetter(colIndex);

  // Write new header in cell
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${colLetter}1?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        values: [[trimmed]]
      })
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'ไม่สามารถเพิ่ม Column ลงใน Google Sheets ได้');
  }

  return updatedHeaders;
}

function getColumnLetter(index: number): string {
  let temp = index;
  let letter = '';
  while (temp >= 0) {
    letter = String.fromCharCode((temp % 26) + 65) + letter;
    temp = Math.floor(temp / 26) - 1;
  }
  return letter || 'A';
}

/**
 * Extracts spreadsheet ID from full Google Sheets URL or raw ID
 */
export function extractSpreadsheetId(input: string): string {
  if (!input) return '';
  const trimmed = input.trim();
  // If it's a full URL like https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit#gid=0
  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    return match[1];
  }
  return trimmed;
}
