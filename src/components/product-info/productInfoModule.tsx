import type { ReactNode } from "react";
import Image from "next/image";
import styles from "./productInfoModule.module.css";

// Узел дерева: либо текст (content), либо список (items) из строк и вложенных узлов.
export type ProductInfoNode = {
  title: string;
  content?: string;
  items?: (string | ProductInfoNode)[];
};

export type ProductInfoData = {
  id?: string;
  title: string;
  image?: string; // если нет — иконка не выводится
  content?: ProductInfoNode[];
};

const HEADINGS = ["h2", "h3", "h4", "h5", "h6"] as const;

const hasChildren = (item: string | ProductInfoNode): item is ProductInfoNode =>
  typeof item !== "string" && !!item.items?.length;

// Подряд идущие строки и «листовые» узлы собираются в один <ul>;
// узел со своими items становится вложенным разделом.
function Items({
  items,
  depth,
}: {
  items: (string | ProductInfoNode)[];
  depth: number;
}) {
  const blocks: ReactNode[] = [];
  let buffer: (string | ProductInfoNode)[] = [];

  const flush = () => {
    if (buffer.length === 0) return;
    const rows = buffer;
    blocks.push(
      <ul key={`list-${blocks.length}`} className={styles["list"]}>
        {rows.map((item, i) => (
          <li key={i} className={styles["list-item"]}>
            {typeof item === "string"
              ? item
              : item.content
                ? `${item.title}: ${item.content}`
                : item.title}
          </li>
        ))}
      </ul>
    );
    buffer = [];
  };

  items.forEach((item, i) => {
    if (hasChildren(item)) {
      flush();
      blocks.push(<NodeView key={`node-${i}`} node={item} depth={depth} />);
    } else {
      buffer.push(item);
    }
  });
  flush();

  return <>{blocks}</>;
}

function NodeView({ node, depth }: { node: ProductInfoNode; depth: number }) {
  const Heading = HEADINGS[Math.min(depth, HEADINGS.length - 1)];
  const headingClass = styles[`heading-${Math.min(depth, 2)}`];

  return (
    <section className={styles["section"]}>
      <Heading className={headingClass}>{node.title}</Heading>
      {node.content && <p className={styles["text"]}>{node.content}</p>}
      {node.items && node.items.length > 0 && (
        <Items items={node.items} depth={depth + 1} />
      )}
    </section>
  );
}

const ProductInfoModule = ({ data }: { data: ProductInfoData }) => {
  return (
    <article className={styles["article"]}>
      <header
        className={[styles["hero"], data.image ? "" : styles["hero--no-image"]].join(" ")}
      >
        {data.image && (
          <Image
            src={data.image}
            alt=""
            width={80}
            height={80}
            className={styles["hero-image"]}
          />
        )}
        <h1 className={styles["title"]}>{data.title}</h1>
      </header>

      {data.content?.map((node, i) => (
        <NodeView key={i} node={node} depth={0} />
      ))}
    </article>
  );
};

export default ProductInfoModule;
