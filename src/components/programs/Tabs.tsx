import { useEffect, useState, Key } from "react";

export interface Tab {
  title: string;
  content: React.ReactNode;
  key: Key;
}

export const Tabs: React.FC<{
  tabs: Tab[];
}> = ({ tabs }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (activeIndex >= tabs.length) {
      setActiveIndex(tabs.length - 1);
    }
  }, [activeIndex, tabs.length]);

  return (
    <>
      {tabs.length > 1 && (
        <div className="tabs-wrapper">
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`${activeIndex === index ? "active" : "inactive"}`}
            >
              {tab.title}
            </button>
          ))}
        </div>
      )}

      <div className="tabs-content-container">
        {tabs.map((tab, index) => (
          <div
            key={tab.key}
            style={{ display: activeIndex === index ? "flex" : "none" }}
          >
            {tab.content}
          </div>
        ))}
      </div>
    </>
  );
};
