import { useEffect, useState } from 'react';

function FilterBar({ filters, onChange }) {
  const [search, setSearch] = useState(filters.search || '');

  useEffect(() => {
    const timer = setTimeout(() => {
      onChange({ search });
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setSearch(filters.search || '');
  }, [filters.search]);

  const handleSelectChange = (e) => {
    onChange({ [e.target.name]: e.target.value });
  };

  const handleStatusChange = (value) => {
    onChange({ status: value });
  };

  const statusOptions = [
    { value: '', label: 'All' },
    { value: 'todo', label: 'To Do' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'done', label: 'Done' },
  ];

  return (
    <div className="filter-toolbar">
      <div className="field-group field-group--search">
        <label htmlFor="search">Search</label>
        <input
          id="search"
          type="text"
          value={search}
          placeholder="Search by title"
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="field-group">
        <label htmlFor="priority">Priority</label>
        <select id="priority" name="priority" value={filters.priority || ''} onChange={handleSelectChange}>
          <option value="">All</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      <div className="field-group">
        <label htmlFor="sortBy">Sort By</label>
        <select id="sortBy" name="sortBy" value={filters.sortBy || 'createdAt'} onChange={handleSelectChange}>
          <option value="createdAt">Created</option>
          <option value="dueDate">Due Date</option>
          <option value="priority">Priority</option>
        </select>
      </div>

      <div className="field-group">
        <label htmlFor="order">Order</label>
        <select id="order" name="order" value={filters.order || 'desc'} onChange={handleSelectChange}>
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </div>

      <div className="status-toggle-group" role="group" aria-label="Filter by status">
        {statusOptions.map((option) => {
          const isActive = (filters.status || '') === option.value;
          return (
            <button
              key={option.value}
              type="button"
              className={`status-toggle ${isActive ? 'active' : ''}`}
              data-status={option.value}
              onClick={() => handleStatusChange(option.value)}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default FilterBar;
