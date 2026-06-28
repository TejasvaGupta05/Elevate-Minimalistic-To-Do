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

  return (
    <div className="card filter-bar">
      <div className="field-group">
        <label htmlFor="search">Search</label>
        <input
          id="search"
          type="text"
          value={search}
          placeholder="Search by title"
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="filter-grid">
        <div className="field-group">
          <label htmlFor="status">Status</label>
          <select id="status" name="status" value={filters.status || ''} onChange={handleSelectChange}>
            <option value="">All</option>
            <option value="todo">Todo</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
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
      </div>
    </div>
  );
}

export default FilterBar;
