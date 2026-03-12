
import Tag  from './Tag';

export default function TagList({tags}: {tags: string[]}) {
	
  if (!tags || tags.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-2`}>
      {tags.map((tag, index) => (
        <Tag key={`${tag}-${index}`}>{tag}</Tag>
      ))}
    </div>
  );
}