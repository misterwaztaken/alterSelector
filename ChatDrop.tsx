import { React, ReactDOM } from "@webpack/common"; // Assuming ReactDOM is available via @webpack/common
import { loadSelections, saveSelections } from "./dataStore";
import { getPrefixEntries } from "./settings";
import "./styles.css";

interface ChatDropProps {
  channel?: { id?: string } | null;
  settings?: any;
}

const SearchableChatDrop: React.FC<ChatDropProps> = ({ channel }) => {
  const channelId = channel?.id ?? "global";
  const [selection, setSelection] = React.useState<string>("none");
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  
  // Ref for the main container to calculate its position
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  
  const entries = getPrefixEntries();
  const allOptions = [
    { id: "none", label: "None" },
    ...(entries ?? [])
  ];

  // --- Data Loading & Saving (Unchanged) ---
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      const map = await loadSelections();
      const sel = map[channelId] ?? "none";
      if (mounted) setSelection(sel);
    })();
    return () => { mounted = false; };
  }, [channelId]);

  const handleSelect = async (val: string) => {
    setSelection(val);
    const map = await loadSelections();
    map[channelId] = val;
    await saveSelections(map);
    
    setIsOpen(false);
    setSearchQuery("");
  };

  const filteredOptions = allOptions.filter(opt =>
    opt.label.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // --- Closing Logic (Slightly modified to check for the portal element) ---
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        // Also check if the click was inside the popup (which is now portaled)
        const isClickInsidePopup = document.querySelector('.chatdrop-options-list.is-portaled')?.contains(event.target as Node);
        if (!isClickInsidePopup) {
            setIsOpen(false);
            setSearchQuery("");
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const selectedLabel = allOptions.find(opt => opt.id === selection)?.label || 'None';

  // --- PORTAL RENDERING LOGIC ---
  const renderPortal = () => {
    if (!isOpen || !dropdownRef.current) return null;

    const rect = dropdownRef.current.getBoundingClientRect();
    
    // --- NEW LOGIC HERE ---
    const minWidth = rect.width; // The width of the input field
    const preferredWidth = 300; // Define your desired minimum width for the popup
    const listWidth = Math.max(minWidth, preferredWidth); // Use the larger of the two
    // ----------------------
    
    const listHeight = 280; 

    const style: React.CSSProperties = {
      position: 'absolute',
      // Top position: input top - list height - gap (4px)
      // NOTE: You might need to adjust the calculation slightly to account for the listHeight.
      // If the list height is dynamic, this fixed value will be inaccurate.
      top: rect.top - listHeight - 4, 
      left: rect.left,
      width: listWidth, // <-- Now uses the calculated wider width
      zIndex: 9999, 
    };

    // Use ReactDOM.createPortal to render the list into the document body
    return ReactDOM.createPortal(
      <div 
        className="chatdrop-options-list is-portaled" 
        style={style}
      >
        <input
          type="text"
          className="chatdrop-search-input"
          placeholder="Search prefixes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onClick={(e) => e.stopPropagation()} 
        />
        
        <div className="chatdrop-options-scroll">
          {filteredOptions.length > 0 ? (
            filteredOptions.map(opt => (
              <div 
                key={opt.id} 
                className={`chatdrop-option ${selection === opt.id ? 'is-selected' : ''}`}
                onClick={() => handleSelect(opt.id)}
              >
                {opt.label}
              </div>
            ))
          ) : (
            <div className="chatdrop-no-results">
              No matching prefixes found.
            </div>
          )}
        </div>
      </div>,
      // Target the document body or a dedicated high-level container
      document.body 
    );
  };

  return (
    <div className="chatdrop-container" ref={dropdownRef}>
      <div 
        className={`chatdrop-custom-select ${isOpen ? 'is-open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Prefix selection"
      >
        <div className="chatdrop-display-value">
          {selectedLabel}
        </div>
        <div className="chatdrop-arrow"></div>
      </div>

      {renderPortal()}
    </div>
  );
};

export default SearchableChatDrop;