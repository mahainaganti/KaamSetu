export default function TableSkeleton({ columns, rows = 5 }: { columns: number; rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={rowIndex}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <td key={colIndex}>
              {colIndex === 0 ? (
                <div className="name-cell">
                  <span className="skeleton skeleton-avatar" />
                  <span className="skeleton skeleton-text" />
                </div>
              ) : (
                <span className="skeleton skeleton-text" />
              )}
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
