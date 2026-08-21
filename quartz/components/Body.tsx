import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

const Body: QuartzComponent = ({ children }: QuartzComponentProps) => {
  return (
    <>
      {/* Fixed, decorative, behind everything. Rendered here rather than via a
          layout entry so it exists once on every page type without needing a
          plugin position. All of it is CSS: see custom.scss section 7, which
          also gives #quartz-body z-index 1 so content paints above it. */}
      <div class="afa-backdrop" aria-hidden="true"></div>
      <div id="quartz-body">{children}</div>
    </>
  )
}

export default (() => Body) satisfies QuartzComponentConstructor
