const fs = require('fs');
const file = 'apps/web/app/friends/page.tsx';
let code = fs.readFileSync(file, 'utf8');

// Replace handleSearch with executeSearch and handleSearch, and add useEffect
const newSearchLogic = `
  useEffect(() => {
    if (activeTab !== 'search') return;
    
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim() && currentUser) {
        executeSearch(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, activeTab, currentUser]);

  const executeSearch = async (query: string) => {
    setSearching(true);
    const { data, error } = await supabase
      .from('users')
      .select('id, username, real_name, trust_score')
      .neq('id', currentUser.id)
      .or(\`username.ilike.%\${query.trim()}%,real_name.ilike.%\${query.trim()}%\`)
      .limit(10);
      
    if (error) toast.error("Search Error: " + error.message);
    setSearchResults(data || []);
    setSearching(false);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || !currentUser) return;
    executeSearch(searchQuery);
  };
`;

code = code.replace(
  /const handleSearch = async \(e: React\.FormEvent\) => \{[\s\S]*?setSearching\(false\);\n\s*\};/,
  newSearchLogic.trim()
);

fs.writeFileSync(file, code);
