import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { FullSlug, joinSegments, pathToRoot } from "../util/path"

const Body: QuartzComponent = ({ children, cfg, fileData }: QuartzComponentProps) => {
  // Unlike a CSS url(), which resolves against the stylesheet, an HTML src
  // resolves against the PAGE. A bare "static/..." would therefore 404 on every
  // nested page, so build the same depth-aware prefix Head.tsx uses.
  const url = new URL(`https://${cfg.baseUrl ?? "example.com"}`)
  const baseDir = fileData.slug === "404" ? (url.pathname as FullSlug) : pathToRoot(fileData.slug!)
  const dayVideo = joinSegments(baseDir, "static/bg/baldursgate-day.mp4")
  const nightVideo = joinSegments(baseDir, "static/bg/baldursgate-night.mp4")

  return (
    <>
      {/* Fixed, decorative, behind everything. Rendered here rather than via a
          layout entry so it exists once on every page type without needing a
          plugin position. Styling is custom.scss section 7, which also gives
          #quartz-body z-index 1 so content paints above it.

          Both videos are rendered on every page with byte-identical markup, so
          the SPA router's diff finds nothing to change and never interrupts
          playback. Neither carries `autoplay`, and `preload="none"` means
          NEITHER FILE IS FETCHED until the script in Head.tsx decides this is a
          desktop viewport whose reader has not asked for reduced motion. On a
          phone, or with reduced motion, the still image is all that loads. */}
      <div class="afa-backdrop" aria-hidden="true">
        <video class="afa-video afa-day" src={dayVideo} muted loop playsInline preload="none" />
        <video class="afa-video afa-night" src={nightVideo} muted loop playsInline preload="none" />
      </div>
      <div id="quartz-body">{children}</div>
    </>
  )
}

export default (() => Body) satisfies QuartzComponentConstructor
