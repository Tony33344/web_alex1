-- Find duplicate program slugs
SELECT slug, COUNT(*) as count, array_agg(id) as ids
FROM programs
GROUP BY slug
HAVING COUNT(*) > 1;

-- Delete duplicates, keeping the one with the lowest ID (oldest)
DELETE FROM programs
WHERE id IN (
  SELECT id
  FROM programs
  WHERE id NOT IN (
    SELECT MIN(id)
    FROM programs
    GROUP BY slug
  )
);

-- Verify no duplicates remain
SELECT slug, COUNT(*) as count
FROM programs
GROUP BY slug
HAVING COUNT(*) > 1;
