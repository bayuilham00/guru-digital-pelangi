# End-to-End Testing Checklist

## Teacher Planner Module

### Plans Tab
- [ ] Login as teacher
- [ ] Navigate to Teacher Planner → Plans
- [ ] View plans list with pagination
- [ ] Create new plan
- [ ] Edit existing plan
- [ ] Delete plan
- [ ] Bulk operations (delete, status update)
- [ ] Filter by subject, class, status
- [ ] Sort by date, name, status
- [ ] Search functionality

### Templates Tab
- [ ] Navigate to Teacher Planner → Templates
- [ ] View templates list with pagination
- [ ] Create new template manually
- [ ] Generate template with AI (Gemini)
- [ ] Edit existing template
- [ ] Delete template
- [ ] Bulk operations (delete, duplicate, export)
- [ ] Filter by subject, grade level, difficulty
- [ ] Sort by date, name, usage count
- [ ] Search functionality

### AI Template Generation
- [ ] Click "Generate with AI" button
- [ ] Fill in required fields (subject, topic, duration, grade level)
- [ ] Verify AI generates appropriate content
- [ ] Save generated template
- [ ] Edit AI-generated content
- [ ] Verify template appears in list

### Integration Tests
- [ ] Templates can be used in Plans
- [ ] Subject and class data loads correctly
- [ ] User authentication works across all actions
- [ ] Error handling displays appropriate messages
- [ ] Loading states work correctly

## Test Commands
```bash
# Start backend
cd backend
bun run dev

# Start frontend
bun run dev

# Open browser to http://localhost:8080
```
