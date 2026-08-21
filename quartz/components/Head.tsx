import { i18n } from "../i18n"
import { FullSlug, getFileExtension, joinSegments, pathToRoot } from "../util/path"
import { CSSResourceToStyleElement, JSResourceToScriptElement } from "../util/resources"
import { googleFontHref, googleFontSubsetHref } from "../util/theme"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { unescapeHTML } from "../util/escape"
import { CustomOgImagesEmitterName } from "../../.quartz/plugins"
export default (() => {
  const Head: QuartzComponent = ({
    cfg,
    fileData,
    externalResources,
    ctx,
  }: QuartzComponentProps) => {
    const titleSuffix = cfg.pageTitleSuffix ?? ""
    const title =
      (fileData.frontmatter?.title ?? i18n(cfg.locale).propertyDefaults.title) + titleSuffix
    const description =
      fileData.frontmatter?.socialDescription ??
      fileData.frontmatter?.description ??
      unescapeHTML(fileData.description?.trim() ?? i18n(cfg.locale).propertyDefaults.description)

    const { css, js, additionalHead } = externalResources

    const url = new URL(`https://${cfg.baseUrl ?? "example.com"}`)
    const path = url.pathname as FullSlug
    const baseDir = fileData.slug === "404" ? path : pathToRoot(fileData.slug!)
    const iconPath = joinSegments(baseDir, "static/icon.png")

    // Url of current page
    const socialUrl =
      fileData.slug === "404" ? url.toString() : joinSegments(url.toString(), fileData.slug!)

    const usesCustomOgImage = ctx.cfg.plugins.emitters.some(
      (e) => e.name === CustomOgImagesEmitterName,
    )
    const ogImageDefaultPath = `https://${cfg.baseUrl}/static/og-image.png`

    const coreStylesheet = css[0]?.content
    const coreScript = js.find(
      (r) => r.loadTime === "beforeDOMReady" && r.contentType === "external",
    )

    return (
      <head>
        <title>{title}</title>
        <meta charSet="utf-8" />
        {/*
          Stop the explorer yanking the page down on load.

          explorer.inline.ts does:
            const saved = sessionStorage.getItem("explorerScrollTop")
            if (saved) el.scrollTop = parseInt(saved, 10)
            else activeElement.scrollIntoView({ behavior: "smooth" })

          That scrollIntoView has no `block` option, so it defaults to "start"
          and scrolls the DOCUMENT to put the active file at the top of the
          viewport. Any page nested deep in the tree therefore opens several
          hundred pixels down, with its own header off screen.

          Seeding the key takes the first branch instead, so the explorer sets
          its own scrollTop and never touches the document. Later navigations
          use whatever the explorer has genuinely stored. This runs in <head>,
          before the explorer script.

          Pre-existing Quartz behaviour, not introduced by the theme.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(sessionStorage.getItem("explorerScrollTop")===null){sessionStorage.setItem("explorerScrollTop","0")}}catch(e){}`,
          }}
        ></script>
        {/* Ambient video backdrop. Starts the one video that matches the current
            theme, and only on a desktop viewport whose reader has not asked for
            reduced motion; on anything else neither file is ever requested,
            because the markup has preload="none" and no autoplay.

            Re-runs on `nav` (fired on first load and on every SPA navigation),
            on `themechange`, and on tab visibility so a backgrounded tab stops
            decoding video. Guarded by a global flag: identical inline head
            scripts are not re-executed by the SPA diff, but the flag makes that
            an assumption we do not depend on. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){if(window.__afaBackdropVideo)return;window.__afaBackdropVideo=true;function allowed(){try{var c=navigator.connection;if(c&&c.saveData)return false;if(!window.matchMedia("(min-width: 1200px)").matches)return false;if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)return false;}catch(e){return false}return true}function apply(){var v=document.querySelectorAll(".afa-video");if(!v.length)return;var dark=document.documentElement.getAttribute("saved-theme")==="dark";var want=dark?"afa-night":"afa-day";for(var i=0;i<v.length;i++){var el=v[i];el.muted=true;if(el.classList.contains(want)&&allowed()&&!document.hidden){var p=el.play();if(p&&p.catch)p.catch(function(){})}else{el.pause()}}}document.addEventListener("nav",apply);document.addEventListener("themechange",apply);document.addEventListener("visibilitychange",apply);try{window.matchMedia("(min-width: 1200px)").addEventListener("change",apply)}catch(e){}})();`,
          }}
        ></script>
        {coreStylesheet && <link rel="preload" href={coreStylesheet} as="style" />}
        {coreScript && coreScript.contentType === "external" && (
          <link rel="preload" href={coreScript.src} as="script" />
        )}
        {cfg.theme.cdnCaching && cfg.theme.fontOrigin === "googleFonts" && (
          <>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" />
            <link rel="stylesheet" href={googleFontHref(cfg.theme)} />
            {/*
              Two faces theme.ts cannot express from quartz.config.yaml:
                - Cinzel, used only for the section rules (see --sectionFont in custom.scss)
                - IM Fell English's italic, for pull quotes and in-world <em>
              The header slot pins weights to [400] so the generated URL stays valid, which
              also means it never requests the italic. Both are picked up here instead.
            */}
            <link
              rel="stylesheet"
              href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600&family=IM+Fell+English:ital@0;1&display=swap"
            />
            {cfg.theme.typography.title && (
              <link rel="stylesheet" href={googleFontSubsetHref(cfg.theme, cfg.pageTitle)} />
            )}
          </>
        )}
        <link rel="preconnect" href="https://cdnjs.cloudflare.com" crossOrigin="anonymous" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        <meta name="og:site_name" content={cfg.pageTitle}></meta>
        <meta property="og:title" content={title} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta property="og:description" content={description} />
        <meta property="og:image:alt" content={description} />

        {!usesCustomOgImage && (
          <>
            <meta property="og:image" content={ogImageDefaultPath} />
            <meta property="og:image:url" content={ogImageDefaultPath} />
            <meta name="twitter:image" content={ogImageDefaultPath} />
            <meta
              property="og:image:type"
              content={`image/${getFileExtension(ogImageDefaultPath) ?? "png"}`}
            />
          </>
        )}

        {cfg.baseUrl && (
          <>
            <meta property="twitter:domain" content={cfg.baseUrl}></meta>
            <meta property="og:url" content={socialUrl}></meta>
            <meta property="twitter:url" content={socialUrl}></meta>
          </>
        )}

        <link rel="icon" href={iconPath} />
        <meta name="description" content={description} />
        <meta name="generator" content="Quartz" />

        {css.map((resource) => CSSResourceToStyleElement(resource, true))}
        {js
          .filter((resource) => resource.loadTime === "beforeDOMReady")
          .map((res) => JSResourceToScriptElement(res, true))}
        {additionalHead.map((resource) => {
          if (typeof resource === "function") {
            return resource(fileData)
          } else {
            return resource
          }
        })}
      </head>
    )
  }

  return Head
}) satisfies QuartzComponentConstructor
