import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CYBER_EMERALD_PRESET } from "@nexora/design-tokens";
import { TypographyPanel } from "./TypographyPanel";
import type { ConfigMutator } from "../themeStudioUtils";

describe("TypographyPanel", () => {
  it("changes the heading font using an approved family", () => {
    const mutate = vi.fn<(mutator: ConfigMutator) => void>();
    render(<TypographyPanel config={CYBER_EMERALD_PRESET} mutate={mutate} />);

    fireEvent.change(screen.getByLabelText("Heading font"), {
      target: { value: "Sora" },
    });

    expect(mutate).toHaveBeenCalledTimes(1);
    const mutator = mutate.mock.calls[0]![0];
    const next = mutator(CYBER_EMERALD_PRESET);
    expect(next.typography.fontHeading.startsWith("Sora")).toBe(true);
  });

  it("updates the base font size", () => {
    const mutate = vi.fn<(mutator: ConfigMutator) => void>();
    render(<TypographyPanel config={CYBER_EMERALD_PRESET} mutate={mutate} />);

    fireEvent.change(screen.getByLabelText("Base font size", { exact: false }), {
      target: { value: "18px" },
    });

    const mutator = mutate.mock.calls[0]![0];
    const next = mutator(CYBER_EMERALD_PRESET);
    expect(next.typography.baseFontSize).toBe("18px");
  });
});
