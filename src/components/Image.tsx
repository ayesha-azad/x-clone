"use client";

import { IKImage } from "imagekitio-next";

type ImageType = {
  path?: string;
  src?: string;
  w?: number;
  h?: number;
  alt: string;
  className?: string;
  tr?: boolean;
};

const urlEndpoint = process.env.NEXT_PUBLIC_URL_ENDPOINT;

if (!urlEndpoint) {
  throw new Error('Error: Please add urlEndpoint to .env or .env.local')
}

const Image = ({ path, src, w, h, alt, className, tr }: ImageType) => {
  // Option B: Support local files from the public folder
  if (path && (path.startsWith("icons/") || path.startsWith("general/") || path.startsWith("svg/"))) {
    return (
      <img
        src={`/${path}`}
        alt={alt}
        width={w}
        height={h}
        className={className}
      />
    );
  }

  const isFullUrl = path?.startsWith("http");

  return (
    <IKImage
      urlEndpoint={urlEndpoint}
      path={!isFullUrl ? path : undefined}
      src={isFullUrl ? path : src}
      {...(tr
        ? { transformation: [{ width: `${w}`, height: `${h}` }] }
        : { width: w, height: h })}
      lqip={{ active: true, quality: 20 }}
      alt={alt}
      className={className}
    />
  );
};

export default Image;
