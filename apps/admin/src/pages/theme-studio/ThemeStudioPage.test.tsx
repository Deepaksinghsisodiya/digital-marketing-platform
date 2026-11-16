import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { CYBER_EMERALD_PRESET } from "@nexora/design-tokens";
import { ThemeStudioPage } from "./ThemeStudioPage";

const mockThemeSummary = {
  id: "theme-1",
  name: "Cyber Emerald",
  slug: "cyber-emerald",
  description: "Default engineering theme",
  isSystem: false,
  isDefault: true,
  isDeleted: false,
  hasDraft: false,
  currentVersion: 1,
  createdAtUtc: new Date().toISOString(),
  updatedAtUtc: null,
};

const mockThemeDetail = {
  id: "theme-1",
  name: "Cyber Emerald",
  slug: "cyber-emerald",
  description: "Default engineering theme",
  isSystem: false,
  isDefault: true,
  isDeleted: false,
  currentVersion: 1,
  versionToken: "TOKEN123",
  configJson: JSON.stringify(CYBER_EMERALD_PRESET),
  draftConfigJson: null,
  createdAtUtc: new Date().toISOString(),
  updatedAtUtc: null,
};

const mockSettings = {
  globalEngineEnabled: true,
  websiteThemeEnabled: true,
  websiteThemeId: "cyber-emerald",
  adminThemeEnabled: true,
  adminThemeId: "cyber-emerald",
  fallbackThemeId: "cyber-emerald",
  versionToken: "TOKEN123",
  updatedAtUtc: null,
};

const saveDraftMock = vi.fn().mockImplementation(() => ({
  unwrap: () =>
    Promise.resolve({
      ...mockThemeDetail,
      draftConfigJson: JSON.stringify(CYBER_EMERALD_PRESET),
    }),
}));

const publishMock = vi.fn().mockImplementation(() => ({
  unwrap: () =>
    Promise.resolve({
      id: "v2",
      themeId: "theme-1",
      versionNumber: 2,
      changeDescription: "Testing publish",
      configJson: JSON.stringify(CYBER_EMERALD_PRESET),
      changedByUserId: "u1",
      changedByEmail: "admin@nexora.local",
      changedAtUtc: new Date().toISOString(),
    }),
}));

vi.mock("../../context/ThemeContext", () => ({
  useTheme: () => ({
    refreshServerTheme: vi.fn(),
  }),
}));

vi.mock("../../store/api/adminApi", () => ({
  useGetThemesQuery: () => ({
    data: [mockThemeSummary],
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
  useGetThemeSettingsQuery: () => ({
    data: mockSettings,
  }),
  useGetThemeByIdQuery: () => ({
    data: mockThemeDetail,
    isFetching: false,
  }),
  useGetThemeVersionsQuery: () => ({
    data: [],
    isFetching: false,
  }),
  useUpdateThemeSettingsMutation: () => [vi.fn()],
  useActivateThemeMutation: () => [vi.fn()],
  useCreateThemeMutation: () => [vi.fn()],
  useSaveThemeDraftMutation: () => [saveDraftMock],
  useDeleteThemeMutation: () => [vi.fn()],
  useDuplicateThemeMutation: () => [vi.fn()],
  usePublishThemeMutation: () => [publishMock],
  useRollbackThemeMutation: () => [vi.fn()],
  useImportThemeMutation: () => [vi.fn()],
}));

describe("ThemeStudioPage integration", () => {
  it("renders the theme studio layout, tabs, preview and header", () => {
    render(
      <MemoryRouter>
        <ThemeStudioPage />
      </MemoryRouter>,
    );

    expect(screen.getByText("Theme Studio")).toBeDefined();
    expect(screen.getAllByText("Cyber Emerald").length).toBeGreaterThan(0);
    expect(screen.getByText("Overview")).toBeDefined();
    expect(screen.getByText("Presets")).toBeDefined();
    expect(screen.getByText("My Themes")).toBeDefined();
    expect(screen.getByText("Colors")).toBeDefined();
    expect(screen.getByText("Typography")).toBeDefined();
    expect(screen.getByText("Components")).toBeDefined();
    expect(screen.getByText("Layout")).toBeDefined();
    expect(screen.getByText("Effects")).toBeDefined();
    expect(screen.getByText("History")).toBeDefined();
    expect(screen.getByText("Advanced")).toBeDefined();
  });

  it("switches navigation sections seamlessly", () => {
    render(
      <MemoryRouter>
        <ThemeStudioPage />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByText("Presets"));
    expect(screen.getByText("Curated Presets")).toBeDefined();

    fireEvent.click(screen.getByText("Colors"));
    expect(screen.getByText("Brand")).toBeDefined();
    expect(screen.getByText("Surfaces")).toBeDefined();

    fireEvent.click(screen.getByText("Typography"));
    expect(screen.getByText("Font Families")).toBeDefined();

    fireEvent.click(screen.getByText("Components"));
    expect(screen.getByText("Component Styles")).toBeDefined();
  });

  it("changes viewport and preview mode buttons", () => {
    render(
      <MemoryRouter>
        <ThemeStudioPage />
      </MemoryRouter>,
    );

    const tabletBtn = screen.getByRole("button", { name: "tablet" });
    fireEvent.click(tabletBtn);
    expect(tabletBtn.className).toContain("shadow-sm");

    const darkBtn = screen.getByRole("button", { name: "dark" });
    fireEvent.click(darkBtn);
    expect(darkBtn.className).toContain("shadow-sm");
  });

  it("opens the publish modal and confirms publication", async () => {
    render(
      <MemoryRouter>
        <ThemeStudioPage />
      </MemoryRouter>,
    );

    const publishButtons = screen.getAllByRole("button", { name: /Publish/i });
    fireEvent.click(publishButtons[0]!);

    expect(screen.getByRole("dialog", { name: "Publish theme" })).toBeDefined();

    const noteInput = screen.getByPlaceholderText("e.g. Refined emerald palette");
    fireEvent.change(noteInput, { target: { value: "Release candidate v2" } });

    const confirmBtn = screen.getByRole("button", { name: "Confirm Publish" });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(saveDraftMock).toHaveBeenCalled();
      expect(publishMock).toHaveBeenCalled();
    });
  });
});
