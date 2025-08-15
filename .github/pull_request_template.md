## 📋 Search-First Compliance Checklist

### ✅ Required for ALL PRs:
- [ ] I have searched existing solutions before coding
- [ ] FlexSearch was evaluated for any search features
- [ ] v0.dev was considered for UI components
- [ ] No forbidden patterns detected by pre-commit hooks

### 🏷️ Evidence of Tool Usage:
<!-- Check all that apply -->
- [ ] Added `@research:search` comment in code
- [ ] Added `@v0:component-name` for generated UI
- [ ] Added `@flexsearch:implementation` for search
- [ ] Added `@approved` for justified custom code (requires team approval)

### 🔍 Search Command Execution:
```bash
# Paste output of research commands here (if applicable)
pnpm research:search [your search terms]
```

### 🎨 v0.dev Generation (for UI components):
<!-- If you created UI components -->
- Component name: 
- v0.dev URL: 
- Complexity score from checker: 

### 📝 Description
<!-- Provide a brief description of your changes -->


### 🧪 Testing
<!-- Describe how you tested your changes -->
- [ ] All tests pass
- [ ] Manual testing completed
- [ ] No console errors

### 💡 Justification for Custom Code (if applicable):
<!-- Only fill this if you wrote custom code instead of using recommended tools -->
**Why existing tools don't meet requirements:**


**Architecture team approval:**
- Approved by: @username
- Approval date: 
- Ticket/Discussion link: 

### 📊 Metrics
<!-- Auto-calculated by CI -->
- FlexSearch implementations: 
- v0.dev components: 
- Time saved estimate: 
- Compliance score: 

---
*By submitting this PR, I confirm that I've followed the low-code/search-first development practices.*