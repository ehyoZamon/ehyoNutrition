// app/debug/db/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { getDB, persistWeb } from '@/lib/db';

export default function DBDebugPage() {
  const [tables, setTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState('');
  const [columns, setColumns] = useState<string[]>([]);
  const [rows, setRows] = useState<any[]>([]);
  const [sql, setSql] = useState('');
  const [error, setError] = useState('');

  const loadTables = async () => {
    const db = getDB();
    if (!db) return;
    const res = await db.query(
      `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';`
    );
    setTables((res.values ?? []).map((r: any) => r.name));
  };

  useEffect(() => {
    loadTables();
  }, []);

  const loadTableData = async (table: string) => {
    setSelectedTable(table);
    setError('');
    const db = getDB();
    if (!db) return;

    const res = await db.query(`SELECT * FROM ${table};`);
    const values = res.values ?? [];
    setRows(values);
    setColumns(values.length > 0 ? Object.keys(values[0]) : []);
  };

  const runCustomSQL = async () => {
    setError('');
    const db = getDB();
    if (!db) return setError('DB не инициализирована');

    try {
      const isSelect = sql.trim().toLowerCase().startsWith('select');
      if (isSelect) {
        const res = await db.query(sql);
        const values = res.values ?? [];
        setRows(values);
        setColumns(values.length > 0 ? Object.keys(values[0]) : []);
      } else {
        await db.execute(sql);
        await persistWeb();
        setError('Выполнено успешно');
        await loadTables();
      }
    } catch (e: any) {
      setError(e.message);
    }
  };

  const deleteRow = async (id: number) => {
    const db = getDB();
    if (!db || !selectedTable) return;
    await db.run(`DELETE FROM ${selectedTable} WHERE id = ?`, [id]);
    await persistWeb();
    loadTableData(selectedTable);
  };

  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
      <h2>DB Debug Panel</h2>

      <div style={{ marginBottom: 16 }}>
        <strong>Таблицы:</strong>{' '}
        {tables.map((t) => (
          <button
            key={t}
            onClick={() => loadTableData(t)}
            style={{
              margin: '0 4px',
              fontWeight: t === selectedTable ? 'bold' : 'normal',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      <textarea
        value={sql}
        onChange={(e) => setSql(e.target.value)}
        placeholder="Произвольный SQL, например: PRAGMA table_info(food_entries);"
        rows={3}
        style={{ width: '100%', fontFamily: 'monospace' }}
      />
      <button onClick={runCustomSQL}>Выполнить</button>

      {error && (
        <p style={{ color: error === 'Выполнено успешно' ? 'green' : 'red' }}>{error}</p>
      )}

      {rows.length > 0 && (
        <table border={1} cellPadding={6} style={{ marginTop: 12, borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c}>{c}</th>
              ))}
              {selectedTable && <th>Действия</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                {columns.map((c) => (
                  <td key={c}>{String(row[c])}</td>
                ))}
                {selectedTable && (
                  <td>
                    <button onClick={() => deleteRow(row.id)}>Удалить</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}