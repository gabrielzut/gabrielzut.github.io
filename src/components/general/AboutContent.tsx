import { FC } from "react";

interface AboutContentProps {
  title: string;
  version: string;
  description: string;
}

export const AboutContent: FC<AboutContentProps> = ({
  title,
  version,
  description,
}) => {
  return (
    <div className="about-content">
      <p>
        <b>{title}</b>
      </p>
      <p>{version}</p>
      <p>{description}</p>
      <p>
        Made by{" "}
        <a
          href="https://github.com/gabrielzut"
          target="_blank"
          rel="noreferrer"
        >
          Gabriel Zutião
        </a>
      </p>
    </div>
  );
};
