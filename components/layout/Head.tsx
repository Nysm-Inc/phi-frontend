import { default as NextHead } from "next/head";
import { frontendURL } from "~/constants";

const Head = () => {
  const title = "Phi";
  const description = "Phi visualizes the Ethereum as Metaverse";
  const url = frontendURL;
  const imgUrl = "https://storage.googleapis.com/phi-demo/phi-ogp.png";
  const imgWidth = 1600;
  const imgHeight = 1064;

  return (
    <NextHead>
      <title>{title}</title>
      <meta name="viewport" content="width=device-width,initial-scale=1.0" />
      <meta name="description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:site_name" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:image" content={imgUrl} />
      <meta property="og:image:width" content={String(imgWidth)} />
      <meta property="og:image:height" content={String(imgHeight)} />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:site" content="@phi_xyz" />
      <meta name="twitter:creator" content="@phi_xyz" />
    </NextHead>
  );
};

export default Head;
