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
  
  // Ref for the main container (the input button) to calculate its position
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  
  // NEW: Ref for the Portal Menu Container to measure its height
  const menuRef = React.useRef<HTMLDivElement>(null); 
  
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
        const isClickInsidePopup = menuRef.current?.contains(event.target as Node);
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

  // --- NEW: Dynamic Positioning Effect ---
  React.useEffect(() => {
    if (!isOpen || !dropdownRef.current || !menuRef.current) return;

    // 1. Get the position of the input button
    const inputRect = dropdownRef.current.getBoundingClientRect();
    
    // 2. Get the actual height of the menu
    const menuElement = menuRef.current;
    const menuHeight = menuElement.offsetHeight; // This is the key change!

    // 3. Calculate Top Position: Input Top - Menu Height - Gap (4px)
    const newTop = inputRect.top - menuHeight - 4;

    // 4. Calculate Width (as before: min of input width or preferred width)
    const minWidth = inputRect.width;
    const preferredWidth = 300; 
    const listWidth = Math.max(minWidth, preferredWidth);

    // 5. Apply the position and layout styles directly to the menu element
    menuElement.style.top = `${newTop}px`;
    menuElement.style.left = `${inputRect.left}px`;
    menuElement.style.width = `${listWidth}px`;
    menuElement.style.zIndex = '9999';
    menuElement.style.opacity = '1'; // Make it visible
    
    // Note: The dependency array includes 'searchQuery' because changing the filter 
    // might change the number of visible options, which could change the total menu height.
  }, [isOpen, searchQuery]); 

  const selectedLabel = allOptions.find(opt => opt.id === selection)?.label || 'None';

  // --- PORTAL RENDERING LOGIC ---
  const renderPortal = () => {
    if (!isOpen || !dropdownRef.current) return null;

    const style: React.CSSProperties = {
      position: 'absolute',
      opacity: 0, // Start invisible to prevent flicker before positioning
      // Initial positioning values are not critical since they are overridden by the useEffect
    };

    return ReactDOM.createPortal(
      <div 
        className="chatdrop-options-list is-portaled" 
        ref={menuRef} // <--- Attach the menuRef here
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