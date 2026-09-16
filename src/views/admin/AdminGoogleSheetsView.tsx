import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  RefreshCw, 
  ExternalLink, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Upload, 
  Download, 
  Columns, 
  Trash2, 
  Edit, 
  Save, 
  Link as LinkIcon, 
  Lock, 
  ShieldCheck, 
  Layers, 
  Search,
  Tag,
  HelpCircle,
  LogOut,
  ChevronRight
} from 'lucide-react';
import type { Product, Category, StoreSettings, User } from '../../types';
import { 
  requestGoogleAccessToken, 
  getCachedToken, 
  isGoogleConnected, 
  disconnectGoogle, 
  getCachedGoogleUser,
  createPurplePuffSpreadsheet,
  readProductsFromSpreadsheet,
  syncStoreProductsToSpreadsheet,
  appendProductToSpreadsheet,
  addColumnToSpreadsheet,
  extractSpreadsheetId,
  DEFAULT_SHEET_COLUMNS,
  POPULAR_CUSTOM_COLUMNS,
  type GoogleUserInfo
} from '../../lib/googleSheets';
import { adminBulkSyncProducts } from '../../lib/api';

interface AdminGoogleSheetsViewProps {
  products: Product[];
  categories: Category[];
  settings: StoreSettings | null;
  currentUser: User;
  onRefreshProducts: () => Promise<void>;
  onSaveSettings: (settings: Partial<StoreSettings>) => Promise<void>;
}

export const AdminGoogleSheetsView: React.FC<AdminGoogleSheetsViewProps> = ({
  products,
  categories,
  settings,
  currentUser,
  onRefreshProducts,
  onSaveSettings
}) => {
  const [connected, setConnected] = useState<boolean>(isGoogleConnected());
  const [googleUser, setGoogleUser] = useState<GoogleUserInfo | null>(getCachedGoogleUser());
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncDirection, setSyncDirection] = useState<'UP' | 'DOWN' | null>(null);

  // Spreadsheet config
  const [sheetIdInput, setSheetIdInput] = useState(settings?.google_sheet_id || '');
  const [currentSheetId, setCurrentSheetId] = useState(settings?.google_sheet_id || '');
  const [customColumns, setCustomColumns] = useState<string[]>(
    settings?.google_sheet_columns || ['THC %', 'Stock Qty', 'ฟาร์มผู้ผลิต']
  );
  const [newColumnName, setNewColumnName] = useState('');

  // Notifications & Messages
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Quick Add Row Modal / Form
  const [showAddRowModal, setShowAddRowModal] = useState(false);
  const [newProductRow, setNewProductRow] = useState<Partial<Product>>({
    product_name: '',
    category_id: categories[0]?.id || 'cat-pop',
    type: 'Hybrid',
    price: 350,
    status: 'AVAILABLE',
    effect_1: 'ผ่อนคลายลึก',
    effect_2: 'หลับสบาย',
    effect_3: '',
    description: '',
    image_url: 'https://images.unsplash.com/photo-1568644396922-5c3bfae12521?auto=format&fit=crop&w=800&q=80',
    featured: false,
    custom_fields: {}
  });

  // Table search & filter
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setConnected(isGoogleConnected());
    setGoogleUser(getCachedGoogleUser());
  }, []);

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  // Connect Google Account
  const handleConnectGoogle = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      await requestGoogleAccessToken();
      setConnected(true);
      setGoogleUser(getCachedGoogleUser());
      showSuccess('เชื่อมต่อบัญชี Google สำเร็จเรียบร้อยแล้ว!');
    } catch (err: any) {
      setErrorMessage(err.message || 'ไม่สามารถเชื่อมต่อ Google ได้ กรุณาลองใหม่');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnectGoogle = () => {
    disconnectGoogle();
    setConnected(false);
    setGoogleUser(null);
    showSuccess('ยกเลิกการเชื่อมต่อบัญชี Google เรียบร้อยแล้ว');
  };

  // Create Brand New Spreadsheet
  const handleCreateNewSheet = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const storeName = settings?.store_name || 'PURPLE PUFF';
      const { spreadsheetId, spreadsheetUrl } = await createPurplePuffSpreadsheet(
        storeName,
        products,
        customColumns
      );

      setCurrentSheetId(spreadsheetId);
      setSheetIdInput(spreadsheetId);

      // Save to store settings
      await onSaveSettings({
        google_sheet_id: spreadsheetId,
        google_sheet_url: spreadsheetUrl,
        google_sheet_synced_at: new Date().toISOString(),
        google_sheet_columns: customColumns
      });

      showSuccess(`สร้าง Google Sheet สำเร็จแล้ว! พร้อมข้อมูลสินค้า ${products.length} รายการ`);
    } catch (err: any) {
      setErrorMessage(err.message || 'สร้าง Google Sheet ไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  // Connect Existing Spreadsheet
  const handleSaveSheetId = async () => {
    const cleanId = extractSpreadsheetId(sheetIdInput);
    if (!cleanId) {
      setErrorMessage('กรุณาระบุ Spreadsheet ID หรือ URL ของ Google Sheets');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);
      const url = `https://docs.google.com/spreadsheets/d/${cleanId}/edit`;
      setCurrentSheetId(cleanId);
      setSheetIdInput(cleanId);

      await onSaveSettings({
        google_sheet_id: cleanId,
        google_sheet_url: url,
        google_sheet_columns: customColumns
      });

      showSuccess('เชื่อมต่อ Google Sheet ID เรียบร้อยแล้ว');
    } catch (err: any) {
      setErrorMessage(err.message || 'ไม่สามารถบันทึกการเชื่อมต่อได้');
    } finally {
      setLoading(false);
    }
  };

  // PUSH: Export store products to Google Sheets
  const handlePushToSheets = async () => {
    if (!currentSheetId) {
      setErrorMessage('กรุณาเลือกหรือสร้าง Google Sheet ก่อนทำการส่งออก');
      return;
    }

    try {
      setSyncing(true);
      setSyncDirection('UP');
      setErrorMessage(null);

      await syncStoreProductsToSpreadsheet(currentSheetId, products, customColumns);

      await onSaveSettings({
        google_sheet_synced_at: new Date().toISOString()
      });

      showSuccess(`อัปเดตข้อมูลสินค้า ${products.length} รายการขึ้น Google Sheets สำเร็จ!`);
    } catch (err: any) {
      setErrorMessage(err.message || 'ส่งข้อมูลไป Google Sheets ไม่สำเร็จ');
    } finally {
      setSyncing(false);
      setSyncDirection(null);
    }
  };

  // PULL: Import products from Google Sheets into Store
  const handlePullFromSheets = async () => {
    if (!currentSheetId) {
      setErrorMessage('กรุณาเลือกหรือสร้าง Google Sheet ก่อนทำการดึงข้อมูล');
      return;
    }

    try {
      setSyncing(true);
      setSyncDirection('DOWN');
      setErrorMessage(null);

      const { products: sheetProducts, customColumns: sheetCustomCols } = await readProductsFromSpreadsheet(
        currentSheetId,
        categories
      );

      if (sheetProducts.length === 0) {
        throw new Error('ไม่พบแถวข้อมูลสินค้าใน Google Sheet (กรุณาตรวจเช็คหัวตารางในแถวที่ 1)');
      }

      // Merge custom columns
      const mergedColumns = Array.from(new Set([...customColumns, ...sheetCustomCols]));
      setCustomColumns(mergedColumns);

      // Save to backend database
      await adminBulkSyncProducts(sheetProducts);

      // Save sync time and columns
      await onSaveSettings({
        google_sheet_synced_at: new Date().toISOString(),
        google_sheet_columns: mergedColumns
      });

      // Reload fresh products in UI
      await onRefreshProducts();

      showSuccess(`ดึงข้อมูลสำเร็จ! อัปเดตสินค้าทั้งหมด ${sheetProducts.length} รายการเข้าร้านเรียบร้อยแล้ว`);
    } catch (err: any) {
      setErrorMessage(err.message || 'ดึงข้อมูลจาก Google Sheets ไม่สำเร็จ');
    } finally {
      setSyncing(false);
      setSyncDirection(null);
    }
  };

  // Add New Custom Column
  const handleAddColumn = async (colName: string) => {
    const trimmed = colName.trim();
    if (!trimmed) return;

    if (customColumns.includes(trimmed) || DEFAULT_SHEET_COLUMNS.includes(trimmed)) {
      setErrorMessage('ช่องสินค้านี้มีอยู่ในระบบแล้ว');
      return;
    }

    const updated = [...customColumns, trimmed];
    setCustomColumns(updated);
    setNewColumnName('');

    try {
      if (currentSheetId && connected) {
        const allCurrentHeaders = [...DEFAULT_SHEET_COLUMNS, ...customColumns];
        await addColumnToSpreadsheet(currentSheetId, trimmed, allCurrentHeaders);
      }

      await onSaveSettings({
        google_sheet_columns: updated
      });

      showSuccess(`เพิ่มช่องสินค้า "${trimmed}" ลงในระบบและ Google Sheets เรียบร้อยแล้ว`);
    } catch (err: any) {
      // Still keep local
      await onSaveSettings({ google_sheet_columns: updated });
      showSuccess(`เพิ่มช่องสินค้า "${trimmed}" ในระบบเรียบร้อย`);
    }
  };

  // Remove Custom Column
  const handleRemoveColumn = async (colName: string) => {
    const updated = customColumns.filter(c => c !== colName);
    setCustomColumns(updated);
    await onSaveSettings({ google_sheet_columns: updated });
    showSuccess(`ลบช่อง "${colName}" ออกจากระบบ`);
  };

  // Add Product Row straight from this view
  const handleCreateProductRow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductRow.product_name?.trim()) {
      setErrorMessage('กรุณากรอกชื่อสินค้า');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);

      // Save to store DB
      const result = await adminBulkSyncProducts([newProductRow]);
      const addedProduct = result.products.find(p => p.product_name === newProductRow.product_name) || {
        ...newProductRow,
        id: `prod-${Date.now()}`
      } as Product;

      // Also append to Google Sheets if connected
      if (currentSheetId && connected) {
        try {
          await appendProductToSpreadsheet(currentSheetId, addedProduct, customColumns);
        } catch (sheetErr: any) {
          console.warn('Could not append row directly to sheet:', sheetErr);
        }
      }

      await onRefreshProducts();
      setShowAddRowModal(false);
      setNewProductRow({
        product_name: '',
        category_id: categories[0]?.id || 'cat-pop',
        type: 'Hybrid',
        price: 350,
        status: 'AVAILABLE',
        effect_1: 'ผ่อนคลายลึก',
        effect_2: '',
        effect_3: '',
        description: '',
        image_url: 'https://images.unsplash.com/photo-1568644396922-5c3bfae12521?auto=format&fit=crop&w=800&q=80',
        featured: false,
        custom_fields: {}
      });

      showSuccess(`เพิ่มสินค้าใหม่ "${addedProduct.product_name}" เข้าร้านและ Google Sheets เรียบร้อยแล้ว!`);
    } catch (err: any) {
      setErrorMessage(err.message || 'เพิ่มสินค้าไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.product_name.toLowerCase().includes(q) ||
      p.type.toLowerCase().includes(q) ||
      p.status.toLowerCase().includes(q)
    );
  });

  return (
    <div id="admin-google-sheets-view" className="space-y-6 animate-fade-in pb-20 max-w-6xl mx-auto">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white font-display flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-400 p-[1px] flex items-center justify-center shadow-lg">
              <div className="w-full h-full rounded-[11px] bg-[#0c1f15] flex items-center justify-center text-emerald-300">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
            </div>
            <span>GOOGLE SHEETS SYNC & COLUMN MANAGER</span>
            <Sparkles className="w-5 h-5 text-yellow-300" />
          </h2>
          <p className="text-xs text-purple-300/80 mt-1">
            เชื่อมต่อ Google Sheets แก้ไขข้อมูลสินค้า จัดการคอลัมน์/ช่องสินค้า และซิงค์สองทางแบบ Real-time
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {currentSheetId && (
            <a
              href={`https://docs.google.com/spreadsheets/d/${currentSheetId}/edit`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 text-xs font-black flex items-center gap-2 cursor-pointer shadow-md transition active:scale-95"
            >
              <ExternalLink className="w-4 h-4" />
              <span>เปิดใน Google Sheets ↗</span>
            </a>
          )}
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs sm:text-sm font-bold flex items-center gap-3 animate-scale-in shadow-xl">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs sm:text-sm font-bold flex items-center gap-3 animate-scale-in shadow-xl">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* ============================================================ */}
      {/* SECTION 1: GOOGLE ACCOUNT & STATUS BAR */}
      {/* ============================================================ */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#1b0d36] to-[#0f0620] border-2 border-purple-500/30 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
            connected 
              ? 'bg-emerald-950/70 border-emerald-500/60 text-emerald-300 shadow-emerald-950/50 shadow-lg' 
              : 'bg-purple-950/70 border-purple-700/50 text-purple-300'
          }`}>
            <FileSpreadsheet className="w-6 h-6" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-white font-display">
                GOOGLE ACCOUNT INTEGRATION
              </span>
              <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                connected
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              }`}>
                {connected ? '● CONNECTED (เชื่อมต่อแล้ว)' : '○ NOT CONNECTED (ยังไม่ได้เชื่อมต่อ)'}
              </span>
            </div>
            <p className="text-xs text-purple-300/80 mt-0.5">
              {connected 
                ? `บัญชี Google: ${googleUser?.email || 'เข้าสู่ระบบแล้ว'} (สิทธิ์เข้าถึง Google Sheets & Google Drive)`
                : 'เชื่อมต่อบัญชี Google ของคุณเพื่ออ่าน/เขียน Google Sheets อัตโนมัติ'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {connected ? (
            <button
              onClick={handleDisconnectGoogle}
              className="px-3.5 py-2 rounded-xl bg-purple-950/60 hover:bg-rose-950/70 border border-purple-800/40 hover:border-rose-500/40 text-purple-300 hover:text-rose-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>สลับ / ยกเลิกบัญชี</span>
            </button>
          ) : (
            <button
              onClick={handleConnectGoogle}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white text-xs font-black flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-950/60 active:scale-95 transition disabled:opacity-50"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>{loading ? 'กำลังเชื่อมต่อ...' : 'เชื่อมต่อบัญชี Google (Sign in)'}</span>
            </button>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* SECTION 2: SPREADSHEET SETUP & SYNC CONTROL */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Connect or Create Spreadsheet (7 Cols) */}
        <div className="lg:col-span-7 p-5 sm:p-6 rounded-3xl bg-cosmic-card border border-purple-500/20 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-2 border-b border-purple-800/30">
            <h3 className="text-sm font-black text-white font-display uppercase tracking-wider flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-yellow-300" />
              <span>GOOGLE SPREADSHEET LINK</span>
            </h3>
            {settings?.google_sheet_synced_at && (
              <span className="text-[10px] text-purple-300/70">
                ซิงค์ล่าสุด: {new Date(settings.google_sheet_synced_at).toLocaleTimeString('th-TH')}
              </span>
            )}
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-purple-200 block mb-1.5 flex items-center justify-between">
                <span>ระบุ Google Spreadsheet ID หรือ ลิงก์ URL เต็ม</span>
                <span className="text-[10px] text-purple-400">docs.google.com/spreadsheets/d/...</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={sheetIdInput}
                  onChange={e => setSheetIdInput(e.target.value)}
                  placeholder="เช่น 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs... หรือวาง URL เต็ม"
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-purple-950/70 border border-purple-700/50 text-white text-xs sm:text-sm focus:border-yellow-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleSaveSheetId}
                  disabled={loading}
                  className="px-4 py-2.5 rounded-xl bg-purple-800 hover:bg-purple-700 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-md transition active:scale-95 disabled:opacity-50 shrink-0"
                >
                  <Save className="w-4 h-4" />
                  <span>บันทึกชีสนี้</span>
                </button>
              </div>
            </div>

            {/* Quick 1-Click Create Button */}
            <div className="p-3.5 rounded-2xl bg-purple-950/40 border border-purple-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-extrabold text-white block flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                  <span>ยังไม่มี Google Sheet? สร้างไฟล์ใหม่ทันที</span>
                </span>
                <span className="text-[11px] text-purple-300/70">
                  ระบบจะสร้าง Google Sheet พร้อมแต่งสี Cosmic Purple และใส่สินค้า {products.length} ชิ้นให้ทันที
                </span>
              </div>
              <button
                type="button"
                onClick={handleCreateNewSheet}
                disabled={loading}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-yellow-500 hover:from-purple-500 hover:to-yellow-400 text-white text-xs font-black flex items-center gap-2 cursor-pointer shadow-lg active:scale-95 transition disabled:opacity-50 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>{loading ? 'กำลังสร้างไฟล์...' : '+ สร้างชีสใหม่ให้ร้าน'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Sync Controls (5 Cols) */}
        <div className="lg:col-span-5 p-5 sm:p-6 rounded-3xl bg-cosmic-card border border-purple-500/20 space-y-4 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-purple-800/30">
            <h3 className="text-sm font-black text-white font-display uppercase tracking-wider flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-emerald-400" />
              <span>SYNC TWO-WAY (ซิงค์สองทาง)</span>
            </h3>
            <span className="text-[10px] font-extrabold text-purple-300">
              {products.length} รายการในร้าน
            </span>
          </div>

          <div className="space-y-3">
            {/* PULL: Google Sheets -> Store */}
            <button
              type="button"
              onClick={handlePullFromSheets}
              disabled={syncing || !currentSheetId}
              className="w-full p-3.5 rounded-2xl bg-emerald-950/70 hover:bg-emerald-900/80 border border-emerald-500/50 text-left cursor-pointer transition active:scale-98 disabled:opacity-50 flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-900/60 border border-emerald-500/40 flex items-center justify-center text-emerald-300 shrink-0">
                  <Download className={`w-4 h-4 ${syncing && syncDirection === 'DOWN' ? 'animate-bounce' : ''}`} />
                </div>
                <div>
                  <span className="text-xs font-black text-white block group-hover:text-emerald-300 transition">
                    ดึงข้อมูลจาก Google Sheets เข้าร้าน
                  </span>
                  <span className="text-[10px] text-emerald-200/70">
                    อัปเดตราคา, สต็อก, สายพันธุ์ หรือสินค้าใหม่ที่เพิ่มในชีส
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-emerald-400 shrink-0" />
            </button>

            {/* PUSH: Store -> Google Sheets */}
            <button
              type="button"
              onClick={handlePushToSheets}
              disabled={syncing || !currentSheetId}
              className="w-full p-3.5 rounded-2xl bg-purple-950/70 hover:bg-purple-900/80 border border-purple-700/50 text-left cursor-pointer transition active:scale-98 disabled:opacity-50 flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-900/60 border border-purple-500/40 flex items-center justify-center text-yellow-300 shrink-0">
                  <Upload className={`w-4 h-4 ${syncing && syncDirection === 'UP' ? 'animate-bounce' : ''}`} />
                </div>
                <div>
                  <span className="text-xs font-black text-white block group-hover:text-yellow-300 transition">
                    ส่งออกข้อมูลร้านค้าขึ้น Google Sheets
                  </span>
                  <span className="text-[10px] text-purple-300/70">
                    อัปเดตสินค้าทั้งหมดจากเว็บขึ้นตารางให้ตรงกัน
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-purple-400 shrink-0" />
            </button>
          </div>

          <div className="pt-2 text-[11px] text-purple-300/70 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>คุณสามารถแก้ไขราคาและสต็อกใน Google Sheets ได้ตลอดเวลา</span>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* SECTION 3: COLUMN & PRODUCT FIELD MANAGER (ตามคำขอของผู้ใช้) */}
      {/* ============================================================ */}
      <div className="p-5 sm:p-7 rounded-3xl bg-gradient-to-br from-[#1f0d3b] to-[#120726] border-2 border-purple-500/40 space-y-5 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-purple-800/40">
          <div>
            <h3 className="text-sm sm:text-base font-black text-white font-display uppercase tracking-wider flex items-center gap-2">
              <Columns className="w-5 h-5 text-yellow-300" />
              <span>จัดการช่องข้อมูลสินค้า (COLUMNS & CUSTOM FIELDS)</span>
            </h3>
            <p className="text-xs text-purple-300/70">
              เพิ่มช่องข้อมูลใหม่ เช่น THC %, จำนวนสต็อก, ต้นทุน, ฟาร์มผู้ผลิต ให้แสดงในตารางและซิงค์กับ Google Sheets
            </p>
          </div>

          <span className="text-[10px] font-extrabold px-3 py-1 rounded-full bg-yellow-400/20 text-yellow-300 border border-yellow-400/30 self-start sm:self-auto">
            {DEFAULT_SHEET_COLUMNS.length + customColumns.length} คอลัมน์ทั้งหมด
          </span>
        </div>

        {/* Column Tag List */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-purple-300">ช่องข้อมูลเริ่มต้น (Standard Columns):</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {DEFAULT_SHEET_COLUMNS.map((col, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-lg bg-purple-950/80 border border-purple-700/40 text-purple-200 text-xs font-semibold flex items-center gap-1.5"
              >
                <Lock className="w-3 h-3 text-purple-400" />
                <span>{col}</span>
              </span>
            ))}
          </div>

          {/* Custom Columns added by user */}
          <div className="pt-2">
            <span className="text-xs font-bold text-yellow-300 block mb-2">
              ✨ ช่องข้อมูลเพิ่มเติมที่คุณสร้าง (Custom Columns):
            </span>
            <div className="flex flex-wrap gap-2">
              {customColumns.length === 0 ? (
                <span className="text-xs text-purple-400/70 italic">ยังไม่มีช่องเพิ่มเติม (คลิกเพิ่มด้านล่าง)</span>
              ) : (
                customColumns.map((col, idx) => (
                  <div
                    key={idx}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-900/80 to-indigo-900/80 border border-purple-500/50 text-white text-xs font-bold flex items-center gap-2 shadow-md animate-scale-in"
                  >
                    <Tag className="w-3.5 h-3.5 text-yellow-300" />
                    <span>{col}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveColumn(col)}
                      className="p-0.5 text-purple-300 hover:text-rose-300 transition cursor-pointer"
                      title="ลบช่องนี้"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Add New Column Input & Presets */}
          <div className="p-4 rounded-2xl bg-purple-950/50 border border-purple-800/40 space-y-3 mt-3">
            <label className="text-xs font-bold text-purple-200 block">
              + เพิ่มช่องสินค้าใหม่ (ADD NEW COLUMN)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newColumnName}
                onChange={e => setNewColumnName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddColumn(newColumnName);
                  }
                }}
                placeholder="พิมพ์ชื่อช่อง เช่น THC %, จำนวนสต็อก, ต้นทุน ฿, ฟาร์มผู้ผลิต, กลิ่นเทอร์พีน..."
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-purple-950/80 border border-purple-700/50 text-white text-xs sm:text-sm focus:border-yellow-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleAddColumn(newColumnName)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-yellow-500 hover:from-purple-500 hover:to-yellow-400 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-md transition active:scale-95 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>เพิ่มช่องนี้</span>
              </button>
            </div>

            {/* Popular Presets */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] text-purple-400 font-semibold mr-1">คำแนะนำด่วน:</span>
              {POPULAR_CUSTOM_COLUMNS.map((preset, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleAddColumn(preset)}
                  className="px-2.5 py-1 rounded-full bg-purple-900/40 hover:bg-purple-800/60 border border-purple-700/40 hover:border-yellow-400/60 text-purple-300 hover:text-white text-[10px] font-bold cursor-pointer transition active:scale-95"
                >
                  +{preset}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* SECTION 4: PRODUCT CATALOG SPREADSHEET TABLE PREVIEW */}
      {/* ============================================================ */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-black text-white font-display flex items-center gap-2">
              <span>ตารางสินค้า & ช่องข้อมูลปัจจุบัน</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-900/60 text-purple-200 border border-purple-700/40">
                {filteredProducts.length} รายการ
              </span>
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="ค้นหาชื่อสินค้าในตาราง..."
                className="pl-8 pr-3 py-2 rounded-xl bg-purple-950/60 border border-purple-800/40 text-xs text-white placeholder:text-purple-400/50 focus:border-yellow-400 focus:outline-none w-48 sm:w-60"
              />
            </div>

            {/* Quick Add Product Row Button */}
            <button
              type="button"
              onClick={() => setShowAddRowModal(true)}
              className="py-2 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-md active:scale-95 transition shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ เพิ่มแถวสินค้า</span>
            </button>
          </div>
        </div>

        {/* Spreadsheet Data Table */}
        <div className="rounded-3xl bg-cosmic-card border border-purple-500/20 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto max-h-[500px]">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="sticky top-0 z-20 bg-[#16082b] border-b-2 border-purple-600/40 text-[11px] font-black uppercase text-purple-200 tracking-wider">
                <tr>
                  <th className="p-3 pl-4">#</th>
                  <th className="p-3 min-w-[200px]">ชื่อสินค้า (Product Name)</th>
                  <th className="p-3 min-w-[120px]">หมวดหมู่</th>
                  <th className="p-3 min-w-[100px]">สายพันธุ์</th>
                  <th className="p-3 min-w-[100px]">ราคา (฿)</th>
                  <th className="p-3 min-w-[120px]">สถานะสต็อก</th>
                  <th className="p-3 min-w-[150px]">เอฟเฟกต์</th>
                  {customColumns.map((col, idx) => (
                    <th key={idx} className="p-3 min-w-[120px] text-yellow-300 bg-purple-950/40 border-l border-purple-800/40">
                      {col}
                    </th>
                  ))}
                  <th className="p-3 text-center">แนะนำ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-900/20">
                {filteredProducts.map((p, index) => {
                  const cat = categories.find(c => c.id === p.category_id);
                  const isAvailable = p.status === 'AVAILABLE';

                  return (
                    <tr key={p.id} className="hover:bg-purple-900/20 transition">
                      {/* Row Index */}
                      <td className="p-3 pl-4 text-purple-400/60 font-mono text-[11px]">
                        {index + 1}
                      </td>

                      {/* Product Name & Image */}
                      <td className="p-3">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={p.image_url}
                            alt={p.product_name}
                            className="w-9 h-9 rounded-lg object-cover border border-purple-600/30 bg-purple-950 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <span className="font-black text-white block">
                              {p.product_name}
                            </span>
                            <span className="text-[10px] text-purple-400 font-mono">
                              {p.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-md bg-purple-950/70 border border-purple-800/40 text-purple-300 text-[11px] font-bold inline-flex items-center gap-1">
                          <span>{cat?.icon || '🌸'}</span>
                          <span>{cat?.name || 'ทั่วไป'}</span>
                        </span>
                      </td>

                      {/* Strain Type */}
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border ${
                          p.type === 'Indica'
                            ? 'bg-purple-950 text-purple-300 border-purple-700/50'
                            : p.type === 'Sativa'
                            ? 'bg-amber-950/60 text-amber-300 border-amber-600/40'
                            : 'bg-emerald-950/60 text-emerald-300 border-emerald-600/40'
                        }`}>
                          {p.type}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="p-3">
                        <span className="font-black text-yellow-300 font-display">
                          ฿{p.price.toLocaleString()}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="p-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border inline-flex items-center gap-1.5 ${
                          isAvailable
                            ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                            : 'bg-rose-950/60 border-rose-500/50 text-rose-300'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                          <span>{isAvailable ? 'AVAILABLE' : 'SOLD OUT'}</span>
                        </span>
                      </td>

                      {/* Effects */}
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {p.effect_1 && (
                            <span className="text-[10px] bg-purple-950/80 px-1.5 py-0.2 rounded text-purple-300">
                              #{p.effect_1}
                            </span>
                          )}
                          {p.effect_2 && (
                            <span className="text-[10px] bg-purple-950/80 px-1.5 py-0.2 rounded text-purple-300">
                              #{p.effect_2}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Custom Columns Cells */}
                      {customColumns.map((col, cIdx) => (
                        <td key={cIdx} className="p-3 border-l border-purple-900/30 text-purple-200">
                          {p.custom_fields?.[col] ? (
                            <span className="font-semibold text-yellow-200">
                              {p.custom_fields[col]}
                            </span>
                          ) : (
                            <span className="text-purple-400/40 italic">-</span>
                          )}
                        </td>
                      ))}

                      {/* Featured */}
                      <td className="p-3 text-center">
                        {p.featured ? (
                          <span className="text-yellow-300 font-bold text-xs">⭐</span>
                        ) : (
                          <span className="text-purple-400/30">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* QUICK ADD PRODUCT ROW MODAL */}
      {/* ============================================================ */}
      {showAddRowModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowAddRowModal(false)}
        >
          <div 
            className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-gradient-to-b from-[#1f0e3a] to-[#120726] border-2 border-purple-500/40 p-6 sm:p-7 shadow-2xl space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-purple-800/40">
              <h3 className="text-base font-black text-white font-display flex items-center gap-2">
                <Plus className="w-5 h-5 text-yellow-300" />
                <span>เพิ่มแถวสินค้าใหม่ (ADD ROW TO SHEETS & STORE)</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddRowModal(false)}
                className="text-purple-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProductRow} className="space-y-3.5">
              <div>
                <label className="text-xs font-black text-purple-200 block mb-1">
                  ชื่อสินค้า (PRODUCT NAME) *
                </label>
                <input
                  type="text"
                  required
                  value={newProductRow.product_name || ''}
                  onChange={e => setNewProductRow({ ...newProductRow, product_name: e.target.value })}
                  placeholder="เช่น Skywalker OG, Cosmic Diesel"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-purple-950/70 border border-purple-700/50 text-white text-xs sm:text-sm focus:border-yellow-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-purple-200 block mb-1">หมวดหมู่</label>
                  <select
                    value={newProductRow.category_id}
                    onChange={e => setNewProductRow({ ...newProductRow, category_id: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-purple-950/70 border border-purple-700/50 text-white text-xs cursor-pointer"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-purple-200 block mb-1">สายพันธุ์</label>
                  <select
                    value={newProductRow.type}
                    onChange={e => setNewProductRow({ ...newProductRow, type: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-purple-950/70 border border-purple-700/50 text-white text-xs cursor-pointer"
                  >
                    <option value="Hybrid">Hybrid</option>
                    <option value="Indica">Indica</option>
                    <option value="Sativa">Sativa</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-purple-200 block mb-1">ราคา (฿ / 1G)</label>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    required
                    value={newProductRow.price ?? 350}
                    onChange={e => setNewProductRow({ ...newProductRow, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-purple-950/70 border border-purple-700/50 text-white text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-purple-200 block mb-1">สถานะสต็อก</label>
                  <select
                    value={newProductRow.status}
                    onChange={e => setNewProductRow({ ...newProductRow, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-purple-950/70 border border-purple-700/50 text-white text-xs cursor-pointer"
                  >
                    <option value="AVAILABLE">AVAILABLE (พร้อมจำหน่าย)</option>
                    <option value="SOLD OUT">SOLD OUT (สินค้าหมด)</option>
                  </select>
                </div>
              </div>

              {/* Custom Fields Input */}
              {customColumns.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-purple-950/40 border border-purple-800/40 space-y-2.5">
                  <span className="text-xs font-bold text-yellow-300 block">
                    ✨ ข้อมูลช่องเพิ่มเติม (Custom Columns Values):
                  </span>
                  <div className="grid grid-cols-2 gap-2.5">
                    {customColumns.map(col => (
                      <div key={col}>
                        <label className="text-[11px] font-semibold text-purple-300 block mb-1">
                          {col}
                        </label>
                        <input
                          type="text"
                          value={newProductRow.custom_fields?.[col] || ''}
                          onChange={e => {
                            setNewProductRow({
                              ...newProductRow,
                              custom_fields: {
                                ...newProductRow.custom_fields,
                                [col]: e.target.value
                              }
                            });
                          }}
                          placeholder={`ค่าของ ${col}...`}
                          className="w-full px-3 py-1.5 rounded-lg bg-purple-950/80 border border-purple-700/40 text-white text-xs"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-3 flex justify-end gap-2 border-t border-purple-900/40">
                <button
                  type="button"
                  onClick={() => setShowAddRowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-purple-950 text-purple-300 hover:text-white"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-purple-600 to-yellow-500 hover:from-purple-500 hover:to-yellow-400 text-white shadow-lg flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{loading ? 'กำลังบันทึก...' : '+ บันทึกสินค้านี้'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
