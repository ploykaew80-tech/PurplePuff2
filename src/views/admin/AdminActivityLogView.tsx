import React, { useState } from 'react';
import { History, Clock, User as UserIcon, Download, Filter, Search } from 'lucide-react';
import type { ActivityLog } from '../../types';

interface AdminActivityLogViewProps {
  logs: ActivityLog[];
}

export const AdminActivityLogView: React.FC<AdminActivityLogViewProps> = ({ logs }) => {
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  const filteredLogs = logs.filter(log => {
    if (actionFilter !== 'ALL' && log.action !== actionFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchUser = log.user_name.toLowerCase().includes(q);
      const matchAction = log.action.toLowerCase().includes(q);
      const matchType = log.entity_type.toLowerCase().includes(q);
      const matchMeta = JSON.stringify(log.metadata || {}).toLowerCase().includes(q);
      if (!matchUser && !matchAction && !matchType && !matchMeta) return false;
    }
    return true;
  });

  const exportCsv = () => {
    const headers = ['ID', 'Timestamp', 'User', 'Action', 'Entity Type', 'Entity ID', 'Details'];
    const rows = filteredLogs.map(l => [
      l.id,
      l.timestamp,
      `"${l.user_name}"`,
      `"${l.action}"`,
      `"${l.entity_type}"`,
      l.entity_id || '',
      `"${JSON.stringify(l.metadata || {}).replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `purple_puff_activity_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="admin-activity-log-view" className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white font-display">
            ACTIVITY LOG
          </h2>
          <p className="text-xs text-purple-300/80">
            บันทึกประวัติกิจกรรมและการดำเนินงานทั้งหมดภายในระบบแอดมิน ({logs.length} รายการ)
          </p>
        </div>

        <button
          onClick={exportCsv}
          className="py-2.5 px-4 rounded-xl font-bold text-xs bg-purple-900/50 hover:bg-purple-800 text-purple-200 border border-purple-700/40 flex items-center justify-center gap-1.5 transition cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>EXPORT CSV</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center gap-2">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหาชื่อผู้ดำเนินการ กิจกรรม หรือข้อมูล..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-purple-950/40 border border-purple-800/40 text-xs text-white placeholder:text-purple-400/40 focus:border-purple-400 focus:outline-none"
          />
        </div>

        <select
          value={actionFilter}
          onChange={e => setActionFilter(e.target.value)}
          className="w-full sm:w-auto px-3 py-2 rounded-xl bg-purple-950/60 border border-purple-800/40 text-xs font-semibold text-white focus:border-purple-400 focus:outline-none cursor-pointer"
        >
          <option value="ALL">กิจกรรมทั้งหมด</option>
          <option value="LOGIN">LOGIN</option>
          <option value="CREATE_PRODUCT">CREATE_PRODUCT</option>
          <option value="UPDATE_PRODUCT">UPDATE_PRODUCT</option>
          <option value="UPDATE_PRODUCT_STATUS">UPDATE_PRODUCT_STATUS</option>
          <option value="DELETE_PRODUCT">DELETE_PRODUCT</option>
          <option value="UPDATE_SETTINGS">UPDATE_SETTINGS</option>
          <option value="UPDATE_ORDER_STATUS">UPDATE_ORDER_STATUS</option>
        </select>
      </div>

      {/* Activity Table */}
      <div className="rounded-3xl bg-cosmic-card border border-purple-500/20 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#180b33] border-b border-purple-900/40 text-purple-300 uppercase tracking-wider font-bold">
              <tr>
                <th className="p-3.5 pl-5">วัน-เวลา</th>
                <th className="p-3.5">ผู้ดำเนินการ</th>
                <th className="p-3.5">Action</th>
                <th className="p-3.5">Entity</th>
                <th className="p-3.5 pr-5">รายละเอียดเพิ่มเติม</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-900/30 text-purple-200">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-purple-400/60">
                    ไม่พบรายการบันทึกกิจกรรม
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => {
                  const logDate = new Date(log.timestamp);
                  const dateStr = logDate.toLocaleDateString('th-TH', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  });
                  const timeStr = logDate.toLocaleTimeString('th-TH', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  });

                  return (
                    <tr key={log.id} className="hover:bg-purple-900/20 transition">
                      <td className="p-3.5 pl-5 text-purple-300/80 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-purple-400" />
                          <span>{dateStr} {timeStr}</span>
                        </div>
                      </td>

                      <td className="p-3.5 font-bold text-white whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <UserIcon className="w-3.5 h-3.5 text-purple-400" />
                          <span>{log.user_name}</span>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-900/60 text-purple-200 border border-purple-700/40">
                          {log.action}
                        </span>
                      </td>

                      <td className="p-3.5 text-purple-300/80">
                        {log.entity_type}
                      </td>

                      <td className="p-3.5 pr-5 text-purple-300/70 font-mono text-[11px] truncate max-w-xs">
                        {log.metadata ? JSON.stringify(log.metadata) : '-'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
