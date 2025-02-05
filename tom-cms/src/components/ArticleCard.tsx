import React from 'react';
import Link from 'next/link';
import styles from './ArticleCard.module.css';

interface ArticleCardProps {
  title: string;
  author?: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  date?: string;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ title, author, slug, description, imageUrl, date }) => {
  return (
    <div className={styles.card}>
      <div className={styles.content}>
        <Link href={`/article/${slug}`} className={styles.link}>
            <p className={styles.title}>
                {title}
            </p>
        </Link>
        <div className={styles.meta}>
          <Link href={`/search?author=${author}`} className={styles.link}>
            <p className={styles.author}>By {author ?? "Unknown author"}</p>
          </Link>
          <p className={styles.date}>{date}</p>
        </div>
        {description && <p className={styles.description}>{description}</p>}
      </div>
    </div>
  );
};

export default ArticleCard;
