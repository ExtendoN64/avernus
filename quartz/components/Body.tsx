import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import HellscapeBackdrop from "./HellscapeBackdrop"

const Body: QuartzComponent = ({ children }: QuartzComponentProps) => {
  return (
    <>
      {/* Fixed, decorative, behind everything. Rendered here rather than via a
          layout entry so it exists once on every page type without needing a
          plugin position. #quartz-body takes z-index: 1 in custom.scss so all
          content paints above it. */}
      <HellscapeBackdrop />
      <div id="quartz-body">{children}</div>
    </>
  )
}

export default (() => Body) satisfies QuartzComponentConstructor
