/* PrefixManager.tsx 
 * meant to be used with the AlterSelector Vencord plugin  
 * Made with <3 by kazwaztaken */

import { React, Forms } from "@webpack/common";
import { PrefixEntry, getPrefixEntries, setPrefixEntries } from "./settings";

const { FormTitle, FormText, FormSection } = Forms;

export default function PrefixManager() {
  // use local state for editing then persist via helpers
  const [entries, setEntries] = React.useState<PrefixEntry[]>(() => getPrefixEntries());
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [currentEdit, setCurrentEdit] = React.useState<Omit<PrefixEntry, "id"> | null>(null);
  const [isDeleteConfirmed, setIsDeleteConfirmed] = React.useState(false);

  const selectedEntry = entries.find(e => e.id === selectedId);

  React.useEffect(() => {
    if (selectedEntry) setCurrentEdit({ label: selectedEntry.label, text: selectedEntry.text });
    else setCurrentEdit(null);

    setIsDeleteConfirmed(false);
  }, [selectedId, selectedEntry]);

  const handleAddEntry = () => {
    const newEntry: PrefixEntry = { id: crypto.randomUUID(), label: "New Entry", text: "" };
    const updated = [...entries, newEntry];
    setEntries(updated);
    setPrefixEntries(updated);
    setSelectedId(newEntry.id);
  };

  const handleApplyChanges = () => {
    if (!selectedId || !currentEdit) return;
    const updated = entries.map(e => e.id === selectedId ? { ...e, ...currentEdit } : e);
    setEntries(updated);
    setPrefixEntries(updated);
  };

  const handleDeleteEntry = () => {
    if (!selectedId || !isDeleteConfirmed) return;
    const updated = entries.filter(e => e.id !== selectedId);
    setEntries(updated);
    setPrefixEntries(updated);
    setSelectedId(updated[0]?.id ?? null);
    setIsDeleteConfirmed(false);
  };

  const selectOptions = entries.map(e => ({ label: e.label, value: e.id }));

  return (
    <div className="pm-section">
      <FormTitle tag="h2">Chat Prefix Menu</FormTitle>

      <div className="pm-row">
        <button onClick={handleAddEntry}>New Prefix</button>
      </div>

      {entries.length > 0 && (
        <div className="pm-row">
          <label className="pm-label">Select Entry</label>
          <select title="Select entry" className="pm-field" value={selectedId ?? ""} onChange={e => setSelectedId(e.target.value || null)}>
            {entries.map(e => <option key={e.id} value={e.id}>{e.label}</option>)}
          </select>
        </div>
      )}

      {selectedEntry && currentEdit && (
        <>
          <div className="pm-row">
            <label className="pm-label">Prefix Name</label>
            <input title="Prefix label" className="pm-field" type="text" value={currentEdit.label} onChange={e => setCurrentEdit(c => ({ ...c!, label: e.target.value }))} />
          </div>

          <div className="pm-row">
            <label className="pm-label">Prefix Text</label>
            <input title="Prefix text" className="pm-field" type="text" value={currentEdit.text} onChange={e => setCurrentEdit(c => ({ ...c!, text: e.target.value }))} />
          </div>

          <div className="pm-actions">
            <button className="applyButton" onClick={handleApplyChanges}>Apply</button>
            <div className="pm-spacer" />
            <label className="pm-checkbox">
              <input type="checkbox" checked={isDeleteConfirmed} onChange={e => setIsDeleteConfirmed(e.target.checked)} />
              Confirm delete
            </label>
            <button onClick={handleDeleteEntry} disabled={!isDeleteConfirmed} className={isDeleteConfirmed ? 'pm-delete' : 'pm-delete-disabled'}>Delete</button>
          </div>
        </>
      )}

      {!selectedEntry && entries.length > 0 && <FormText>Select an entry to edit.</FormText>}
      {entries.length === 0 && <FormText>Create your first prefix using the button above.</FormText>}
    </div>
  );
}
