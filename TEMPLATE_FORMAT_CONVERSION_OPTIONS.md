# Template AI Format Conversion Options

## Comparison Table

| Format | Readability | Editability | Export | Complexity | User-Friendly |
|--------|-------------|-------------|--------|------------|---------------|
| **Rich Text/HTML** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Markdown** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ |
| **Structured Text** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐ | ⭐⭐⭐⭐⭐ |
| **Rich Editor** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Multiple Options** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

## Recommended Implementation Strategy

### Phase 1: Quick Win (Immediate)
**Structured Text Format** - Paling mudah dan cepat diimplementasi
- Convert JSON ke format text terstruktur
- Tambah toggle "Raw JSON" vs "Formatted Text"
- Langsung bisa digunakan guru

### Phase 2: Enhanced (Short-term)
**Rich Text Editor** - Terbaik untuk user experience
- Implement rich text editor (TinyMCE/Quill)
- WYSIWYG editing
- Better formatting options

### Phase 3: Advanced (Long-term)
**Multiple Format Support** - Fleksibilitas maksimal
- Format switcher (Text/Markdown/HTML)
- Export to Word/PDF
- Template sharing dengan format preservation

## Technical Implementation Details

### 1. JSON to Structured Text Converter
```javascript
const formatTemplateStructure = (jsonData) => {
  // Convert JSON templateStructure to readable text
  if (typeof jsonData === 'object' && jsonData !== null) {
    // Format as structured text
    return convertToStructuredText(jsonData);
  }
  return jsonData;
};
```

### 2. Toggle View Component
```jsx
const [viewMode, setViewMode] = useState('formatted'); // 'formatted' | 'raw'

// Toggle between formatted and raw JSON
<div className="flex items-center space-x-2">
  <Switch 
    checked={viewMode === 'formatted'}
    onCheckedChange={(checked) => setViewMode(checked ? 'formatted' : 'raw')}
  />
  <Label>Format Template</Label>
</div>
```

### 3. Rich Text Editor Integration
```jsx
import { Editor } from '@tinymce/tinymce-react';

<Editor
  value={formattedTemplate}
  onEditorChange={handleTemplateChange}
  init={{
    height: 400,
    menubar: false,
    plugins: ['lists', 'link', 'image', 'charmap', 'preview', 'searchreplace'],
    toolbar: 'undo redo | formatselect | bold italic | alignleft aligncenter alignright | bullist numlist outdent indent'
  }}
/>
```
