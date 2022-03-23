import { useRouter } from "next/router";
import Script from "next/script";
import { useEffect } from "react";
import { GA_ID } from "~/constants";

// type ContactEvent = {
//   action: "submit_form";
//   category: "contact";
// };

// type ClickEvent = {
//   action: "click";
//   category: "other";
// };

// export type Event = (ContactEvent | ClickEvent) & {
//   label?: Record<string, string | number | boolean>;
//   value?: string;
// };

// export const event = ({ action, category, label, value = "" }: Event) => {
//   window.gtag("event", action, {
//     event_category: category,
//     event_label: label ? JSON.stringify(label) : "",
//     value,
//   });
// };

export const pageview = (path: string) => {
  window.gtag("config", GA_ID, {
    page_path: path,
  });
};

export const usePageView = () => {
  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = (path: string) => {
      pageview(path);
    };

    router.events.on("routeChangeComplete", handleRouteChange);
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router.events]);
};

export const GoogleAnalytics = () => (
  <>
    <Script id="" defer src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
    <Script
      id="ga"
      defer
      dangerouslySetInnerHTML={{
        __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `,
      }}
      strategy="afterInteractive"
    />
  </>
);
