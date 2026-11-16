import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CYBER_EMERALD_PRESET } from "@nexora/design-tokens";
import { ThemePreview } from "./ThemePreview";
import { setByPath } from "./themeStudioUtils";

describe("ThemePreview", () => {
  it("renders the draft tokens and re-renders when a color changes", async () => {
    const { rerender } = render(
      <ThemePreview
        theme={CYBER_EMERALD_PRESET}
        viewport="desktop"
        mode="light"
        revision={0}
      />,
    );

    const frame = screen.getByTitle("Theme preview") as HTMLIFrameElement;
    await waitFor(() =>
      expect(frame.srcdoc).toContain(CYBER_EMERALD_PRESET.colors.light.primary),
    );

    const edited = setByPath(
      CYBER_EMERALD_PRESET,
      "colors.light.primary",
      "#ef4444",
    );

    rerender(
      <ThemePreview
        theme={edited}
        viewport="desktop"
        mode="light"
        revision={1}
      />,
    );

    await waitFor(() => expect(frame.srcdoc).toContain("#ef4444"));
  });

  it("switches to the dark palette in the preview document", async () => {
    render(
      <ThemePreview
        theme={CYBER_EMERALD_PRESET}
        viewport="mobile"
        mode="dark"
        revision={0}
      />,
    );

    const frame = screen.getByTitle("Theme preview") as HTMLIFrameElement;
    await waitFor(() => expect(frame.srcdoc).toContain('class="dark"'));
  });
});
