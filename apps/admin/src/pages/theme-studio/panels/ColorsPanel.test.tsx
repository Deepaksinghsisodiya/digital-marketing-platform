import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CYBER_EMERALD_PRESET } from "@nexora/design-tokens";
import { ColorsPanel } from "./ColorsPanel";
import type { ConfigMutator } from "../themeStudioUtils";

describe("ColorsPanel", () => {
  it("edits a light color token and emits a mutator", () => {
    const mutate = vi.fn<(mutator: ConfigMutator) => void>();
    render(
      <ColorsPanel
        config={CYBER_EMERALD_PRESET}
        defaults={CYBER_EMERALD_PRESET}
        mutate={mutate}
      />,
    );

    const field = screen.getByTestId("color-field-Primary");
    const input = within(field).getAllByRole("textbox")[0]!;
    fireEvent.change(input, { target: { value: "#ef4444" } });

    expect(mutate).toHaveBeenCalledTimes(1);
    const mutator = mutate.mock.calls[0]![0];
    const next = mutator(CYBER_EMERALD_PRESET);
    expect(next.colors.light.primary).toBe("#ef4444");
  });

  it("switches to the dark palette and edits dark tokens", () => {
    const mutate = vi.fn<(mutator: ConfigMutator) => void>();
    render(
      <ColorsPanel
        config={CYBER_EMERALD_PRESET}
        defaults={CYBER_EMERALD_PRESET}
        mutate={mutate}
      />,
    );

    fireEvent.click(screen.getByText("dark palette"));
    const field = screen.getByTestId("color-field-Primary");
    const input = within(field).getAllByRole("textbox")[0]!;
    fireEvent.change(input, { target: { value: "#22c55e" } });

    const mutator = mutate.mock.calls[0]![0];
    const next = mutator(CYBER_EMERALD_PRESET);
    expect(next.colors.dark.primary).toBe("#22c55e");
    expect(next.colors.light.primary).toBe(CYBER_EMERALD_PRESET.colors.light.primary);
  });

  it("resets a token to the preset default", () => {
    const mutate = vi.fn<(mutator: ConfigMutator) => void>();
    const edited = {
      ...CYBER_EMERALD_PRESET,
      colors: {
        ...CYBER_EMERALD_PRESET.colors,
        light: { ...CYBER_EMERALD_PRESET.colors.light, primary: "#123456" },
      },
    };
    render(
      <ColorsPanel
        config={edited}
        defaults={CYBER_EMERALD_PRESET}
        mutate={mutate}
      />,
    );

    const field = screen.getByTestId("color-field-Primary");
    fireEvent.click(within(field).getByText("Reset"));
    const mutator = mutate.mock.calls[0]![0];
    const next = mutator(edited);
    expect(next.colors.light.primary).toBe(
      CYBER_EMERALD_PRESET.colors.light.primary,
    );
  });
});
